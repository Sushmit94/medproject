import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { sendOtpWA } from "../lib/whatsapp.js";
import { sendOtpEmail } from "../lib/email.js";

const router = Router();

/** Generate a 6-digit OTP */
function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ── Send OTP ──
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { phone, email, purpose = "SIGNUP" } = req.body;

    if (!phone && !email) {
      res.status(400).json({ error: "Phone or email is required" });
      return;
    }

    // Rate-limit: max 5 OTPs per phone/email in last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await prisma.otp.count({
      where: {
        ...(phone ? { phone } : { email }),
        purpose,
        createdAt: { gte: tenMinAgo },
      },
    });
    if (recent >= 5) {
      res.status(429).json({ error: "Too many OTP requests. Try again later." });
      return;
    }

    // const code = generateOtp();
    const code = "123456"; // For testing, replace with generateOtp() in production
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otp.create({
      data: { phone: phone || null, email: email || null, code, purpose, expiresAt },
    });

    // Send via WhatsApp and/or email (non-blocking)
    if (phone) sendOtpWA(phone, code).catch(() => {});
    if (email) sendOtpEmail(email, code).catch(() => {});

    res.json({ message: "OTP sent successfully" });
  } catch {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ── Verify OTP ──
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { phone, email, code, purpose = "SIGNUP" } = req.body;

    if (!code || (!phone && !email)) {
      res.status(400).json({ error: "Phone/email and code are required" });
      return;
    }

    const otp = await prisma.otp.findFirst({
      where: {
        ...(phone ? { phone } : { email }),
        purpose,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      res.status(400).json({ error: "OTP expired or not found. Request a new one." });
      return;
    }

    if (otp.attempts >= 5) {
      res.status(429).json({ error: "Too many failed attempts. Request a new OTP." });
      return;
    }

    // Increment attempt counter before checking code
    await prisma.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });

    if (otp.code !== code) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    // Mark as verified
    await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

    res.json({ verified: true });
  } catch {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

export default router;
