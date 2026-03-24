import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Business: List my licenses ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const licenses = await prisma.license.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: licenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch licenses" });
  }
});

// ── Business: Add a license ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { type, licenseNo, issuedBy, issueDate, expiryDate, document } = req.body;
    if (!type || !licenseNo) {
      res.status(400).json({ error: "type and licenseNo are required" });
      return;
    }

    const license = await prisma.license.create({
      data: {
        businessId: business.id,
        type,
        licenseNo,
        issuedBy,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        document,
        status: "PENDING",
      },
    });

    res.status(201).json({ data: license });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add license" });
  }
});

// ── Business: Update a license ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const license = await prisma.license.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!license) {
      res.status(404).json({ error: "License not found" });
      return;
    }

    const { type, licenseNo, issuedBy, issueDate, expiryDate, document } = req.body;
    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        ...(type && { type }),
        ...(licenseNo && { licenseNo }),
        ...(issuedBy !== undefined && { issuedBy }),
        ...(issueDate !== undefined && { issueDate: issueDate ? new Date(issueDate) : null }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(document !== undefined && { document }),
        status: "PENDING", // reset to pending on update
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update license" });
  }
});

// ── Admin: List all licenses (with filters) ──
router.get(
  "/admin/all",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status, page = "1", limit: rawLimit } = req.query;
      const where: any = {};
      if (status) where.status = String(status);

      const limit = safeLimit(rawLimit);
      const skip = (Number(page) - 1) * limit;

      const [licenses, total] = await Promise.all([
        prisma.license.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            business: {
              select: { id: true, businessId: true, name: true, phone1: true },
            },
          },
        }),
        prisma.license.count({ where }),
      ]);

      res.json({
        data: licenses,
        pagination: {
          page: Number(page),
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch licenses" });
    }
  }
);

// ── Admin: Verify / Reject a license ──
router.patch(
  "/admin/:id/verify",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status, rejectionNote } = req.body;
      if (!["VERIFIED", "REJECTED"].includes(status)) {
        res.status(400).json({ error: "status must be VERIFIED or REJECTED" });
        return;
      }

      const license = await prisma.license.findUnique({
        where: { id: req.params.id },
        include: { business: { include: { user: true } } },
      }) as any;
      if (!license) {
        res.status(404).json({ error: "License not found" });
        return;
      }

      const updated = await prisma.license.update({
        where: { id: license.id },
        data: {
          status,
          verifiedAt: new Date(),
          verifiedBy: req.user!.userId,
          rejectionNote: status === "REJECTED" ? rejectionNote : null,
        },
      });

      // Notify the business owner
      await prisma.notification.create({
        data: {
          userId: license.business.userId,
          type: status === "VERIFIED" ? "SYSTEM" : "SYSTEM",
          title: status === "VERIFIED" ? "License Verified" : "License Rejected",
          message:
            status === "VERIFIED"
              ? `Your ${license.type} license (${license.licenseNo}) has been verified.`
              : `Your ${license.type} license (${license.licenseNo}) was rejected. ${rejectionNote || ""}`,
        },
      });

      res.json({ data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to verify license" });
    }
  }
);

// ── Admin: Expiring licenses report ──
router.get(
  "/admin/expiring",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { days = "30" } = req.query;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + Number(days));

      const licenses = await prisma.license.findMany({
        where: {
          status: "VERIFIED",
          expiryDate: { lte: cutoff, gte: new Date() },
        },
        orderBy: { expiryDate: "asc" },
        include: {
          business: {
            select: { id: true, businessId: true, name: true, phone1: true, whatsapp: true },
          },
        },
      });

      res.json({ data: licenses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch expiring licenses" });
    }
  }
);

export default router;
