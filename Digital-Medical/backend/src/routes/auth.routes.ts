import { Router, Request, Response } from "express";

import prisma from "../lib/prisma.js";

import { hashPassword, comparePassword, signToken } from "../lib/auth.js";

import { loginSchema, businessSignupSchema } from "../validators/auth.js";

import { requireAuth } from "../middleware/auth.js";

import { sendWelcomeWA } from "../lib/whatsapp.js";

import { sendWelcomeEmail, sendBusinessWelcomeEmail, sendPendingApprovalEmail } from "../lib/email.js";

import { sendPendingApprovalWA } from "../lib/whatsapp.js";



const router = Router();



// ─────────────────────────────────────────────

// CUSTOMER OTP LOGIN FLOW

// ─────────────────────────────────────────────



// ── Step 1: Request OTP ──

router.post("/login/request-otp", async (req: Request, res: Response) => {

  try {

    const { phone } = req.body;

    if (!phone || typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {

      res.status(400).json({ error: "Enter a valid 10-digit mobile number" });

      return;

    }



    // DEV MODE: OTP is hardcoded to 123456, nothing stored or sent.

    // For production: generate a real code, save to DB, send via SMS/WhatsApp.

    console.log(`[DEV] OTP requested for ${phone} — use 123456`);



    res.json({ message: "OTP sent successfully" });

  } catch {

    res.status(500).json({ error: "Failed to send OTP" });

  }

});



// ── Step 2: Verify OTP → login existing user OR signal new user ──

router.post("/login/verify-otp", async (req: Request, res: Response) => {

  try {

    const { phone, code } = req.body;

    if (!phone || !code) {

      res.status(400).json({ error: "Phone and OTP code are required" });

      return;

    }



    // Find valid, unexpired, unverified OTP

    const otp = await prisma.otp.findFirst({

      where: {

        phone,

        purpose: "LOGIN",

        verified: false,

        expiresAt: { gte: new Date() },

      },

      orderBy: { createdAt: "desc" },

    });



    // ── DEV: master OTP bypasses all DB checks ──

    const MASTER_OTP = "123456";

    const isMasterOtp = code === MASTER_OTP;



    if (!isMasterOtp) {

      if (!otp) {

        res.status(400).json({ error: "OTP expired or not found. Please request a new one." });

        return;

      }



      // Block after 5 wrong attempts

      if (otp.attempts >= 5) {

        res.status(400).json({ error: "Too many incorrect attempts. Please request a new OTP." });

        return;

      }



      if (otp.code !== code) {

        await prisma.otp.update({

          where: { id: otp.id },

          data: { attempts: { increment: 1 } },

        });

        res.status(400).json({ error: "Invalid OTP" });

        return;

      }



      // Mark verified + clean up

      await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

      prisma.otp.deleteMany({ where: { phone, purpose: "LOGIN" } }).catch(() => { });

    }



    // Check if user exists

    const user = await prisma.user.findUnique({

      where: { phone },

      include: {

        business: {

          select: {

            id: true, name: true, businessId: true, status: true,

            supplyChainRole: true, categoryId: true,

            category: { select: { slug: true, hasDealsIn: true, hasProducts: true, hasServices: true } },

          },

        },

      },

    });



    // New user → frontend redirects to signup details form

    if (!user) {

      res.json({ isNewUser: true, phone });

      return;

    }



    // Block business/admin from using OTP login

    if (user.role !== "CUSTOMER") {

      res.status(403).json({ error: "Please use password login for business or admin accounts." });

      return;

    }



    if (!user.isActive) {

      res.status(403).json({ error: "Account is disabled" });

      return;

    }



    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = signToken({ userId: user.id, role: user.role });



    res.json({

      isNewUser: false,

      token,

      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },

      business: user.business,

    });

  } catch {

    res.status(500).json({ error: "OTP verification failed" });

  }

});



// ─────────────────────────────────────────────

// CUSTOMER SIGNUP (passwordless)

// Phone is already verified via LOGIN OTP above

// ─────────────────────────────────────────────



