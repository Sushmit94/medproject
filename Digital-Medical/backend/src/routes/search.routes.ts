import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { safeLimit } from "../lib/utils.js";
import { verifyToken } from "../lib/auth.js";

const router = Router();

// ── Global search across all businesses ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const { q, cityId, areaId, page = "1", limit = "20" } = req.query;

    if (!q || typeof q !== "string" || q.length < 2) {
      res.status(400).json({ error: "Search query must be at least 2 characters" });
      return;
    }

    const take = safeLimit(limit);
    const skip = (Number(page) - 1) * take;
    const searchTerm = q.trim();

    // Search in business name + search keywords
    const where: any = {
      status: "ACTIVE",
      // Exclude wholesalers and manufacturers from public search
      OR: [
        { supplyChainRole: null },
        { supplyChainRole: "RETAILER" },
      ],
      AND: [
        {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { searchKeywords: { some: { keyword: { contains: searchTerm, mode: "insensitive" } } } },
            { category: { name: { contains: searchTerm, mode: "insensitive" } } },
            { designation: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      ],
    };

    // Location filter
    if (areaId) {
      where.areaId = areaId;
    } else if (cityId) {
      where.area = { cityId };
    }

    const [results, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        skip,
        take,
        orderBy: [
          { subscriptionTier: "desc" },
          { isPopular: "desc" },
          { name: "asc" },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          address: true,
          phone1: true,
          designation: true,
          isPopular: true,
          isVerified: true,
          subscriptionTier: true,
          category: { select: { name: true, slug: true } },
          area: {
            select: {
              name: true,
              city: { select: { name: true } },
            },
          },
        },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    res.json({
      data: results,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// ── Product search (for logged-in retailers/wholesalers) ──
router.get("/products", async (req: Request, res: Response) => {
  try {
    const { q, page = "1", limit = "20" } = req.query;

    if (!q || typeof q !== "string" || q.length < 2) {
      res.status(400).json({ error: "Search query must be at least 2 characters" });
      return;
    }

    // Require auth for product search — verify token properly
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Login required to search products" });
      return;
    }

    try {
      verifyToken(authHeader.slice(7));
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const take = safeLimit(limit);
    const skip = (Number(page) - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q as string, mode: "insensitive" } },
            { brand: { contains: q as string, mode: "insensitive" } },
            { categoryTag: { contains: q as string, mode: "insensitive" } },
            { description: { contains: q as string, mode: "insensitive" } },
          ],
        },
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          packSize: true,
          moq: true,
          categoryTag: true,
          image: true,
          business: {
            select: {
              name: true,
              slug: true,
              supplyChainRole: true,
              area: { select: { name: true, city: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q as string, mode: "insensitive" } },
            { brand: { contains: q as string, mode: "insensitive" } },
            { categoryTag: { contains: q as string, mode: "insensitive" } },
            { description: { contains: q as string, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    res.json({
      data: products,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch {
    res.status(500).json({ error: "Product search failed" });
  }
});

export default router;
