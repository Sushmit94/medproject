/**
 * Email service using SMTP (nodemailer).
 *
 * Env vars required:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
import nodemailer from "nodemailer";

/** Read env lazily so dotenv.config() has time to run before first use */
function getConfig() {
  return {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  };
}

function isConfigured(): boolean {
  const c = getConfig();
  return !!(c.host && c.user && c.pass && c.from);
}

let _transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const c = getConfig();
    _transporter = nodemailer.createTransport({
      host: c.host,
      port: c.port,
      secure: c.port === 465,
      auth: { user: c.user, pass: c.pass },
    });
  }
  return _transporter;
}

/** Escape HTML special chars to prevent injection in email templates */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[Email] Not configured — skipping email to", to);
    return false;
  }
  if (!to) return false;
  try {
    const c = getConfig();
    await getTransporter().sendMail({ from: c.from, to, subject, html });
    console.log("[Email] Sent to", to, "—", subject);
    return true;
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return false;
  }
}

// ── Wrapper for consistent look ──

function wrap(body: string): string {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="color:#0f766e;margin:0">Digital Medical</h2>
      </div>
      ${body}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px" />
      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0">
        This is an automated message from Digital Medical. Do not reply to this email.
      </p>
    </div>`;
}

// ── Public helpers ──

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  return sendMail(
    to,
    "Your Verification Code — Digital Medical",
    wrap(`
      <p style="color:#334155">Your one-time verification code is:</p>
      <div style="text-align:center;margin:20px 0">
        <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#0f766e">${otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
    `),
  );
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const url = getConfig().frontendUrl;
  return sendMail(
    to,
    "Welcome to Digital Medical!",
    wrap(`
      <p style="color:#334155">Hi <strong>${esc(name)}</strong>,</p>
      <p style="color:#334155">Welcome to Digital Medical — India's healthcare business platform.</p>
      <p style="color:#334155">Start exploring doctors, hospitals, pharmacies, and much more near you.</p>
      <div style="text-align:center;margin:20px 0">
        <a href="${url}" style="display:inline-block;padding:10px 28px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Explore Now</a>
      </div>
    `),
  );
}

export async function sendBusinessWelcomeEmail(to: string, name: string, businessName: string): Promise<boolean> {
  const url = getConfig().frontendUrl;
  return sendMail(
    to,
    "Business Registration Received — Digital Medical",
    wrap(`
      <p style="color:#334155">Hi <strong>${esc(name)}</strong>,</p>
      <p style="color:#334155">Thank you for registering <strong>${esc(businessName)}</strong> on Digital Medical.</p>
      <p style="color:#334155">Your listing is currently under review. We'll notify you once it's approved.</p>
      <div style="text-align:center;margin:20px 0">
        <a href="${url}/business" style="display:inline-block;padding:10px 28px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Go to Dashboard</a>
      </div>
    `),
  );
}

export async function sendApprovalEmail(to: string, businessName: string): Promise<boolean> {
  const url = getConfig().frontendUrl;
  return sendMail(
    to,
    "Your Business is Now Live! — Digital Medical",
    wrap(`
      <p style="color:#334155">Great news! <strong>${esc(businessName)}</strong> has been approved and is now live on Digital Medical.</p>
      <p style="color:#334155">You can now manage your profile, add products, services, and much more from your dashboard.</p>
      <div style="text-align:center;margin:20px 0">
        <a href="${url}/business" style="display:inline-block;padding:10px 28px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Open Dashboard</a>
      </div>
    `),
  );
}

export async function sendRejectionEmail(to: string, businessName: string): Promise<boolean> {
  return sendMail(
    to,
    "Listing Update — Digital Medical",
    wrap(`
      <p style="color:#334155">We're sorry — your listing for <strong>${esc(businessName)}</strong> could not be approved at this time.</p>
      <p style="color:#334155">Please review your business details and ensure all information is accurate, then contact support if you need assistance.</p>
    `),
  );
}

export async function sendPendingApprovalEmail(to: string, businessName: string, categoryName: string): Promise<boolean> {
  const url = getConfig().frontendUrl;
  return sendMail(
    to,
    `New Business Pending Approval — ${esc(businessName)}`,
    wrap(`
      <p style="color:#334155">A new business has registered and is awaiting approval:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#64748b">Business</td><td style="padding:6px 0;font-weight:600;color:#334155">${esc(businessName)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Category</td><td style="padding:6px 0;font-weight:600;color:#334155">${esc(categoryName)}</td></tr>
      </table>
      <div style="text-align:center;margin:20px 0">
        <a href="${url}/super-admin/businesses" style="display:inline-block;padding:10px 28px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Review Now</a>
      </div>
    `),
  );
}

export async function sendBirthdayEmail(to: string, ownerName: string, staffName: string): Promise<boolean> {
  return sendMail(
    to,
    `🎂 Birthday Reminder — ${esc(staffName)}`,
    wrap(`
      <p style="color:#334155">Hi <strong>${esc(ownerName)}</strong>,</p>
      <p style="color:#334155">Today is <strong>${esc(staffName)}</strong>'s birthday! 🎉</p>
      <p style="color:#334155">Don't forget to wish them!</p>
    `),
  );
}

export async function sendAnniversaryEmail(to: string, ownerName: string, staffName: string): Promise<boolean> {
  return sendMail(
    to,
    `💐 Work Anniversary — ${esc(staffName)}`,
    wrap(`
      <p style="color:#334155">Hi <strong>${esc(ownerName)}</strong>,</p>
      <p style="color:#334155">Today is <strong>${esc(staffName)}</strong>'s work anniversary! Congratulate them.</p>
    `),
  );
}

export async function sendLicenseExpiryEmail(
  to: string,
  businessName: string,
  licenseType: string,
  licenseNo: string,
  daysLeft: number,
  expiryDate: string,
): Promise<boolean> {
  const urgency = daysLeft <= 3 ? "color:#dc2626;font-weight:700" : "color:#f59e0b;font-weight:600";
  const url = getConfig().frontendUrl;
  return sendMail(
    to,
    `\u26a0\ufe0f License Expiring in ${daysLeft} day${daysLeft > 1 ? "s" : ""} \u2014 ${esc(businessName)}`,
    wrap(`
      <p style="color:#334155">Hi <strong>${esc(businessName)}</strong>,</p>
      <p style="color:#334155">Your <strong>${esc(licenseType)}</strong> (${esc(licenseNo)}) expires on <span style="${urgency}">${esc(expiryDate)}</span> \u2014 that's <span style="${urgency}">${daysLeft} day${daysLeft > 1 ? "s" : ""}</span> away.</p>
      <p style="color:#334155">Please renew it at the earliest to avoid disruption.</p>
      <div style="text-align:center;margin:20px 0">
        <a href="${url}/business/licenses" style="display:inline-block;padding:10px 28px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Manage Licenses</a>
      </div>
    `),
  );
}

export async function sendOrderInquiryEmail(
  to: string,
  supplierName: string,
  buyerName: string,
  productName: string,
  quantity: number,
  unit?: string,
  notes?: string,
): Promise<boolean> {
  return sendMail(
    to,
    `New Order Inquiry from ${esc(buyerName)} — Digital Medical`,
    wrap(`
      <p style="color:#334155">Hi <strong>${esc(supplierName)}</strong>,</p>
      <p style="color:#334155"><strong>${esc(buyerName)}</strong> has placed a new inquiry:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#64748b">Product</td><td style="padding:6px 0;font-weight:600;color:#334155">${esc(productName)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Quantity</td><td style="padding:6px 0;font-weight:600;color:#334155">${quantity} ${esc(unit || "units")}</td></tr>
        ${notes ? `<tr><td style="padding:6px 0;color:#64748b">Notes</td><td style="padding:6px 0;color:#334155">${esc(notes)}</td></tr>` : ""}
      </table>
      <div style="text-align:center;margin:20px 0">
        <a href="${getConfig().frontendUrl}/business/orders" style="display:inline-block;padding:10px 28px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">View Orders</a>
      </div>
    `),
  );
}
