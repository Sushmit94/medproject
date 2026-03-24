import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Register as blood donor ──
router.post("/donors/register", requireAuth, async (req: Request, res: Response) => {
  try {
    const { bloodGroup, stateId, districtId, cityId, address } = req.body;
    if (!bloodGroup) {
      res.status(400).json({ error: "bloodGroup is required" });
      return;
    }

    const validGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!validGroups.includes(bloodGroup)) {
      res.status(400).json({ error: "Invalid blood group" });
      return;
    }

    const donor = await prisma.bloodDonorRegistration.upsert({
      where: { userId: req.user!.userId },
      create: {
        userId: req.user!.userId,
        bloodGroup,
        stateId,
        districtId,
        cityId,
        address,
      },
      update: {
        bloodGroup,
        stateId,
        districtId,
        cityId,
        address,
        isAvailable: true,
        // Keep existing status — admin must approve via /donors/:id/status
      },
    });

    res.status(201).json({ data: donor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register as donor" });
  }
});

// ── Update donor availability ──
router.patch("/donors/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const donor = await prisma.bloodDonorRegistration.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!donor) {
      res.status(404).json({ error: "You are not registered as a donor" });
      return;
    }

    const { isAvailable, lastDonation } = req.body;

    if (lastDonation) {
      const d = new Date(lastDonation);
      if (isNaN(d.getTime()) || d > new Date()) {
        res.status(400).json({ error: "lastDonation must be a valid past date" });
        return;
      }
    }

    const updated = await prisma.bloodDonorRegistration.update({
      where: { userId: req.user!.userId },
      data: {
        ...(isAvailable !== undefined && { isAvailable }),
        ...(lastDonation && { lastDonation: new Date(lastDonation) }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update donor" });
  }
});

// ── Search donors by blood group and location ──
router.get("/donors", async (req: Request, res: Response) => {
  try {
    const { bloodGroup, cityId, districtId, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isAvailable: true, status: "APPROVED" };
    if (bloodGroup) where.bloodGroup = String(bloodGroup);
    if (cityId) where.cityId = String(cityId);
    if (districtId) where.districtId = String(districtId);

    const [donors, total] = await Promise.all([
      prisma.bloodDonorRegistration.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bloodDonorRegistration.count({ where }),
    ]);

    res.json({
      data: donors,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search donors" });
  }
});

// ── Create blood request ──
router.post("/requests", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      attendantName, attendantPhone, patientName, patientAge, patientGender,
      bloodGroup, unitsNeeded, reason, urgency, hospitalName,
      stateId, districtId, cityId, address,
    } = req.body;

    if (!attendantName || !attendantPhone || !patientName || !bloodGroup || !unitsNeeded) {
      res.status(400).json({ error: "attendantName, attendantPhone, patientName, bloodGroup, and unitsNeeded are required" });
      return;
    }

    if (Number(unitsNeeded) < 1) {
      res.status(400).json({ error: "unitsNeeded must be at least 1" });
      return;
    }

    const request = await prisma.bloodRequest.create({
      data: {
        userId: req.user!.userId,
        attendantName,
        attendantPhone,
        patientName,
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender,
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        reason,
        urgency: urgency || "NORMAL",
        hospitalName,
        stateId,
        districtId,
        cityId,
        address,
      },
    });

    res.status(201).json({ data: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create blood request" });
  }
});

// ── List blood requests ──
router.get("/requests", async (req: Request, res: Response) => {
  try {
    const { cityId, bloodGroup, urgency, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isFulfilled: false };
    if (cityId) where.cityId = String(cityId);
    if (bloodGroup) where.bloodGroup = String(bloodGroup);
    if (urgency) where.urgency = String(urgency);

    const [requests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ urgency: "asc" }, { createdAt: "desc" }], // CRITICAL first
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.bloodRequest.count({ where }),
    ]);

    res.json({
      data: requests,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// ── Admin: Approve/reject donor ──
router.patch(
  "/donors/:id/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["APPROVED", "UNAVAILABLE"].includes(status)) {
        res.status(400).json({ error: "status must be APPROVED or UNAVAILABLE" });
        return;
      }

      const updated = await prisma.bloodDonorRegistration.update({
        where: { id: req.params.id },
        data: { status },
      });

      res.json({ data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update donor status" });
    }
  }
);

export default router;
