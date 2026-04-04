import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Public: list active bodies; Admin: list all with ?all=true ──
router.get("/", async (req: Request, res: Response) => {
    try {
        const showAll = req.query.all === "true";
        const bodies = await prisma.accreditationBody.findMany({
            where: showAll ? undefined : { isActive: true },
            orderBy: { name: "asc" },
        });
        res.json({ data: bodies });
    } catch {
        res.status(500).json({ error: "Failed to fetch accreditation bodies" });
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

        const selections = await prisma.businessAccreditationSelection.findMany({
            where: { businessId: business.id },
            select: { bodyId: true },
        });
        res.json({ data: selections.map((s) => s.bodyId) });
    } catch {
        res.status(500).json({ error: "Failed to fetch selections" });
    }
});

// ── Hospital: save selections ──
router.put("/my", requireAuth, async (req: Request, res: Response) => {
    try {
        const { bodyIds } = req.body as { bodyIds: string[] };
        if (!Array.isArray(bodyIds)) {
            res.status(400).json({ error: "bodyIds must be an array" }); return;
        }

        const business = await prisma.businessProfile.findUnique({
            where: { userId: req.user!.userId },
            select: { id: true },
        });
        if (!business) { res.status(404).json({ error: "Business not found" }); return; }

        await prisma.$transaction([
            prisma.businessAccreditationSelection.deleteMany({ where: { businessId: business.id } }),
            prisma.businessAccreditationSelection.createMany({
                data: bodyIds.map((bodyId) => ({ businessId: business.id, bodyId })),
                skipDuplicates: true,
            }),
        ]);

        res.json({ message: "Accreditation selections saved" });
    } catch {
        res.status(500).json({ error: "Failed to save selections" });
    }
});

// ── Public: get accreditation selections for a specific business ──
router.get("/business/:businessId", async (req: Request, res: Response) => {
    try {
        const selections = await prisma.businessAccreditationSelection.findMany({
            where: { businessId: req.params.businessId },
            include: { body: { select: { id: true, name: true } } },
        });
        res.json({ data: selections.map((s) => s.body) });
    } catch {
        res.status(500).json({ error: "Failed to fetch accreditation selections" });
    }
});

// ── Admin: create accreditation body ──
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
            const body = await prisma.accreditationBody.create({ data: { name: name.trim() } });
            res.status(201).json({ data: body });
        } catch {
            res.status(500).json({ error: "Failed to create accreditation body" });
        }
    }
);

// ── Admin: update accreditation body ──
router.patch(
    "/:id",
    requireAuth,
    requireRole("SUPER_ADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
        try {
            const { name, isActive } = req.body;
            const body = await prisma.accreditationBody.update({
                where: { id: req.params.id },
                data: {
                    ...(name !== undefined && { name: name.trim() }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ data: body });
        } catch {
            res.status(500).json({ error: "Failed to update accreditation body" });
        }
    }
);

// ── Admin: delete accreditation body ──
router.delete(
    "/:id",
    requireAuth,
    requireRole("SUPER_ADMIN"),
    async (req: Request, res: Response) => {
        try {
            await prisma.accreditationBody.delete({ where: { id: req.params.id } });
            res.json({ message: "Deleted" });
        } catch {
            res.status(500).json({ error: "Failed to delete accreditation body" });
        }
    }
);

export default router;