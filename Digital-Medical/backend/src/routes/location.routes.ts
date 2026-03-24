import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Get all states ──
router.get("/states", async (_req: Request, res: Response) => {
  try {
    const states = await prisma.state.findMany({ orderBy: { name: "asc" } });
    res.json(states);
  } catch {
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// ── Get districts by state ──
router.get("/states/:stateId/districts", async (req: Request, res: Response) => {
  try {
    const districts = await prisma.district.findMany({
      where: { stateId: String(req.params.stateId) },
      orderBy: { name: "asc" },
    });
    res.json(districts);
  } catch {
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// ── Get cities by district ──
router.get("/districts/:districtId/cities", async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      where: { districtId: String(req.params.districtId) },
      orderBy: { name: "asc" },
    });
    res.json(cities);
  } catch {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// ── Get areas by city ──
router.get("/cities/:cityId/areas", async (req: Request, res: Response) => {
  try {
    const areas = await prisma.area.findMany({
      where: { cityId: String(req.params.cityId), isActive: true },
      orderBy: { name: "asc" },
    });
    res.json(areas);
  } catch {
    res.status(500).json({ error: "Failed to fetch areas" });
  }
});

// ── Admin: Create state ──
router.post("/states", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  try {
    const state = await prisma.state.create({ data: { name: req.body.name } });
    res.status(201).json(state);
  } catch {
    res.status(500).json({ error: "Failed to create state" });
  }
});

// ── Admin: Create district ──
router.post("/districts", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  try {
    const district = await prisma.district.create({
      data: { name: req.body.name, stateId: req.body.stateId },
    });
    res.status(201).json(district);
  } catch {
    res.status(500).json({ error: "Failed to create district" });
  }
});

// ── Admin: Create city ──
router.post("/cities", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  try {
    const city = await prisma.city.create({
      data: { name: req.body.name, districtId: req.body.districtId },
    });
    res.status(201).json(city);
  } catch {
    res.status(500).json({ error: "Failed to create city" });
  }
});

// ── Admin: Create area ──
router.post("/areas", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  try {
    const area = await prisma.area.create({
      data: { name: req.body.name, cityId: req.body.cityId },
    });
    res.status(201).json(area);
  } catch {
    res.status(500).json({ error: "Failed to create area" });
  }
});

export default router;
