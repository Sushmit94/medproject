import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Public: List reviews for a business ──
router.get("/business/:businessId", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { businessId: String(req.params.businessId), isApproved: true };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, avatar: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate average
    const avg = await prisma.review.aggregate({
      where,
      _avg: { rating: true },
    });

    res.json({
      data: reviews,
      averageRating: avg._avg?.rating || 0,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ── Submit a review ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { businessId, rating, comment } = req.body;
    if (!businessId || !rating) {
      res.status(400).json({ error: "businessId and rating are required" });
      return;
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const business = await prisma.businessProfile.findUnique({
      where: { id: businessId },
    });
    if (!business || business.status !== "ACTIVE") {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    // Prevent self-review
    if (business.userId === req.user!.userId) {
      res.status(403).json({ error: "Cannot review your own business" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        businessId,
        userId: req.user!.userId,
        rating: ratingNum,
        comment,
      },
    });

    res.status(201).json({ data: review });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Already reviewed this business" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// ── Admin: Pending reviews ──
router.get(
  "/admin/pending",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { page = "1", limit: rawLimit } = req.query;
      const limit = safeLimit(rawLimit);
      const skip = (Number(page) - 1) * limit;

      const where = { isApproved: false };

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, phone: true } },
            business: { select: { id: true, businessId: true, name: true } },
          },
        }),
        prisma.review.count({ where }),
      ]);

      res.json({
        data: reviews,
        pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch pending reviews" });
    }
  }
);

// ── Admin: Approve / Delete review ──
router.patch(
  "/admin/:id",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { action } = req.body; // "approve" or "delete"

      if (action === "approve") {
        const review = await prisma.review.update({
          where: { id: String(req.params.id) },
          data: { isApproved: true },
        });
        res.json({ data: review });
      } else if (action === "delete") {
        await prisma.review.delete({ where: { id: String(req.params.id) } });
        res.json({ message: "Review deleted" });
      } else {
        res.status(400).json({ error: "action must be 'approve' or 'delete'" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update review" });
    }
  }
);

export default router;
