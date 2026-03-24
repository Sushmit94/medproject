import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { sendOrderInquiryWA } from "../lib/whatsapp.js";
import { sendOrderInquiryEmail } from "../lib/email.js";
import { safeLimit } from "../lib/utils.js";

const router = Router();

// ── Create order inquiry (buyer → supplier) ──
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const buyer = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!buyer) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { supplierId, productId, productName, quantity, unit, notes } = req.body;
    if (!supplierId || !productName || !quantity) {
      res.status(400).json({ error: "supplierId, productName, and quantity are required" });
      return;
    }
    const quantityNum = Number(quantity);
    if (!Number.isFinite(quantityNum) || quantityNum <= 0) {
      res.status(400).json({ error: "quantity must be a positive number" });
      return;
    }

    const supplier = await prisma.businessProfile.findUnique({
      where: { id: supplierId },
    });
    if (!supplier || supplier.status !== "ACTIVE") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    // Validate supply chain access
    if (supplier.supplyChainRole === "WHOLESALER" && buyer.supplyChainRole !== "RETAILER") {
      res.status(403).json({ error: "Only retailers can order from wholesalers" });
      return;
    }
    if (supplier.supplyChainRole === "MANUFACTURER" && buyer.supplyChainRole !== "WHOLESALER") {
      res.status(403).json({ error: "Only wholesalers can order from manufacturers" });
      return;
    }

    const inquiry = await prisma.orderInquiry.create({
      data: {
        buyerId: buyer.id,
        supplierId,
        productId: productId || undefined,
        productName,
        quantity: quantityNum,
        unit,
        notes,
      },
    });

    // Notify supplier
    await prisma.notification.create({
      data: {
        userId: supplier.userId,
        type: "INQUIRY",
        title: "New Order Inquiry",
        message: `${buyer.name} wants to order ${quantity} ${unit || "units"} of ${productName}`,
        link: `/portal/inquiries/${inquiry.id}`,
      },
    });

    // Send WhatsApp + email notification to supplier (non-blocking)
    if (supplier.whatsapp || supplier.phone1) {
      sendOrderInquiryWA(
        (supplier.whatsapp || supplier.phone1)!,
        supplier.name,
        buyer.name,
        productName,
        Number(quantity),
        unit,
      ).catch((err) => console.error("WA send failed:", err));
    }
    if (supplier.email) {
      sendOrderInquiryEmail(
        supplier.email,
        supplier.name,
        buyer.name,
        productName,
        Number(quantity),
        unit,
        notes,
      ).catch((err) => console.error("Email send failed:", err));
    }

    res.status(201).json({ data: inquiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create inquiry" });
  }
});

// ── My sent inquiries (as buyer) ──
router.get("/sent", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { page = "1", limit: rawLimit, status } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { buyerId: business.id };
    if (status) where.status = String(status);

    const [inquiries, total] = await Promise.all([
      prisma.orderInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: { select: { id: true, businessId: true, name: true, phone1: true, whatsapp: true } },
          product: { select: { id: true, name: true, brand: true } },
        },
      }),
      prisma.orderInquiry.count({ where }),
    ]);

    res.json({
      data: inquiries,
      pagination: {
        page: Number(page),
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

// ── My received inquiries (as supplier) ──
router.get("/received", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const { page = "1", limit: rawLimit, status } = req.query;
    const limit = safeLimit(rawLimit);
    const skip = (Number(page) - 1) * limit;

    const where: any = { supplierId: business.id };
    if (status) where.status = String(status);

    const [inquiries, total] = await Promise.all([
      prisma.orderInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { id: true, businessId: true, name: true, phone1: true, whatsapp: true } },
          product: { select: { id: true, name: true, brand: true } },
        },
      }),
      prisma.orderInquiry.count({ where }),
    ]);

    res.json({
      data: inquiries,
      pagination: {
        page: Number(page),
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

// ── Supplier: Update inquiry status (accept/reject) ──
router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!business) {
      res.status(404).json({ error: "Business profile not found" });
      return;
    }

    const inquiry = await prisma.orderInquiry.findFirst({
      where: { id: req.params.id, supplierId: business.id },
      include: { buyer: true },
    }) as any;
    if (!inquiry) {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }

    const { status } = req.body;
    if (!["SEEN", "ACCEPTED", "REJECTED"].includes(status)) {
      res.status(400).json({ error: "status must be SEEN, ACCEPTED, or REJECTED" });
      return;
    }

    const updated = await prisma.orderInquiry.update({
      where: { id: inquiry.id },
      data: {
        status,
        respondedAt: ["ACCEPTED", "REJECTED"].includes(status) ? new Date() : undefined,
      },
    });

    // Notify buyer
    if (["ACCEPTED", "REJECTED"].includes(status)) {
      await prisma.notification.create({
        data: {
          userId: inquiry.buyer.userId,
          type: "ORDER",
          title: `Inquiry ${status.toLowerCase()}`,
          message: `${business.name} has ${status.toLowerCase()} your inquiry for ${inquiry.productName}`,
          link: `/portal/inquiries/${inquiry.id}`,
        },
      });
    }

    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inquiry" });
  }
});

export default router;