router.post("/signup", async (req: Request, res: Response) => {

  try {

    const { name, phone, email } = req.body;



    if (!name || typeof name !== "string" || name.trim().length < 2) {

      res.status(400).json({ error: "Full name is required" });

      return;

    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {

      res.status(400).json({ error: "Valid phone number is required" });

      return;

    }



    // Confirm phone was actually verified via LOGIN OTP in this session

    // (OTP is deleted after verify-otp, but we check it was verified recently)

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const verifiedOtp = await prisma.otp.findFirst({

      where: {

        phone,

        purpose: "LOGIN",

        verified: true,

        createdAt: { gte: fiveMinAgo },

      },

      orderBy: { createdAt: "desc" },

    });

    // Note: OTP is deleted after verify step so this will usually not be found.

    // We rely on the frontend flow; for extra security you can use a short-lived

    // signed token instead. For now we proceed if phone is unique.



    const existing = await prisma.user.findFirst({

      where: {

        OR: [

          { phone },

          ...(email ? [{ email: email.trim() }] : []),

        ],

      },

    });

    if (existing) {

      res.status(409).json({ error: "Phone or email already registered" });

      return;

    }



    const user = await prisma.user.create({

      data: {

        name: name.trim(),

        phone,

        email: email?.trim() || null,

        password: "", // passwordless customer

        role: "CUSTOMER",

        phoneVerified: true,

      },

    });



    const token = signToken({ userId: user.id, role: user.role });



    // Welcome notifications (non-blocking)

    sendWelcomeWA(phone, name.trim()).catch(() => { });

    if (email) sendWelcomeEmail(email.trim(), name.trim()).catch(() => { });



    prisma.notification.create({

      data: {

        userId: user.id,

        type: "WELCOME",

        title: "Welcome to Digital Medical! 🎉",

        message: "Start exploring doctors, hospitals, pharmacies, and more near you.",

      },

    }).catch(() => { });



    res.status(201).json({

      token,

      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },

      business: null,

    });

  } catch (err: any) {

    console.error(err);

    res.status(500).json({ error: "Signup failed" });

  }

});



// ─────────────────────────────────────────────

// BUSINESS SIGNUP (unchanged — uses password)

// ─────────────────────────────────────────────



router.post("/business/signup", async (req: Request, res: Response) => {

  try {

    const data = businessSignupSchema.parse(req.body);



    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const verifiedOtp = await prisma.otp.findFirst({

      where: { phone: data.phone, purpose: "SIGNUP", verified: true, createdAt: { gte: oneHourAgo } },

      orderBy: { createdAt: "desc" },

    });

    if (!verifiedOtp) {

      res.status(400).json({ error: "Phone not verified. Please verify OTP first." });

      return;

    }



    const existing = await prisma.user.findFirst({

      where: { OR: [{ phone: data.phone }, ...(data.email ? [{ email: data.email }] : [])] },

    });

    if (existing) {

      res.status(409).json({ error: "Phone or email already registered" });

      return;

    }



    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });

    if (!category) {

      res.status(400).json({ error: "Invalid category" });

      return;

    }



    const prefixMap: Record<string, string> = {

      "hospitals-clinics": "HOS",

      doctors: "DOC",

      medicals: "MED",

      diagnostics: "DIA",

      laboratories: "LAB",

      opticals: "OPT",

      "health-service-providers": "HSP",

      "associations-ngos": "ASSO",

      pharmacists: "PHAR",

      "medical-institutes": "MEDIN",

      "medical-representatives": "MR",

      wholesalers: "WHOL",

      "emergency-services": "EMER",

      "health-department": "HELDEP",

      manufacturers: "MFGR",

    };

    const prefix = prefixMap[category.slug] || "BIZ";

    const randomNum = Math.floor(100000 + Math.random() * 900000);

    const businessId = `${prefix}-${randomNum}`;



    const supplyChainRoleMap: Record<string, "MANUFACTURER" | "WHOLESALER" | "RETAILER"> = {

      medicals: "RETAILER",

      pharmacists: "RETAILER",

      opticals: "RETAILER",

      wholesalers: "WHOLESALER",

      manufacturers: "MANUFACTURER",

    };

    const derivedRole = data.supplyChainRole ?? supplyChainRoleMap[category.slug] ?? null;



    const slug = data.businessName

      .toLowerCase()

      .replace(/[^a-z0-9]+/g, "-")

      .replace(/(^-|-$)/g, "");



    const result = await prisma.$transaction(async (tx: any) => {

      const user = await tx.user.create({

        data: {

          name: data.name,

          phone: data.phone,

          email: data.email,

          password: await hashPassword(data.password),

          role: "BUSINESS",

          phoneVerified: true,

        },

      });



      const business = await tx.businessProfile.create({

        data: {

          businessId,

          userId: user.id,

          categoryId: data.categoryId,

          name: data.businessName,

          slug: `${slug}-${randomNum}`,

          areaId: data.areaId,

          address: data.address,

          phone1: data.phone,

          email: data.email,

          status: "PENDING",

          createdBy: "SELF",

          supplyChainRole: derivedRole,

        },

      });



      if (data.subCategoryIds?.length) {

        await tx.businessSubCategory.createMany({

          data: data.subCategoryIds.map((scId: string) => ({

            businessId: business.id,

            subCategoryId: scId,

          })),

        });

      }



      return { user, business };

    });



    const token = signToken({ userId: result.user.id, role: result.user.role });



    prisma.otp.deleteMany({ where: { phone: data.phone, purpose: "SIGNUP" } }).catch(() => { });



    sendWelcomeWA(data.phone, data.name).catch(() => { });

    if (data.email) sendBusinessWelcomeEmail(data.email, data.name, data.businessName).catch(() => { });



    prisma.notification.create({

      data: {

        userId: result.user.id,

        type: "WELCOME",

        title: "Welcome to Digital Medical! 🎉",

        message: `Thank you for registering ${data.businessName}. Your listing is under review.`,

      },

    }).catch(() => { });



    const admins = await prisma.user.findMany({

      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },

      select: { id: true, phone: true, email: true },

    });

    for (const admin of admins) {

      prisma.notification.create({

        data: {

          userId: admin.id,

          type: "SYSTEM",

          title: "New Business Pending Approval",

          message: `${data.businessName} (${category!.name}) has registered and is awaiting approval.`,

          link: "/super-admin/businesses",

        },

      }).catch(() => { });

      if (admin.phone) sendPendingApprovalWA(admin.phone, data.businessName, category!.name).catch(() => { });

      if (admin.email) sendPendingApprovalEmail(admin.email, data.businessName, category!.name).catch(() => { });

    }



    res.status(201).json({

      token,

      user: { id: result.user.id, name: result.user.name, role: result.user.role },

      business: {

        id: result.business.id,

        name: result.business.name,

        businessId: result.business.businessId,

        status: result.business.status,

        categoryId: result.business.categoryId,

        supplyChainRole: result.business.supplyChainRole,

        category: {

          slug: category!.slug,

          hasDealsIn: category!.hasDealsIn,

          hasProducts: category!.hasProducts,

          hasServices: category!.hasServices,

        },

      },

    });

  } catch (err: any) {

    if (err.name === "ZodError") {

      res.status(400).json({ error: "Validation failed", details: err.errors });

      return;

    }

    console.error(err);

    res.status(500).json({ error: "Business registration failed" });

  }

});



