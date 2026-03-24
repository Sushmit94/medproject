import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── Business: List my services ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const services = await prisma.businessService.findMany({
      where: { businessId: business.id },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ data: services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// ── Business: Add service ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { name, description, image, price, sortOrder } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const service = await prisma.businessService.create({
      data: {
        businessId: business.id,
        name,
        description,
        image,
        price,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    res.status(201).json({ data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add service" });
  }
});

// ── Business: Update service ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const service = await prisma.businessService.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    const { name, description, image, price, sortOrder, isActive } = req.body;
    const updated = await prisma.businessService.update({
      where: { id: service.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(price !== undefined && { price }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// ── Business: Delete service ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const service = await prisma.businessService.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    await prisma.businessService.delete({ where: { id: service.id } });
    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

// ── Public: Get services for a business ──
router.get("/business/:businessId", async (req: Request, res: Response) => {
  try {
    const services = await prisma.businessService.findMany({
      where: { businessId: req.params.businessId, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ data: services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

export default router;
