import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Public: List active camps ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const { cityId, upcoming, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isActive: true };
    if (upcoming === "true") {
      where.eventDate = { gte: new Date() };
    }

    const [camps, total] = await Promise.all([
      prisma.camp.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: "asc" },
        include: {
          business: {
            select: { id: true, name: true, slug: true, image: true, area: { select: { name: true, city: { select: { name: true } } } } },
          },
          _count: { select: { registrations: true } },
        },
      }),
      prisma.camp.count({ where }),
    ]);

    res.json({
      data: camps,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch camps" });
  }
});

// ── Register for a camp ──
router.post("/:id/register", requireAuth, async (req: Request, res: Response) => {
  try {
    const camp = await prisma.camp.findUnique({ where: { id: req.params.id } });
    if (!camp || !camp.isActive) {
      res.status(404).json({ error: "Camp not available" });
      return;
    }

    const { name, phone, whatsapp, age, gender } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const registration = await prisma.campRegistration.create({
      data: {
        campId: camp.id,
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
      res.status(409).json({ error: "Already registered for this camp" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// ── Business: Get registrations for my camp ──
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

      const camp = await prisma.camp.findFirst({
        where: { id: req.params.id, businessId: business.id },
      });
      if (!camp) {
        res.status(404).json({ error: "Camp not found" });
        return;
      }

      const registrations = await prisma.campRegistration.findMany({
        where: { campId: camp.id },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: registrations });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  }
);

// ── Public: Get camp by slug ──
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const camp = await prisma.camp.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        business: {
          select: { id: true, name: true, slug: true, image: true, phone1: true, address: true },
        },
      },
    });
    if (!camp || !camp.isActive) {
      res.status(404).json({ error: "Camp not found" });
      return;
    }
    res.json({ data: camp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch camp" });
  }
});

// ── Business: Create camp ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { name, description, image, eventDate, timeFrom, timeTo, venue } = req.body;
    if (!name || !eventDate) {
      res.status(400).json({ error: "name and eventDate are required" });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const camp = await prisma.camp.create({
      data: {
        name,
        slug: `${slug}-${crypto.randomUUID().split("-")[0]}`,
        description,
        image,
        businessId: business.id,
        eventDate: new Date(eventDate),
        timeFrom,
        timeTo,
        venue,
      },
    });

    res.status(201).json({ data: camp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create camp" });
  }
});

// ── Business: Update camp ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const camp = await prisma.camp.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!camp) {
      res.status(404).json({ error: "Camp not found" });
      return;
    }

    const { name, description, image, eventDate, timeFrom, timeTo, venue, isActive } = req.body;

    const updated = await prisma.camp.update({
      where: { id: camp.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(timeFrom !== undefined && { timeFrom }),
        ...(timeTo !== undefined && { timeTo }),
        ...(venue !== undefined && { venue }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update camp" });
  }
});

// ── Business: Delete camp ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const camp = await prisma.camp.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!camp) {
      res.status(404).json({ error: "Camp not found" });
      return;
    }

    await prisma.camp.delete({ where: { id: camp.id } });
    res.json({ message: "Camp deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete camp" });
  }
});

export default router;
