import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Business: List my products ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { page = "1", limit: rawLimit, categoryTag } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { businessId: business.id };
    if (categoryTag) where.categoryTag = String(categoryTag);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: {
        page: Number(page),
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ── Business: Add product ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { name, description, brand, sku, packSize, moq, categoryTag, productCategoryId, image, images } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name,
        slug: `${slug}-${crypto.randomUUID().split("-")[0]}`,
        description,
        brand,
        sku,
        packSize,
        moq: moq ? Number(moq) : undefined,
        categoryTag,
        productCategoryId: productCategoryId || undefined,
        image,
        images: images || [],
      },
    });

    res.status(201).json({ data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// ── Business: Update product ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const { name, description, brand, sku, packSize, moq, categoryTag, productCategoryId, image, images, isActive } =
      req.body;

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(brand !== undefined && { brand }),
        ...(sku !== undefined && { sku }),
        ...(packSize !== undefined && { packSize }),
        ...(moq !== undefined && { moq: moq ? Number(moq) : null }),
        ...(categoryTag !== undefined && { categoryTag }),
        ...(productCategoryId !== undefined && { productCategoryId: productCategoryId || null }),
        ...(image !== undefined && { image }),
        ...(images && { images }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ── Business: Delete product ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await prisma.product.delete({ where: { id: product.id } });
    res.json({ message: "Product removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ── Public: get products for a publicly-listed business (no auth) ──
// Not available for WHOLESALER / MANUFACTURER (those are supply-chain restricted)
router.get("/public/:businessId", async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { id: req.params.businessId },
      select: { id: true, status: true, supplyChainRole: true },
    });

    if (!business || business.status !== "ACTIVE") {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    // Products of WHOLESALER / MANUFACTURER are not public
    if (business.supplyChainRole === "WHOLESALER" || business.supplyChainRole === "MANUFACTURER") {
      res.status(403).json({ error: "Products are not publicly accessible for this business" });
      return;
    }

    const { page = "1", limit: rawLimit, search } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { businessId: business.id, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { brand: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true, name: true, slug: true, description: true,
          brand: true, packSize: true, moq: true, image: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ── Auth: View a supplier's products (for buyers) ──
router.get(
  "/supplier/:businessId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const supplier = await prisma.businessProfile.findUnique({
        where: { id: req.params.businessId },
      });
      if (!supplier || supplier.status !== "ACTIVE") {
        res.status(404).json({ error: "Supplier not found" });
        return;
      }

      // Check supply chain access
      const viewer = await prisma.businessProfile.findUnique({
        where: { userId: req.user!.userId },
      });

      if (supplier.supplyChainRole === "WHOLESALER") {
        // Only retailers can see wholesaler products
        if (!viewer || viewer.supplyChainRole !== "RETAILER") {
          res.status(403).json({ error: "Only retailers can view wholesaler products" });
          return;
        }
      } else if (supplier.supplyChainRole === "MANUFACTURER") {
        // Only wholesalers can see manufacturer products
        if (!viewer || viewer.supplyChainRole !== "WHOLESALER") {
          res.status(403).json({ error: "Only wholesalers can view manufacturer products" });
          return;
        }
      }

      const { page = "1", limit: rawLimit, categoryTag, search } = req.query;
      const limit = safeLimit(rawLimit);
      const skip = (Number(page) - 1) * limit;

      const where: any = { businessId: supplier.id, isActive: true };
      if (categoryTag) where.categoryTag = String(categoryTag);
      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: "insensitive" } },
          { brand: { contains: String(search), mode: "insensitive" } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: "asc" },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        data: products,
        pagination: {
          page: Number(page),
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

export default router;
