import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Public: List job categories ──
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.jobCategory.findMany({
      where: { isActive: true },
      include: { _count: { select: { jobs: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job categories" });
  }
});

// ── Public: List active jobs ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const { jobCategoryId, search, page = "1", limit: rawLimit } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { isActive: true };
    if (jobCategoryId) where.jobCategoryId = String(jobCategoryId);
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          business: {
            select: { id: true, name: true, slug: true, image: true, area: { select: { name: true, city: { select: { name: true } } } } },
          },
          jobCategory: { select: { id: true, name: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      data: jobs,
      pagination: { page: Number(page), limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ── Public: Get job detail ──
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        business: {
          select: { id: true, name: true, slug: true, image: true, phone1: true, address: true },
        },
        jobCategory: true,
        _count: { select: { applications: true } },
      },
    });
    if (!job || !job.isActive) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json({ data: job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// ── Apply for a job ──
router.post("/:id/apply", requireAuth, async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job || !job.isActive) {
      res.status(404).json({ error: "Job not available" });
      return;
    }

    if (job.lastDate && job.lastDate < new Date()) {
      res.status(400).json({ error: "Application deadline has passed" });
      return;
    }

    const {
      name, phone, dob, gender, education, experience,
      currentWork, designation, currentSalary, expectedSalary,
      preferredLocation, photo, resume,
    } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "name and phone are required" });
      return;
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        userId: req.user!.userId,
        name,
        phone,
        dob: dob ? new Date(dob) : undefined,
        gender,
        education,
        experience,
        currentWork,
        designation,
        currentSalary,
        expectedSalary,
        preferredLocation,
        photo,
        resume,
      },
    });

    // Notify business
    const business = await prisma.businessProfile.findUnique({ where: { id: job.businessId } });
    if (business) {
      await prisma.notification.create({
        data: {
          userId: business.userId,
          type: "SYSTEM",
          title: "New Job Application",
          message: `${name} applied for "${job.title}"`,
          link: `/portal/jobs/${job.id}/applications`,
        },
      });
    }

    res.status(201).json({ data: application });
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Already applied for this job" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to apply" });
  }
});

// ── Business: Post a job ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const {
      jobCategoryId, title, description, salary, education,
      experience, ageRange, gender, selectionProcess, lastDate,
    } = req.body;

    if (!jobCategoryId || !title) {
      res.status(400).json({ error: "jobCategoryId and title are required" });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const job = await prisma.job.create({
      data: {
        businessId: business.id,
        jobCategoryId,
        title,
        slug: `${slug}-${crypto.randomUUID().split("-")[0]}`,
        description,
        salary,
        education,
        experience,
        ageRange,
        gender,
        selectionProcess,
        lastDate: lastDate ? new Date(lastDate) : undefined,
      },
    });

    res.status(201).json({ data: job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post job" });
  }
});

// ── Business: View applications for my job ──
router.get(
  "/:id/applications",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const business = await prisma.businessProfile.findUnique({
        where: { userId: req.user!.userId },
      });
      if (!business) {
        res.status(404).json({ error: "Business profile not found" });
        return;
      }

      const job = await prisma.job.findFirst({
        where: { id: req.params.id, businessId: business.id },
      });
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const applications = await prisma.jobApplication.findMany({
        where: { jobId: job.id },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: applications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  }
);

// ── Admin: Create job category ──
router.post(
  "/categories",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { name, categoryId } = req.body;
      if (!name) {
        res.status(400).json({ error: "name is required" });
        return;
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const jobCategory = await prisma.jobCategory.create({
        data: { name, slug, categoryId },
      });

      res.status(201).json({ data: jobCategory });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create job category" });
    }
  }
);

// ── Business: Update job ──
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const job = await prisma.job.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const { title, description, salary, education, experience, ageRange, gender, selectionProcess, lastDate, isActive } = req.body;

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(salary !== undefined && { salary }),
        ...(education !== undefined && { education }),
        ...(experience !== undefined && { experience }),
        ...(ageRange !== undefined && { ageRange }),
        ...(gender !== undefined && { gender }),
        ...(selectionProcess !== undefined && { selectionProcess }),
        ...(lastDate !== undefined && { lastDate: lastDate ? new Date(lastDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// ── Business: Delete job ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const job = await prisma.job.findFirst({
      where: { id: req.params.id, businessId: business.id },
    });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    await prisma.job.delete({ where: { id: job.id } });
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

export default router;
