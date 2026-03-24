import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── Business: List my deals ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const deals = await prisma.businessDeal.findMany({
      where: { businessId: business.id },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ data: deals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
});

// ── Business: Add deal ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { title, description, image, sortOrder } = req.body;
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    const deal = await prisma.businessDeal.create({
      data: {
        businessId: business.id,
        title,
        description,
        image,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    res.status(201).json({ data: deal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add deal" });
  }
});

// ── Business: Update deal ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const deal = await prisma.businessDeal.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!deal) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }

    const { title, description, image, sortOrder, isActive } = req.body;
    const updated = await prisma.businessDeal.update({
      where: { id: deal.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update deal" });
  }
});

// ── Business: Delete deal ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const deal = await prisma.businessDeal.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!deal) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }

    await prisma.businessDeal.delete({ where: { id: deal.id } });
    res.json({ message: "Deal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete deal" });
  }
});

// ── Public: Get deals for a business ──
router.get("/business/:businessId", async (req: Request, res: Response) => {
  try {
    const deals = await prisma.businessDeal.findMany({
      where: { businessId: req.params.businessId, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ data: deals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
});

export default router;