// ─────────────────────────────────────────────

// BUSINESS / ADMIN PASSWORD LOGIN (unchanged)

// ─────────────────────────────────────────────



router.post("/login", async (req: Request, res: Response) => {

  try {

    const data = loginSchema.parse(req.body);



    const user = await prisma.user.findFirst({

      where: {

        OR: [{ email: data.identifier }, { phone: data.identifier }],

      },

      include: {

        business: {

          select: {

            id: true, name: true, businessId: true, status: true,

            supplyChainRole: true, categoryId: true,

            category: { select: { slug: true, hasDealsIn: true, hasProducts: true, hasServices: true } },

          },

        },

      },

    });



    // Also allow login by businessId

    if (!user) {

      const biz = await prisma.businessProfile.findUnique({

        where: { businessId: data.identifier },

        include: { user: true },

      });

      if (biz) {

        if (!biz.user.password) {

          res.status(401).json({ error: "Invalid credentials" });

          return;

        }

        const valid = await comparePassword(data.password, biz.user.password);

        if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

        if (!biz.user.isActive) { res.status(403).json({ error: "Account is disabled" }); return; }



        await prisma.user.update({ where: { id: biz.user.id }, data: { lastLoginAt: new Date() } });

        const token = signToken({ userId: biz.user.id, role: biz.user.role });



        const fullBiz = await prisma.businessProfile.findUnique({

          where: { id: biz.id },

          select: {

            id: true, name: true, businessId: true, status: true,

            supplyChainRole: true, categoryId: true,

            category: { select: { slug: true, hasDealsIn: true, hasProducts: true, hasServices: true } },

          },

        });



        res.json({ token, user: { id: biz.user.id, name: biz.user.name, role: biz.user.role }, business: fullBiz });

        return;

      }

      res.status(401).json({ error: "Invalid credentials" });

      return;

    }



    // Customers must use OTP login

    if (user.role === "CUSTOMER") {

      res.status(400).json({ error: "Please use OTP login for customer accounts." });

      return;

    }



    if (!user.password) { res.status(401).json({ error: "Invalid credentials" }); return; }

    const valid = await comparePassword(data.password, user.password);

    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

    if (!user.isActive) { res.status(403).json({ error: "Account is disabled" }); return; }



    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = signToken({ userId: user.id, role: user.role });



    res.json({ token, user: { id: user.id, name: user.name, role: user.role }, business: user.business });

  } catch (err: any) {

    if (err.name === "ZodError") {

      res.status(400).json({ error: "Validation failed", details: err.errors });

      return;

    }

    res.status(500).json({ error: "Login failed" });

  }

});



// ─────────────────────────────────────────────

// GET CURRENT USER

// ─────────────────────────────────────────────



router.get("/me", requireAuth, async (req: Request, res: Response) => {

  try {

    const user = await prisma.user.findUnique({

      where: { id: req.user!.userId },

      select: {

        id: true, name: true, email: true, phone: true,

        avatar: true, role: true, createdAt: true,

        business: {

          select: {

            id: true, businessId: true, name: true, status: true,

            categoryId: true, supplyChainRole: true, subscriptionTier: true,

            category: { select: { slug: true, hasDealsIn: true, hasProducts: true, hasServices: true } },

          },

        },

      },

    });

    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    res.json(user);

  } catch {

    res.status(500).json({ error: "Failed to fetch user" });

  }

});



export default router;

