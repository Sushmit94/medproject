/**
 * WhatsApp API service using innamico / BuzWap gateway.
 *
 * Env vars required:
 *   WA_USER, WA_PASS, WA_SENDER
 *
 * API reference  → documentation/whatsapp.md
 */

const WA_BASE = "http://sms.innamico.com/api/sendmsg.php";

/** Read env lazily so dotenv.config() has time to run before first use */
function getConfig() {
  return {
    user: process.env.WA_USER || "",
    pass: process.env.WA_PASS || "",
    sender: process.env.WA_SENDER || "",
  };
}

function isConfigured(): boolean {
  const c = getConfig();
  return !!(c.user && c.pass && c.sender);
}

/** Strip +91 / 91 prefix — innamico expects bare 10-digit numbers */
function bare10(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(3);
  return digits.length >= 10 ? digits.slice(-10) : null;
}

// ── Low-level sender ──

interface WASendOpts {
  phone: string;            // bare 10-digit
  template: string;         // template name
  params?: string[];        // replacement variables
  stype?: "normal" | "auth";
  htype?: "image" | "video" | "document";
  url?: string;             // media URL (public)
}

async function send(opts: WASendOpts): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg.user || !cfg.pass || !cfg.sender) {
    console.warn("[WA] Not configured — skipping message to", opts.phone);
    return false;
  }

  const qs = new URLSearchParams({
    user: cfg.user,
    pass: cfg.pass,
    sender: cfg.sender,
    phone: opts.phone,
    text: opts.template,
    priority: "wa",
    stype: opts.stype || "normal",
  });

  if (opts.params?.length) qs.set("Params", opts.params.join(","));
  if (opts.htype) qs.set("htype", opts.htype);
  if (opts.url) qs.set("url", opts.url);

  try {
    const res = await fetch(`${WA_BASE}?${qs.toString()}`);
    if (!res.ok) {
      console.error("[WA] API error:", res.status, await res.text());
      return false;
    }
    console.log("[WA] Sent to", opts.phone, "template:", opts.template);
    return true;
  } catch (err) {
    console.error("[WA] Send failed:", err);
    return false;
  }
}

// ── Public helpers (fire-and-forget) ──

/** Send an authentication OTP via WhatsApp */
export async function sendOtpWA(phone: string, otp: string): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({ phone: p, template: "OTP_VERIFY", stype: "auth", params: [otp] });
}

/** Welcome message after signup */
export async function sendWelcomeWA(phone: string, name: string): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({ phone: p, template: "WELCOME_MSG", params: [name] });
}

/** Business approval notification */
export async function sendApprovalWA(phone: string, businessName: string): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({ phone: p, template: "BIZ_APPROVED", params: [businessName] });
}

/** Business rejection notification */
export async function sendRejectionWA(phone: string, businessName: string): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({ phone: p, template: "BIZ_REJECTED", params: [businessName] });
}

/** Birthday greeting */
export async function sendBirthdayWA(phone: string, staffName: string): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({ phone: p, template: "BIRTHDAY_WISH", params: [staffName] });
}

/** Anniversary greeting */
export async function sendAnniversaryWA(phone: string, staffName: string): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({ phone: p, template: "ANNIVERSARY_WISH", params: [staffName] });
}

/** License expiry reminder */
export async function sendLicenseExpiryWA(
  phone: string,
  businessName: string,
  licenseType: string,
  licenseNo: string,
  daysLeft: number,
): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({
    phone: p,
    template: "LICENSE_EXPIRY",
    params: [businessName, licenseType, licenseNo, String(daysLeft)],
  });
}

/** Order inquiry notification to supplier */
export async function sendOrderInquiryWA(
  phone: string,
  supplierName: string,
  buyerName: string,
  productName: string,
  quantity: number,
  unit?: string,
): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({
    phone: p,
    template: "ORDER_INQUIRY",
    params: [supplierName, buyerName, productName, `${quantity} ${unit || "units"}`],
  });
}

/** Notify super-admins about a new pending business */
export async function sendPendingApprovalWA(
  phone: string,
  businessName: string,
  categoryName: string,
): Promise<boolean> {
  const p = bare10(phone);
  if (!p) return false;
  return send({
    phone: p,
    template: "PENDING_APPROVAL",
    params: [businessName, categoryName],
  });
}
