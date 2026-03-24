import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Notifications: Get my notifications ──
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit: rawLimit, unreadOnly } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { userId: req.user!.userId };
    if (unreadOnly === "true") where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
    ]);

    res.json({
      data: notifications,
      unreadCount,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ── Mark notification as read ──
router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true },
    });
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// ── Mark all as read ──
router.patch("/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// ── Admin: Send broadcast notification ──
router.post(
  "/broadcast",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { title, message, link, targetRole } = req.body;
      if (!title || !message) {
        res.status(400).json({ error: "title and message are required" });
        return;
      }

      // Find target users
      const where: any = { isActive: true };
      if (targetRole) {
        const validRoles = ["SUPER_ADMIN", "ADMIN", "BUSINESS", "CUSTOMER"];
        if (!validRoles.includes(String(targetRole))) {
          res.status(400).json({ error: "Invalid targetRole" });
          return;
        }
        where.role = String(targetRole);
      }

      const users = await prisma.user.findMany({
        where,
        select: { id: true },
      });

      // Create notifications in batch
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: "BROADCAST" as const,
          title,
          message,
          link,
        })),
      });

      res.json({ message: `Notification sent to ${users.length} users` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send broadcast" });
    }
  }
);

// ── Delete a notification ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
