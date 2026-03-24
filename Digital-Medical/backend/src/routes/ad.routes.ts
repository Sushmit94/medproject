import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Public: Get active ads for a placement ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const { placement, categoryId, cityId, areaId } = req.query;

    const where: any = { isActive: true };
    if (placement) where.placement = String(placement);
    if (categoryId) where.categoryId = String(categoryId);

    // Date-based filtering
    where.startDate = { lte: new Date() };
    where.OR = [{ endDate: null }, { endDate: { gte: new Date() } }];

    // Area-based filtering
    if (areaId) {
      where.areas = { some: { areaId: String(areaId) } };
    }

    const ads = await prisma.ad.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        areas: { include: { area: { select: { name: true } } } },
      },
    });

    res.json({ data: ads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

// ── Admin: Create ad ──
router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, image, link, placement, categoryId, cityId, startDate, endDate, areaIds } =
        req.body;

      if (!image || !placement) {
        res.status(400).json({ error: "image and placement are required" });
        return;
      }

      const ad = await prisma.ad.create({
        data: {
          title,
          image,
          link,
          placement,
          categoryId,
          cityId,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : undefined,
          ...(areaIds?.length && {
            areas: {
              create: areaIds.map((areaId: string) => ({ areaId })),
            },
          }),
        },
        include: { areas: true },
      });

      res.status(201).json({ data: ad });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create ad" });
    }
  }
);

// ── Admin: Update ad ──
router.patch(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, image, link, placement, categoryId, cityId, startDate, endDate, isActive } =
        req.body;

      const ad = await prisma.ad.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(image && { image }),
          ...(link !== undefined && { link }),
          ...(placement && { placement }),
          ...(categoryId !== undefined && { categoryId }),
          ...(cityId !== undefined && { cityId }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ data: ad });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update ad" });
    }
  }
);

// ── Admin: Delete ad ──
router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.ad.delete({ where: { id: req.params.id } });
      res.json({ message: "Ad deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete ad" });
    }
  }
);

export default router;
