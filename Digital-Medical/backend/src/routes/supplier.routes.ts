import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

/**
 * Determine which supplyChainRoles the logged-in business can view.
 * RETAILER  → can see WHOLESALER
 * WHOLESALER → can see WHOLESALER + MANUFACTURER
 */
function getVisibleRoles(role: string | null): string[] {
  if (role === "RETAILER") return ["WHOLESALER"];
  if (role === "WHOLESALER") return ["MANUFACTURER"];
  return [];
}

// ── List suppliers accessible to logged-in business ──
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business || !business.supplyChainRole) {
      res.status(403).json({ error: "Supply chain access required" });
      return;
    }

    const visibleRoles = getVisibleRoles(business.supplyChainRole);
    if (visibleRoles.length === 0) {
      res.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      return;
    }

    const { page = "1", limit: rawLimit, search, role } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = {
      status: "ACTIVE",
      supplyChainRole: { in: role ? [String(role)] : visibleRoles },
      id: { not: business.id }, // exclude self
    };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { address: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ subscriptionTier: "desc" }, { name: "asc" }],
        select: {
          id: true,
          businessId: true,
          name: true,
          slug: true,
          image: true,
          address: true,
          phone1: true,
          supplyChainRole: true,
          area: { select: { name: true, city: { select: { name: true } } } },
          _count: { select: { products: true, deals: true, services: true } },
        },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    res.json({
      data: suppliers,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// ── Search products across all accessible suppliers ──
// IMPORTANT: This route must be registered BEFORE /:id to avoid conflicts
router.get("/products/search", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business || !business.supplyChainRole) {
      res.status(403).json({ error: "Supply chain access required" });
      return;
    }

    const visibleRoles = getVisibleRoles(business.supplyChainRole);
    if (visibleRoles.length === 0) {
      res.json({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
      return;
    }

    const { page = "1", limit: rawLimit, search } = req.query;
    if (!search) {
      res.status(400).json({ error: "search query is required" });
      return;
    }

    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = {
      isActive: true,
      business: {
        status: "ACTIVE",
        supplyChainRole: { in: visibleRoles },
        id: { not: business.id },
      },
      OR: [
        { name: { contains: String(search), mode: "insensitive" } },
        { brand: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          brand: true,
          packSize: true,
          moq: true,
          image: true,
          business: {
            select: { id: true, name: true, slug: true, phone1: true, image: true },
          },
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
    res.status(500).json({ error: "Failed to search products" });
  }
});

// ── Get supplier detail (deals, services, product count) ──
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business || !business.supplyChainRole) {
      res.status(403).json({ error: "Supply chain access required" });
      return;
    }

    const visibleRoles = getVisibleRoles(business.supplyChainRole);

    const supplier = await prisma.businessProfile.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        businessId: true,
        name: true,
        slug: true,
        about: true,
        image: true,
        address: true,
        phone1: true,
        whatsapp: true,
        status: true,
        supplyChainRole: true,
        area: { select: { name: true, city: { select: { name: true } } } },
        deals: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { products: true, deals: true, services: true } },
      },
    });

    if (
      !supplier ||
      supplier.status !== "ACTIVE" ||
      !supplier.supplyChainRole ||
      !visibleRoles.includes(supplier.supplyChainRole)
    ) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res.json({ data: supplier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
});

// ── Get supplier's products (paginated) ──
router.get("/:id/products", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business || !business.supplyChainRole) {
      res.status(403).json({ error: "Supply chain access required" });
      return;
    }

    const visibleRoles = getVisibleRoles(business.supplyChainRole);

    const supplier = await prisma.businessProfile.findUnique({
      where: { id: req.params.id },
      select: { id: true, supplyChainRole: true, status: true },
    });

    if (
      !supplier ||
      supplier.status !== "ACTIVE" ||
      !supplier.supplyChainRole ||
      !visibleRoles.includes(supplier.supplyChainRole)
    ) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    const { page = "1", limit: rawLimit, search } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { businessId: supplier.id, isActive: true };
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
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
