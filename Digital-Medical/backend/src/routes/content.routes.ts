import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Public: List news ──
router.get("/news", async (req: Request, res: Response) => {
  try {
    const { cityId, type, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isActive: true };
    if (cityId) where.cityId = String(cityId);
    if (type) where.type = String(type);

    const [news, total] = await Promise.all([
      prisma.news.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.news.count({ where }),
    ]);

    res.json({
      data: news,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ── Public: List blogs ──
router.get("/blogs", async (req: Request, res: Response) => {
  try {
    const { cityId, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isActive: true };
    if (cityId) where.cityId = String(cityId);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, excerpt: true, thumbnail: true, createdAt: true },
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      data: blogs,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// ── Public: Get blog by slug ──
router.get("/blogs/:slug", async (req: Request, res: Response) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug: String(req.params.slug) } });
    if (!blog || !blog.isActive) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }
    res.json({ data: blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// ── Public: Gallery ──
router.get("/gallery", async (req: Request, res: Response) => {
  try {
    const { cityId, type, businessId, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = {};
    if (cityId) where.cityId = String(cityId);
    if (type) where.type = String(type);
    if (businessId) where.businessId = String(businessId);

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { business: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.galleryItem.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// ── Admin: Create news ──
router.post(
  "/news",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, link, type, image, cityId } = req.body;
      if (!title || !link || !type) {
        res.status(400).json({ error: "title, link, and type are required" });
        return;
      }

      const news = await prisma.news.create({
        data: { title, link, type, image, cityId },
      });

      res.status(201).json({ data: news });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create news" });
    }
  }
);

// ── Admin: Create blog ──
router.post(
  "/blogs",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, content, excerpt, thumbnail, bannerImage, cityId } = req.body;
      if (!title || !content) {
        res.status(400).json({ error: "title and content are required" });
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const blog = await prisma.blog.create({
        data: {
          title,
          slug: `${slug}-${crypto.randomUUID().split("-")[0]}`,
          content,
          excerpt,
          thumbnail,
          bannerImage,
          cityId,
        },
      });

      res.status(201).json({ data: blog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create blog" });
    }
  }
);

// ── Admin: Add gallery item ──
router.post(
  "/gallery",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { businessId, type, url, caption, cityId } = req.body;
      if (!type || !url) {
        res.status(400).json({ error: "type and url are required" });
        return;
      }

      const item = await prisma.galleryItem.create({
        data: { businessId, type, url, caption, cityId },
      });

      res.status(201).json({ data: item });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add gallery item" });
    }
  }
);

// ── Admin: Update news ──
router.patch(
  "/news/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, link, type, image, cityId, isActive } = req.body;
      const updated = await prisma.news.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(link !== undefined && { link }),
          ...(type !== undefined && { type }),
          ...(image !== undefined && { image }),
          ...(cityId !== undefined && { cityId }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      res.json({ data: updated });
    } catch {
      res.status(500).json({ error: "Failed to update news" });
    }
  }
);

// ── Admin: Delete news ──
router.delete(
  "/news/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.news.delete({ where: { id: req.params.id } });
      res.json({ message: "News deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete news" });
    }
  }
);

// ── Admin: Update blog ──
router.patch(
  "/blogs/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, content, excerpt, thumbnail, bannerImage, cityId, isActive } = req.body;
      const updated = await prisma.blog.update({
        where: { id: req.params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(excerpt !== undefined && { excerpt }),
          ...(thumbnail !== undefined && { thumbnail }),
          ...(bannerImage !== undefined && { bannerImage }),
          ...(cityId !== undefined && { cityId }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      res.json({ data: updated });
    } catch {
      res.status(500).json({ error: "Failed to update blog" });
    }
  }
);

// ── Admin: Delete blog ──
router.delete(
  "/blogs/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.blog.delete({ where: { id: req.params.id } });
      res.json({ message: "Blog deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete blog" });
    }
  }
);

// ── Admin: Delete gallery item ──
router.delete(
  "/gallery/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.galleryItem.delete({ where: { id: req.params.id } });
      res.json({ message: "Gallery item deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete gallery item" });
    }
  }
);

export default router;
