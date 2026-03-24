import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Business: List my coupons ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const coupons = await prisma.coupon.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { registrations: true } } },
    });

    res.json({ data: coupons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// ── Public: List active coupons ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isActive: true, validUntil: { gte: new Date() } };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { validUntil: "asc" },
        include: {
          business: {
            select: { id: true, name: true, slug: true, image: true, area: { select: { name: true, city: { select: { name: true } } } } },
          },
          _count: { select: { registrations: true } },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    res.json({
      data: coupons,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// ── Register for a coupon ──
router.post("/:id/register", requireAuth, async (req: Request, res: Response) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!coupon || !coupon.isActive || coupon.validUntil < new Date()) {
      res.status(404).json({ error: "Coupon not available" });
      return;
    }

    const { name, phone, whatsapp, age, gender } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const registration = await prisma.couponRegistration.create({
      data: {
        couponId: coupon.id,
        userId: req.user!.userId,
        name,
        phone,
        whatsapp,
        age: age ? Number(age) : undefined,
        gender,
      },
    });

    res.status(201).json({ data: registration });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Already registered for this coupon" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// ── Business: Get registrations for my coupon ──
router.get(
  "/:id/registrations",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const business = await prisma.businessProfile.findUnique({
        where: { userId: req.user!.userId },
      });
      if (!business) {
        res.status(404).json({ error: "Business profile not found" });
        return;
      }

      const coupon = await prisma.coupon.findFirst({
        where: { id: req.params.id, businessId: business.id },
      });
      if (!coupon) {
        res.status(404).json({ error: "Coupon not found" });
        return;
      }

      const registrations = await prisma.couponRegistration.findMany({
        where: { couponId: coupon.id },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: registrations });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  }
);

// ── Public: Get coupon by slug ──
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        business: {
          select: { id: true, name: true, slug: true, image: true, phone1: true, address: true },
        },
      },
    });
    if (!coupon || !coupon.isActive) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    res.json({ data: coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
});

// ── Business: Create coupon ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { code, name, description, image, validFrom, validUntil } = req.body;
    if (!code || !name || !validUntil) {
      res.status(400).json({ error: "code, name, and validUntil are required" });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        slug: `${slug}-${crypto.randomUUID().split("-")[0]}`,
        description,
        image,
        businessId: business.id,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
      },
    });

    res.status(201).json({ data: coupon });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Coupon code already exists" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// ── Business: Update coupon ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const coupon = await prisma.coupon.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    const { code, name, description, image, validFrom, validUntil, isActive } = req.body;

    const updated = await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        ...(code !== undefined && { code: code.toUpperCase() }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(validFrom !== undefined && { validFrom: new Date(validFrom) }),
        ...(validUntil !== undefined && { validUntil: new Date(validUntil) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Coupon code already exists" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// ── Business: Delete coupon ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const coupon = await prisma.coupon.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    await prisma.coupon.delete({ where: { id: coupon.id } });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

export default router;
