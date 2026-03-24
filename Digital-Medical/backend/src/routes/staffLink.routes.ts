import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── Search for a business user by phone (owner searches for doctor) ──
router.get("/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    if (!phone || typeof phone !== "string" || phone.length < 10) {
      res.status(400).json({ error: "Valid phone number required" });
      return;
    }

    const ownerBusiness = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!ownerBusiness) {
      res.status(403).json({ error: "Only business owners can search" });
      return;
    }

    // Find a BUSINESS user with that phone (not themselves)
    const targetUser = await prisma.user.findFirst({
      where: {
        phone,
        role: "BUSINESS",
        id: { not: req.user!.userId },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        business: {
          select: {
            id: true,
            name: true,
            image: true,
            category: { select: { name: true } },
            address: true,
          },
        },
      },
    });

    if (!targetUser || !targetUser.business) {
      res.status(404).json({ error: "No registered business profile found for this phone number" });
      return;
    }

    // Check if already linked somewhere
    const existingLink = await prisma.staffMember.findFirst({
      where: { linkedUserId: targetUser.id },
      include: { business: { select: { name: true } } },
    });
    if (existingLink) {
      res.status(409).json({
        error: `This professional is already linked to "${existingLink.business.name}". They must unlink first.`,
      });
      return;
    }

    // Check if there's already a pending request from this business
    const existingRequest = await prisma.staffLinkRequest.findFirst({
      where: {
        businessId: ownerBusiness.id,
        targetUserId: targetUser.id,
        status: "PENDING",
      },
    });
    if (existingRequest) {
      res.status(409).json({ error: "A pending request already exists for this person" });
      return;
    }

    res.json({ data: targetUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ── Owner: Send a link request ──
router.post("/request", requireAuth, async (req: Request, res: Response) => {
  try {
    const ownerBusiness = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!ownerBusiness) {
      res.status(403).json({ error: "Only business owners can send link requests" });
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
    });
    if (!targetUser) {
      res.status(404).json({ error: "Target user not found" });
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
        businessId: ownerBusiness.id,
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
          businessId: ownerBusiness.id,
          targetUserId,
        },
      },
      create: {
        businessId: ownerBusiness.id,
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
        message: `${ownerBusiness.name} wants to add you as staff.`,
        link: "/business/staff",
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

// ── Doctor: List incoming requests ──
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

// ── Doctor: Accept a link request ──
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

    // Check if this doctor is already linked to any business
    const existingLink = await prisma.staffMember.findFirst({
      where: { linkedUserId: req.user!.userId },
    });
    if (existingLink) {
      res.status(409).json({ error: "You are already linked to a business. Unlink first to accept a new request." });
      return;
    }

    // Get the doctor's profile to auto-populate staff entry
    const doctorUser = await prisma.user.findUnique({
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
          name: doctorUser?.name || "Staff",
          role: doctorUser?.business?.designation || doctorUser?.business?.category?.name || "Doctor",
          phone: doctorUser?.phone || null,
          email: doctorUser?.business?.email || null,
          photo: doctorUser?.business?.image || null,
        },
      }),
      // Notify the business owner
      prisma.notification.create({
        data: {
          userId: linkRequest.business.userId,
          type: "STAFF_LINK",
          title: "Link Request Accepted",
          message: `${doctorUser?.name} accepted your staff link request.`,
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

// ── Doctor: Reject a link request ──
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

    // Verify caller is either the business owner or the linked doctor
    const isOwner = staffMember.business.userId === req.user!.userId;
    const isDoctor = staffMember.linkedUserId === req.user!.userId;

    if (!isOwner && !isDoctor) {
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
          link: "/business/staff",
        },
      }),
    ]);

    res.json({ message: "Staff member unlinked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unlink staff member" });
  }
});

// ── Doctor: Check my link status ──
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
