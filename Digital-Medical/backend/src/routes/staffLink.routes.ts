import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { isProfessional, canLinkTo, LINKING_RULES } from "../utils/categoryHelpers.js";

const router = Router();

// Helper: get caller's business profile with category
async function getCallerBusiness(userId: string) {
  return prisma.businessProfile.findUnique({
    where: { userId },
    include: { category: { select: { slug: true, name: true } } },
  });
}

// ── Search for linkable professionals by name or phone ──
router.get("/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.length < 3) {
      res.status(400).json({ error: "Search query must be at least 3 characters" });
      return;
    }

    const callerBusiness = await getCallerBusiness(req.user!.userId);
    console.log("🔍 Caller slug:", callerBusiness?.category?.slug);
    console.log("🔍 Allowed slugs:", LINKING_RULES[callerBusiness?.category?.slug ?? '']);
    if (!callerBusiness) {
      res.status(403).json({ error: "Only business owners can search" });
      return;
    }

    // Professionals cannot search for targets to link
    if (isProfessional(callerBusiness.category.slug)) {
      res.status(403).json({ error: "Professionals cannot send link requests" });
      return;
    }

    // Get allowed target slugs based on LINKING_RULES
    const allowedSlugs = LINKING_RULES[callerBusiness.category.slug] ?? [];
    if (allowedSlugs.length === 0) {
      res.json({ data: [] });
      return;
    }

    // Find matching business profiles whose category slug is in allowed targets
    const profiles = await prisma.businessProfile.findMany({
      where: {
        category: { slug: { in: allowedSlugs } },
        userId: { not: req.user!.userId },
        user: { isActive: true },
        //status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone1: { contains: q } },
          { user: { phone: { contains: q } } },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        phone1: true,
        address: true,
        category: { select: { name: true, slug: true } },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        staff: {
          where: { linkedUserId: { not: null } },
          select: { linkedUserId: true },
        },
      },
      take: 20,
    });

    // Exclude profiles that are already linked (have a StaffMember with linkedUserId pointing to them)
    const alreadyLinkedUserIds = new Set<string>();
    const linkedStaff = await prisma.staffMember.findMany({
      where: { linkedUserId: { not: null } },
      select: { linkedUserId: true },
    });
    linkedStaff.forEach((s) => {
      if (s.linkedUserId) alreadyLinkedUserIds.add(s.linkedUserId);
    });

    const results = profiles
      .filter((p) => !alreadyLinkedUserIds.has(p.user.id))
      .map((p) => ({
        id: p.user.id,
        name: p.user.name,
        phone: p.user.phone,
        avatar: p.user.avatar,
        business: {
          id: p.id,
          name: p.name,
          image: p.image,
          category: { name: p.category.name },
          address: p.address,
        },
      }));

    res.json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ── Owner: Send a link request ──
router.post("/request", requireAuth, async (req: Request, res: Response) => {
  try {
    const callerBusiness = await getCallerBusiness(req.user!.userId);
    if (!callerBusiness) {
      res.status(403).json({ error: "Only business owners can send link requests" });
      return;
    }

    // Professionals cannot send link requests
    if (isProfessional(callerBusiness.category.slug)) {
      res.status(403).json({ error: "Professionals cannot send link requests" });
      return;
    }

    const { targetUserId, message } = req.body;
    if (!targetUserId) {
      res.status(400).json({ error: "targetUserId is required" });
      return;
    }

    // Verify target user exists and is a BUSINESS user
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, role: "BUSINESS", isActive: true },
      include: {
        business: {
          include: { category: { select: { slug: true, name: true } } },
        },
      },
    });
    if (!targetUser || !targetUser.business) {
      res.status(404).json({ error: "Target user not found" });
      return;
    }

    // Check canLinkTo
    if (!canLinkTo(callerBusiness.category.slug, targetUser.business.category.slug)) {
      res.status(403).json({
        error: `${callerBusiness.category.name} cannot link to ${targetUser.business.category.name}`,
      });
      return;
    }

    // Check if already linked somewhere
    const existingLink = await prisma.staffMember.findFirst({
      where: { linkedUserId: targetUserId },
    });
    if (existingLink) {
      res.status(409).json({ error: "This professional is already linked to a business" });
      return;
    }

    // Check for existing pending request
    const existing = await prisma.staffLinkRequest.findFirst({
      where: {
        businessId: callerBusiness.id,
        targetUserId,
        status: "PENDING",
      },
    });
    if (existing) {
      res.status(409).json({ error: "A pending request already exists" });
      return;
    }

    // Upsert: if previously rejected/cancelled, create a new one
    const linkRequest = await prisma.staffLinkRequest.upsert({
      where: {
        businessId_targetUserId: {
          businessId: callerBusiness.id,
          targetUserId,
        },
      },
      create: {
        businessId: callerBusiness.id,
        targetUserId,
        message: message || null,
        status: "PENDING",
      },
      update: {
        message: message || null,
        status: "PENDING",
      },
    });

    // Create notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "STAFF_LINK",
        title: "Staff Link Request",
        message: `${callerBusiness.name} wants to add you as staff.`,
        link: "/business/linked",
      },
    });

    res.status(201).json({ data: linkRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send link request" });
  }
});

