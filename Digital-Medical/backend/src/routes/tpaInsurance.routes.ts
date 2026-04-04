import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Public: list all active companies ──
router.get("/", async (_req: Request, res: Response) => {
    try {
        const companies = await prisma.tpaInsuranceCompany.findMany({
            where: { isActive: true },
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });
        res.json({ data: companies });
    } catch {
        res.status(500).json({ error: "Failed to fetch companies" });
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

        const selections = await prisma.businessTpaSelection.findMany({
            where: { businessId: business.id },
            select: { companyId: true },
        });
        res.json({ data: selections.map((s) => s.companyId) });
    } catch {
        res.status(500).json({ error: "Failed to fetch selections" });
    }
});

// ── Hospital: save selections ──
router.put("/my", requireAuth, async (req: Request, res: Response) => {
    try {
        const { companyIds } = req.body as { companyIds: string[] };
        if (!Array.isArray(companyIds)) {
            res.status(400).json({ error: "companyIds must be an array" }); return;
        }

        const business = await prisma.businessProfile.findUnique({
            where: { userId: req.user!.userId },
            select: { id: true },
        });
        if (!business) { res.status(404).json({ error: "Business not found" }); return; }

        // Replace all selections atomically
        await prisma.$transaction([
            prisma.businessTpaSelection.deleteMany({ where: { businessId: business.id } }),
            prisma.businessTpaSelection.createMany({
                data: companyIds.map((companyId) => ({ businessId: business.id, companyId })),
                skipDuplicates: true,
            }),
        ]);

        res.json({ message: "Selections saved" });
    } catch {
        res.status(500).json({ error: "Failed to save selections" });
    }
});

// ── Public: get selections for a specific business (for public listing page) ──
router.get("/business/:businessId", async (req: Request, res: Response) => {
    try {
        const selections = await prisma.businessTpaSelection.findMany({
            where: { businessId: req.params.businessId },
            include: { company: { select: { id: true, name: true, type: true } } },
        });
        res.json({ data: selections.map((s) => s.company) });
    } catch {
        res.status(500).json({ error: "Failed to fetch selections" });
    }
});

// ── Admin: create company ──
router.post(
    "/",
    requireAuth,
    requireRole("SUPER_ADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
        try {
            const { name, type } = req.body;
            if (!name || !["TPA", "INSURANCE"].includes(type)) {
                res.status(400).json({ error: "name and type (TPA or INSURANCE) are required" }); return;
            }
            const company = await prisma.tpaInsuranceCompany.create({ data: { name, type } });
            res.status(201).json({ data: company });
        } catch {
            res.status(500).json({ error: "Failed to create company" });
        }
    }
);

// ── Admin: update company ──
router.patch(
    "/:id",
    requireAuth,
    requireRole("SUPER_ADMIN", "ADMIN"),
    async (req: Request, res: Response) => {
        try {
            const { name, type, isActive } = req.body;
            const company = await prisma.tpaInsuranceCompany.update({
                where: { id: req.params.id },
                data: {
                    ...(name !== undefined && { name }),
                    ...(type !== undefined && { type }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ data: company });
        } catch {
            res.status(500).json({ error: "Failed to update company" });
        }
    }
);

// ── Admin: delete company ──
router.delete(
    "/:id",
    requireAuth,
    requireRole("SUPER_ADMIN"),
    async (req: Request, res: Response) => {
        try {
            await prisma.tpaInsuranceCompany.delete({ where: { id: req.params.id } });
            res.json({ message: "Deleted" });
        } catch {
            res.status(500).json({ error: "Failed to delete company" });
        }
    }
);

export default router;