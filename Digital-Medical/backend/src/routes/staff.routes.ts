import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Business: List my staff ──s
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const staff = await prisma.staffMember.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// ── Business: Add staff member ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { name, role, phone, whatsapp, email, photo, birthday, anniversary, licenseNo } =
      req.body;
    if (!name || !role) {
      res.status(400).json({ error: "name and role are required" });
      return;
    }

    const member = await prisma.staffMember.create({
      data: {
        businessId: business.id,
        name,
        role,
        phone,
        whatsapp,
        email,
        photo,
        birthday: birthday ? new Date(birthday) : undefined,
        anniversary: anniversary ? new Date(anniversary) : undefined,
        licenseNo,
      },
    });

    res.status(201).json({ data: member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add staff member" });
  }
});

// ── Business: Update staff member ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const member = await prisma.staffMember.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!member) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    const { name, role, phone, whatsapp, email, photo, birthday, anniversary, licenseNo, isActive } =
      req.body;

    const updated = await prisma.staffMember.update({
      where: { id: member.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(email !== undefined && { email }),
        ...(photo !== undefined && { photo }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(anniversary !== undefined && { anniversary: anniversary ? new Date(anniversary) : null }),
        ...(licenseNo !== undefined && { licenseNo }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update staff member" });
  }
});

// ── Business: Delete staff member ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const member = await prisma.staffMember.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!member) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    await prisma.staffMember.delete({ where: { id: member.id } });
    res.json({ message: "Staff member removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete staff member" });
  }
});

// ── Admin: Today's birthdays & anniversaries ──
router.get(
  "/celebrations/today",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Use raw query for date part matching
      const birthdays = await prisma.$queryRawUnsafe<any[]>(
        `SELECT sm.*, bp."name" as "businessName", bp."businessId" as "businessCode"
         FROM "StaffMember" sm
         JOIN "BusinessProfile" bp ON sm."businessId" = bp."id"
         WHERE sm."isActive" = true
         AND sm."birthday" IS NOT NULL
         AND EXTRACT(MONTH FROM sm."birthday") = $1
         AND EXTRACT(DAY FROM sm."birthday") = $2`,
        month,
        day
      );

      const anniversaries = await prisma.$queryRawUnsafe<any[]>(
        `SELECT sm.*, bp."name" as "businessName", bp."businessId" as "businessCode"
         FROM "StaffMember" sm
         JOIN "BusinessProfile" bp ON sm."businessId" = bp."id"
         WHERE sm."isActive" = true
         AND sm."anniversary" IS NOT NULL
         AND EXTRACT(MONTH FROM sm."anniversary") = $1
         AND EXTRACT(DAY FROM sm."anniversary") = $2`,
        month,
        day
      );

      res.json({ data: { birthdays, anniversaries } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch celebrations" });
    }
  }
);

export default router;