// ── Owner: List sent requests ──
router.get("/requests/sent", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const requests = await prisma.staffLinkRequest.findMany({
      where: { businessId: business.id },
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            business: {
              select: { name: true, image: true, category: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent requests" });
  }
});

// ── Professional: List incoming requests ──
router.get("/requests/incoming", requireAuth, async (req: Request, res: Response) => {
  try {
    const requests = await prisma.staffLinkRequest.findMany({
      where: { targetUserId: req.user!.userId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            image: true,
            address: true,
            phone1: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch incoming requests" });
  }
});

// ── Professional: Accept a link request ──
router.post("/requests/:id/accept", requireAuth, async (req: Request, res: Response) => {
  try {
    const linkRequest = await prisma.staffLinkRequest.findFirst({
      where: { id: req.params.id, targetUserId: req.user!.userId, status: "PENDING" },
      include: { business: true },
    });
    if (!linkRequest) {
      res.status(404).json({ error: "Request not found or already handled" });
      return;
    }

    // Check if this professional is already linked to any business
    const existingLink = await prisma.staffMember.findFirst({
      where: { linkedUserId: req.user!.userId },
    });
    if (existingLink) {
      res.status(409).json({ error: "You are already linked to a business. Unlink first to accept a new request." });
      return;
    }

    // Get the professional's profile to auto-populate staff entry
    const professionalUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        business: {
          select: { name: true, image: true, phone1: true, email: true, designation: true, category: { select: { name: true } } },
        },
      },
    });

    // Create linked staff member + update request status in a transaction
    await prisma.$transaction([
      prisma.staffLinkRequest.update({
        where: { id: linkRequest.id },
        data: { status: "ACCEPTED" },
      }),
      prisma.staffMember.create({
        data: {
          businessId: linkRequest.businessId,
          linkedUserId: req.user!.userId,
          name: professionalUser?.name || "Staff",
          role: professionalUser?.business?.designation || professionalUser?.business?.category?.name || "Staff",
          phone: professionalUser?.phone || null,
          email: professionalUser?.business?.email || null,
          photo: professionalUser?.business?.image || null,
        },
      }),
      // Notify the business owner
      prisma.notification.create({
        data: {
          userId: linkRequest.business.userId,
          type: "STAFF_LINK",
          title: "Link Request Accepted",
          message: `${professionalUser?.name} accepted your staff link request.`,
          link: "/business/staff",
        },
      }),
    ]);

    res.json({ message: "Link request accepted. You are now listed as staff." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept request" });
  }
});

// ── Professional: Reject a link request ──
router.post("/requests/:id/reject", requireAuth, async (req: Request, res: Response) => {
  try {
    const linkRequest = await prisma.staffLinkRequest.findFirst({
      where: { id: req.params.id, targetUserId: req.user!.userId, status: "PENDING" },
      include: { business: true },
    });
    if (!linkRequest) {
      res.status(404).json({ error: "Request not found or already handled" });
      return;
    }

    await prisma.$transaction([
      prisma.staffLinkRequest.update({
        where: { id: linkRequest.id },
        data: { status: "REJECTED" },
      }),
      prisma.notification.create({
        data: {
          userId: linkRequest.business.userId,
          type: "STAFF_LINK",
          title: "Link Request Declined",
          message: `Your staff link request was declined.`,
          link: "/business/staff",
        },
      }),
    ]);

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

// ── Owner: Cancel a pending request ──
router.delete("/requests/:id/cancel", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const linkRequest = await prisma.staffLinkRequest.findFirst({
      where: { id: req.params.id, businessId: business.id, status: "PENDING" },
    });
    if (!linkRequest) {
      res.status(404).json({ error: "Pending request not found" });
      return;
    }

    await prisma.staffLinkRequest.update({
      where: { id: linkRequest.id },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Request cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel request" });
  }
});

// ── Either side: Unlink a staff member ──
router.delete("/:staffId/unlink", requireAuth, async (req: Request, res: Response) => {
  try {
    const staffMember = await prisma.staffMember.findUnique({
      where: { id: req.params.staffId },
      include: { business: true },
    });
    if (!staffMember || !staffMember.linkedUserId) {
      res.status(404).json({ error: "Linked staff member not found" });
      return;
    }

    // Verify caller is either the business owner or the linked professional
    const isOwner = staffMember.business.userId === req.user!.userId;
    const isProfessionalUser = staffMember.linkedUserId === req.user!.userId;

    if (!isOwner && !isProfessionalUser) {
      res.status(403).json({ error: "Not authorized to unlink" });
      return;
    }

    // Delete the staff entry and update the link request
    await prisma.$transaction([
      prisma.staffMember.delete({ where: { id: staffMember.id } }),
      // Update any accepted link request to CANCELLED
      prisma.staffLinkRequest.updateMany({
        where: {
          businessId: staffMember.businessId,
          targetUserId: staffMember.linkedUserId!,
          status: "ACCEPTED",
        },
        data: { status: "CANCELLED" },
      }),
      // Notify the other party
      prisma.notification.create({
        data: {
          userId: isOwner ? staffMember.linkedUserId! : staffMember.business.userId,
          type: "STAFF_LINK",
          title: "Staff Unlinked",
          message: isOwner
            ? `${staffMember.business.name} has removed you from their staff.`
            : `A linked staff member has left your organization.`,
          link: isOwner ? "/business/linked" : "/business/staff",
        },
      }),
    ]);

    res.json({ message: "Staff member unlinked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unlink staff member" });
  }
});

// ── Professional: Check my link status ──
router.get("/my-link", requireAuth, async (req: Request, res: Response) => {
  try {
    const linkedStaff = await prisma.staffMember.findFirst({
      where: { linkedUserId: req.user!.userId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            image: true,
            address: true,
            phone1: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    res.json({ data: linkedStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check link status" });
  }
});

export default router;
