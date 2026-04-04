import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Public: list active orgs; Admin: list all with ?all=true ──
router.get("/", async (req: Request, res: Response) => {
    try {
        const showAll = req.query.all === "true";
        const orgs = await prisma.psuOrganization.findMany({
            where: showAll ? undefined : { isActive: true },
            orderBy: { name: "asc" },
        });
        res.json({ data: orgs });
    } catch {
        res.status(500).json({ error: "Failed to fetch PSU organizations" });
    }
});

// ── Hospital: get my selections ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
    try {
        const business = await prisma.businessProfile.findUnique({
            where: { userId: req.user!.userId },
            select: { id: true },
        });
        if (!business) { res.status(404).json({ error: "Business not found" }); return; }

        const selections = await prisma.businessPsuSelection.findMany({
            where: { businessId: business.id },
            select: { orgId: true },
        });
        res.json({ data: selections.map((s) => s.orgId) });
    } catch {
        res.status(500).json({ error: "Failed to fetch selections" });
    }
});

// ── Hospital: save selections ──
router.put("/my", requireAuth, async (req: Request, res: Response) => {
    try {
        const { orgIds } = req.body as { orgIds: string[] };
        if (!Array.isArray(orgIds)) {
            res.status(400).json({ error: "orgIds must be an array" }); return;
        }

        const business = await prisma.businessProfile.findUnique({
            where: { userId: req.user!.userId },
            select: { id: true },
        });
        if (!business) { res.status(404).json({ error: "Business not found" }); return; }

        await prisma.$transaction([
            prisma.businessPsuSelection.deleteMany({ where: { businessId: business.id } }),
            prisma.businessPsuSelection.createMany({
                data: orgIds.map((orgId) => ({ businessId: business.id, orgId })),
                skipDuplicates: true,
            }),
        ]);

        res.json({ message: "PSU selections saved" });
    } catch {
        res.status(500).json({ error: "Failed to save selections" });
    }
});

// ── Public: get PSU selections for a specific business ──
router.get("/business/:businessId", async (req: Request, res: Response) => {
    try {
        const selections = await prisma.businessPsuSelection.findMany({
            where: { businessId: req.params.businessId },
            include: { org: { select: { id: true, name: true } } },
        });
        res.json({ data: selections.map((s) => s.org) });
    } catch {
        res.status(500).json({ error: "Failed to fetch PSU selections" });
    }
});

// ── Admin: create PSU organization ──
router.post(
    "/",
    requireAuth,
    requireRole("SUPER_ADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            if (!name || typeof name !== "string" || !name.trim()) {
                res.status(400).json({ error: "name is required" }); return;
            }
            const org = await prisma.psuOrganization.create({ data: { name: name.trim() } });
            res.status(201).json({ data: org });
        } catch {
            res.status(500).json({ error: "Failed to create PSU organization" });
        }
    }
);

// ── Admin: update PSU organization ──
router.patch(
    "/:id",
    requireAuth,
    requireRole("SUPER_ADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
        try {
            const { name, isActive } = req.body;
            const org = await prisma.psuOrganization.update({
                where: { id: req.params.id },
                data: {
                    ...(name !== undefined && { name: name.trim() }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ data: org });
        } catch {
            res.status(500).json({ error: "Failed to update PSU organization" });
        }
    }
);

// ── Admin: delete PSU organization ──
router.delete(
    "/:id",
    requireAuth,
    requireRole("SUPER_ADMIN"),
    async (req: Request, res: Response) => {
        try {
            await prisma.psuOrganization.delete({ where: { id: req.params.id } });
            res.json({ message: "Deleted" });
        } catch {
            res.status(500).json({ error: "Failed to delete PSU organization" });
        }
    }
);

export default router;