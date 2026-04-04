import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { verifyToken } from "../lib/auth.js";
import { safeLimit } from "../lib/utils.js";
import { sendApprovalWA, sendRejectionWA } from "../lib/whatsapp.js";
import { sendApprovalEmail, sendRejectionEmail } from "../lib/email.js";

const router = Router();

// ── Public: List businesses (with filters) ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      subCategoryId,
      areaId,
      cityId,
      isPopular,
      isEmergency,
      supplyChainRole,
      page = "1",
      limit: rawLimit,
    } = req.query;

    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    // Build where clause
    const where: any = { status: "ACTIVE" };
    if (categoryId) where.categoryId = String(categoryId);
    if (areaId) where.areaId = String(areaId);
    if (isPopular === "true") where.isPopular = true;
    if (isEmergency === "true") where.isEmergency = true;
    if (supplyChainRole) where.supplyChainRole = String(supplyChainRole);

    // Wholesalers & Manufacturers are NOT public — require auth with proper role
    if (
      supplyChainRole === "WHOLESALER" ||
      supplyChainRole === "MANUFACTURER"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Login required to view this listing" });
        return;
      }

      try {
        const tokenPayload = verifyToken(authHeader.slice(7));
        const viewer = await prisma.businessProfile.findUnique({
          where: { userId: tokenPayload.userId },
        });

        if (supplyChainRole === "WHOLESALER" && (!viewer || viewer.supplyChainRole !== "RETAILER")) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
        if (supplyChainRole === "MANUFACTURER" && (!viewer || viewer.supplyChainRole !== "WHOLESALER")) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
      } catch {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
    } else if (!supplyChainRole) {
      where.OR = [
        { supplyChainRole: null },
        { supplyChainRole: { notIn: ["WHOLESALER", "MANUFACTURER"] } },
      ];
    }
    if (subCategoryId) {
      where.subcategories = { some: { subCategoryId: String(subCategoryId) } };
    }

    // City filter via area
    if (cityId && !areaId) {
      where.area = { cityId: String(cityId) };
    }

    const [businesses, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { subscriptionTier: "desc" }, // Premium first
          { isPopular: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          businessId: true,
          name: true,
          slug: true,
          image: true,
          address: true,
          phone1: true,
          designation: true,
          isPopular: true,
          isVerified: true,
          subscriptionTier: true,
          category: { select: { id: true, name: true, slug: true } },
          area: {
            select: {
              id: true,
              name: true,
              city: { select: { id: true, name: true } },
            },
          },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    res.json({
      data: businesses,
      pagination: {
        page: Number(page),
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

// ── Business owner: Get own profile ──
router.get("/me", requireAuth, requireRole("BUSINESS"), async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { name: true } },
        category: true,
        subcategories: { include: { subCategory: true } },
        area: { include: { city: { include: { district: { include: { state: true } } } } } },
        staff: { where: { isActive: true } },
        gallery: { take: 20, orderBy: { createdAt: "desc" } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        licenses: { select: { type: true, status: true, expiryDate: true } },
        _count: { select: { reviews: true } },
      },
    });

    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ── Public: Get single business detail ──
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { slug: req.params.slug },
      include: {
        user: { select: { name: true } },
        category: true,
        subcategories: { include: { subCategory: true } },
        area: { include: { city: { include: { district: { include: { state: true } } } } } },
        staff: { where: { isActive: true } },
        gallery: { take: 20, orderBy: { createdAt: "desc" } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        licenses: {
          where: { status: "VERIFIED" },
          select: { type: true, status: true, expiryDate: true },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    // Block public access to Wholesalers/Manufacturers
    if (
      business.supplyChainRole === "WHOLESALER" ||
      business.supplyChainRole === "MANUFACTURER"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Login required to view this listing" });
        return;
      }

      try {
        const tokenPayload = verifyToken(authHeader.slice(7));
        const viewer = await prisma.businessProfile.findUnique({
          where: { userId: tokenPayload.userId },
        });

        if (business.supplyChainRole === "WHOLESALER" && (!viewer || viewer.supplyChainRole !== "RETAILER")) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
        if (business.supplyChainRole === "MANUFACTURER" && (!viewer || viewer.supplyChainRole !== "WHOLESALER")) {
          res.status(403).json({ error: "Access denied" });
          return;
        }
      } catch {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
    }

    res.json(business);
  } catch {
    res.status(500).json({ error: "Failed to fetch business" });
  }
});

// ── Business owner: Update own profile ──
router.patch(
  "/me",
  requireAuth,
  requireRole("BUSINESS"),
  async (req: Request, res: Response) => {
    try {
      const business = await prisma.businessProfile.findUnique({
        where: { userId: req.user!.userId },
      });
      if (!business) {
        res.status(404).json({ error: "Business profile not found" });
        return;
      }

      const allowedFields = [
        "about", "address", "phone1", "phone2", "phone3",
        "whatsapp", "email", "website", "qualifications", "workExperience", "facebook", "instagram",
        "youtube", "googleMaps", "morningOpen", "morningClose",
        "eveningOpen", "eveningClose", "image", "coverImage", "designation", "areaId",
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          // Treat empty string as null for nullable FK fields to prevent DB constraint errors
          updateData[field] = (field === "areaId" && req.body[field] === "") ? null : req.body[field];
        }
      }

      // Numeric coordinate fields
      if (typeof req.body.latitude === "number") updateData.latitude = req.body.latitude;
      if (typeof req.body.longitude === "number") updateData.longitude = req.body.longitude;

      const updated = await prisma.businessProfile.update({
        where: { id: business.id },
        data: updateData,
      });

      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// ── Admin: Update any business ──
router.patch(
  "/:id/admin",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const adminAllowedFields = [
        "status", "isPopular", "isVerified", "isEmergency",
        "subscriptionTier", "subscriptionExpiresAt",
        "about", "address", "phone1", "phone2", "phone3",
        "whatsapp", "email", "website", "facebook", "instagram",
        "youtube", "googleMaps", "morningOpen", "morningClose",
        "eveningOpen", "eveningClose", "image", "coverImage", "designation",
        "supplyChainRole",
      ];

      const updateData: Record<string, unknown> = {};
      for (const field of adminAllowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const updated = await prisma.businessProfile.update({
        where: { id: req.params.id },
        data: updateData,
      });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update business" });
    }
  }
);

// ── Admin: Approve / Reject a business ──
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["ACTIVE", "DISABLED", "REJECTED"].includes(status)) {
        res.status(400).json({ error: "Invalid status" });
        return;
      }

      const updated = await prisma.businessProfile.update({
        where: { id: req.params.id },
        data: { status },
        include: { user: { select: { phone: true, email: true } } },
      });

      // Notify the business owner (in-app)
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: "SYSTEM",
          title: status === "ACTIVE"
            ? "Listing Approved!"
            : "Listing Update",
          message: status === "ACTIVE"
            ? "Your business listing has been approved and is now live."
            : `Your listing status has been updated to ${status}.`,
        },
      });

      // WhatsApp & email notifications (non-blocking)
      const phone = updated.user.phone;
      const email = updated.user.email;
      if (status === "ACTIVE") {
        sendApprovalWA(phone, updated.name).catch(() => { });
        if (email) sendApprovalEmail(email, updated.name).catch(() => { });
      } else if (status === "REJECTED") {
        sendRejectionWA(phone, updated.name).catch(() => { });
        if (email) sendRejectionEmail(email, updated.name).catch(() => { });
      }

      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

export default router;
