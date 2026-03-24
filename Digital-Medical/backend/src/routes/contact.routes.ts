import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Public: Submit contact form ──
router.post("/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, city, subject, message } = req.body;
    if (!name || !phone || !message) {
      res.status(400).json({ error: "name, phone, and message are required" });
      return;
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, phone, city, subject, message },
    });

    res.status(201).json({ data: submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit contact form" });
  }
});

// ── Public: Submit advertiser inquiry ──
router.post("/advertiser", async (req: Request, res: Response) => {
  try {
    const { name, phone, whatsapp, email, city, category, message } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const inquiry = await prisma.advertiserInquiry.create({
      data: { name, phone, whatsapp, email, city, category, message },
    });

    res.status(201).json({ data: inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

// ── Admin: List contact submissions ──
router.get(
  "/contact",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { isRead, page = "1", limit: rawLimit } = req.query;
      const limit = safeLimit(rawLimit);
      const skip = (Number(page) - 1) * limit;

      const where: any = {};
      if (isRead !== undefined) where.isRead = isRead === "true";

      const [submissions, total] = await Promise.all([
        prisma.contactSubmission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.contactSubmission.count({ where }),
      ]);

      res.json({
        data: submissions,
        pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }
);

// ── Admin: List advertiser inquiries ──
router.get(
  "/advertiser",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { isRead, page = "1", limit: rawLimit } = req.query;
      const limit = safeLimit(rawLimit);
      const skip = (Number(page) - 1) * limit;

      const where: any = {};
      if (isRead !== undefined) where.isRead = isRead === "true";

      const [inquiries, total] = await Promise.all([
        prisma.advertiserInquiry.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.advertiserInquiry.count({ where }),
      ]);

      res.json({
        data: inquiries,
        pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  }
);

// ── Admin: Mark as read ──
router.patch(
  "/contact/:id/read",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.contactSubmission.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });
      res.json({ message: "Marked as read" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update" });
    }
  }
);

router.patch(
  "/advertiser/:id/read",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.advertiserInquiry.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });
      res.json({ message: "Marked as read" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update" });
    }
  }
);

export default router;
