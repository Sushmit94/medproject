import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// ── Public: Get product categories for a given category ──
router.get("/by-category/:categoryId", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { categoryId: req.params.categoryId, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });
    res.json({ data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product categories" });
  }
});

export default router;
