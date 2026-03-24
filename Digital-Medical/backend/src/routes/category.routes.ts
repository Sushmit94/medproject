import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const HIDDEN_CATEGORY_SLUGS = ["wholesalers", "manufacturers"];

// ── List all active categories ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === "true";
    const categories = await prisma.category.findMany({
      where: { isActive: true, ...(includeAll ? {} : { slug: { notIn: HIDDEN_CATEGORY_SLUGS } }) },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { businesses: { where: { status: "ACTIVE", supplyChainRole: { notIn: ["WHOLESALER", "MANUFACTURER"] } } } } },
      },
    });
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ── Get category with subcategories ──
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    if (HIDDEN_CATEGORY_SLUGS.includes(slug)) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          include: {
            _count: { select: { businesses: { where: { business: { status: "ACTIVE", supplyChainRole: { notIn: ["WHOLESALER", "MANUFACTURER"] } } } } } },
          },
        },
      },
    });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(category);
  } catch {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// ── Admin: Create category ──
router.post(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { name, slug, image, description, sortOrder, isService } = req.body;
      const category = await prisma.category.create({
        data: { name, slug, image, description, sortOrder, isService },
      });
      res.status(201).json(category);
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Category with this name or slug already exists" });
        return;
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);

// ── Admin: Create subcategory ──
router.post(
  "/:categoryId/subcategories",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { name, slug, icon } = req.body;
      const sub = await prisma.subCategory.create({
        data: {
          name,
          slug,
          icon,
          categoryId: String(req.params.categoryId),
        },
      });
      res.status(201).json(sub);
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Subcategory slug already exists in this category" });
        return;
      }
      res.status(500).json({ error: "Failed to create subcategory" });
    }
  }
);

// ── Admin: Update category ──
router.patch(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { name, slug, image, description, sortOrder, isService, isActive } = req.body;
      const updated = await prisma.category.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(image !== undefined && { image }),
          ...(description !== undefined && { description }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(isService !== undefined && { isService }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      res.json(updated);
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Category with this slug already exists" });
        return;
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);

// ── Admin: Delete category ──
router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.category.delete({ where: { id: req.params.id } });
      res.json({ message: "Category deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);

export default router;
