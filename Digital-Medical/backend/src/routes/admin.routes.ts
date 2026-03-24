import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { hashPassword } from "../lib/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// All routes require SUPER_ADMIN or ADMIN
router.use(requireAuth, requireRole("SUPER_ADMIN", "ADMIN"));

// ── Dashboard stats ──
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalBusinesses,
      pendingBusinesses,
      activeBusinesses,
      totalCategories,
      totalOrderInquiries,
      totalReviews,
      pendingLicenses,
      pendingReviews,
      totalJobs,
      totalBloodDonors,
      totalCamps,
      unreadContacts,
      unreadAdvertiser,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.businessProfile.count(),
      prisma.businessProfile.count({ where: { status: "PENDING" } }),
      prisma.businessProfile.count({ where: { status: "ACTIVE" } }),
      prisma.category.count(),
      prisma.orderInquiry.count(),
      prisma.review.count(),
      prisma.license.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.job.count({ where: { isActive: true } }),
      prisma.bloodDonorRegistration.count({ where: { status: "APPROVED" } }),
      prisma.camp.count(),
      prisma.contactSubmission.count({ where: { isRead: false } }),
      prisma.advertiserInquiry.count({ where: { isRead: false } }),
    ]);

    res.json({
      data: {
        totalUsers,
        totalBusinesses,
        pendingBusinesses,
        activeBusinesses,
        totalCategories,
        totalOrderInquiries,
        totalReviews,
        pendingLicenses,
        pendingReviews,
        totalJobs,
        totalBloodDonors,
        totalCamps,
        unreadContacts,
        unreadAdvertiser,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── List all users ──
router.get("/users", async (req: Request, res: Response) => {
  try {
    const { role, search, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = {};
    if (role) where.role = String(role);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { phone: { contains: String(search) } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          business: { select: { id: true, businessId: true, name: true, status: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ── Toggle user active ──
router.patch("/users/:id/toggle", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: !user.isActive },
    });

    res.json({ data: { id: updated.id, isActive: updated.isActive } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ── List all businesses (admin) ──
router.get("/businesses", async (req: Request, res: Response) => {
  try {
    const { search, status, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = {};
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { businessId: { contains: String(search), mode: "insensitive" } },
        { phone1: { contains: String(search) } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          businessId: true,
          name: true,
          slug: true,
          image: true,
          phone1: true,
          email: true,
          address: true,
          status: true,
          subscriptionTier: true,
          isPopular: true,
          isVerified: true,
          isEmergency: true,
          supplyChainRole: true,
          designation: true,
          about: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          area: {
            select: {
              id: true,
              name: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  district: { select: { id: true, name: true, state: { select: { id: true, name: true } } } },
                },
              },
            },
          },
          user: { select: { name: true, phone: true, email: true } },
        },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    res.json({
      data: businesses,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

// ── Pending businesses for approval ──
router.get("/businesses/pending", async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const where = { status: "PENDING" as const };

    const [businesses, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, phone: true, email: true } },
          category: { select: { name: true } },
          area: { select: { name: true, city: { select: { name: true, district: { select: { name: true, state: { select: { name: true } } } } } } } },
        },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    res.json({
      data: businesses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending businesses" });
  }
});

// ── Create admin user (SUPER_ADMIN only) ──
router.post("/users/admin", requireRole("SUPER_ADMIN"), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      res.status(400).json({ error: "name, phone, and password are required" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: await hashPassword(password),
        role: "ADMIN",
      },
    });

    res.status(201).json({
      data: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Phone or email already exists" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

export default router;
