import prisma from "../lib/prisma.js";
import { sendLicenseExpiryWA, sendBirthdayWA, sendAnniversaryWA } from "./whatsapp.js";
import { sendLicenseExpiryEmail, sendBirthdayEmail, sendAnniversaryEmail } from "./email.js";

/**
 * Check for today's birthdays and anniversaries.
 * Create notification records for the business owners.
 */
export async function checkBirthdaysAndAnniversaries() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  try {
    // Find staff with birthday today
    const birthdayStaff = await prisma.$queryRawUnsafe<
      Array<{ id: string; name: string; businessId: string; userId: string; businessName: string; ownerName: string; ownerPhone: string | null; ownerEmail: string | null; staffPhone: string | null; staffWhatsapp: string | null }>
    >(
      `SELECT sm."id", sm."name", sm."businessId", bp."userId", bp."name" as "businessName",
              u."name" as "ownerName", u."phone" as "ownerPhone", u."email" as "ownerEmail",
              sm."phone" as "staffPhone", sm."whatsapp" as "staffWhatsapp"
       FROM "StaffMember" sm
       JOIN "BusinessProfile" bp ON sm."businessId" = bp."id"
       JOIN "User" u ON bp."userId" = u."id"
       WHERE sm."isActive" = true
       AND EXTRACT(MONTH FROM sm."birthday") = $1
       AND EXTRACT(DAY FROM sm."birthday") = $2`,
      month,
      day
    );

    for (const s of birthdayStaff) {
      await prisma.notification.create({
        data: {
          userId: s.userId,
          type: "BIRTHDAY",
          title: `Happy Birthday ${s.name}! 🎂`,
          message: `Today is ${s.name}'s birthday. Send them your wishes!`,
          link: `/portal/staff`,
        },
      });

      // WhatsApp & email to business owner
      if (s.ownerPhone) sendBirthdayWA(s.ownerPhone, s.name).catch(() => {});
      if (s.ownerEmail) sendBirthdayEmail(s.ownerEmail, s.ownerName, s.name).catch(() => {});
    }

    // Find staff with anniversary today
    const anniversaryStaff = await prisma.$queryRawUnsafe<
      Array<{ id: string; name: string; businessId: string; userId: string; businessName: string; ownerName: string; ownerPhone: string | null; ownerEmail: string | null }>
    >(
      `SELECT sm."id", sm."name", sm."businessId", bp."userId", bp."name" as "businessName",
              u."name" as "ownerName", u."phone" as "ownerPhone", u."email" as "ownerEmail"
       FROM "StaffMember" sm
       JOIN "BusinessProfile" bp ON sm."businessId" = bp."id"
       JOIN "User" u ON bp."userId" = u."id"
       WHERE sm."isActive" = true
       AND EXTRACT(MONTH FROM sm."anniversary") = $1
       AND EXTRACT(DAY FROM sm."anniversary") = $2`,
      month,
      day
    );

    for (const s of anniversaryStaff) {
      await prisma.notification.create({
        data: {
          userId: s.userId,
          type: "ANNIVERSARY",
          title: `Happy Anniversary ${s.name}! 💐`,
          message: `Today is ${s.name}'s work anniversary. Congratulate them!`,
          link: `/portal/staff`,
        },
      });

      // WhatsApp & email to business owner
      if (s.ownerPhone) sendAnniversaryWA(s.ownerPhone, s.name).catch(() => {});
      if (s.ownerEmail) sendAnniversaryEmail(s.ownerEmail, s.ownerName, s.name).catch(() => {});
    }

    console.log(
      `[Cron] Birthdays: ${birthdayStaff.length}, Anniversaries: ${anniversaryStaff.length}`
    );
  } catch (err) {
    console.error("[Cron] Birthday/Anniversary check failed:", err);
  }
}

/**
 * Check for licenses expiring within the next 30 days.
 * Notify business owners and admins about upcoming expirations.
 */
export async function checkLicenseExpiry() {
  try {
    const thirtyDaysOut = new Date();
    thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

    const expiringLicenses = await prisma.license.findMany({
      where: {
        status: "VERIFIED",
        expiryDate: {
          gte: new Date(),
          lte: thirtyDaysOut,
        },
      },
      include: {
        business: {
          select: { userId: true, name: true, businessId: true, phone1: true, whatsapp: true, email: true },
        },
      },
    });

    for (const license of expiringLicenses) {
      const daysLeft = Math.ceil(
        (license.expiryDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Only notify at 30, 15, 7, 3, 1 days
      if (![30, 15, 7, 3, 1].includes(daysLeft)) continue;

      // Check if we already sent this notification today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await prisma.notification.findFirst({
        where: {
          userId: license.business.userId,
          type: "LICENSE_EXPIRY",
          createdAt: { gte: today },
          message: { contains: license.licenseNo },
        },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: license.business.userId,
          type: "LICENSE_EXPIRY",
          title: `License Expiring in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
          message: `Your ${license.type} (${license.licenseNo}) expires on ${license.expiryDate!.toLocaleDateString()}. Please renew it soon.`,
          link: `/portal/licenses`,
        },
      });

      // Also send WhatsApp + email reminder (non-blocking)
      const phone = license.business.whatsapp || license.business.phone1;
      if (phone) {
        sendLicenseExpiryWA(
          phone,
          license.business.name,
          license.type,
          license.licenseNo,
          daysLeft,
        ).catch((err) => console.error("[Cron] WA license reminder failed:", err));
      }
      if (license.business.email) {
        sendLicenseExpiryEmail(
          license.business.email,
          license.business.name,
          license.type,
          license.licenseNo,
          daysLeft,
          license.expiryDate!.toLocaleDateString(),
        ).catch((err) => console.error("[Cron] Email license reminder failed:", err));
      }
    }

    // Also mark expired licenses
    await prisma.license.updateMany({
      where: {
        status: "VERIFIED",
        expiryDate: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    console.log(`[Cron] Checked ${expiringLicenses.length} expiring licenses`);
  } catch (err) {
    console.error("[Cron] License expiry check failed:", err);
  }
}

/**
 * Run all scheduled tasks. Call this daily (e.g., via setInterval or external scheduler).
 */
export async function runDailyTasks() {
  console.log(`[Cron] Running daily tasks at ${new Date().toISOString()}`);
  await checkBirthdaysAndAnniversaries();
  await checkLicenseExpiry();
  await cleanupExpiredOtps();
}

/**
 * Delete OTP records older than 24 hours to prevent table bloat.
 */
async function cleanupExpiredOtps() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count } = await prisma.otp.deleteMany({
      where: { createdAt: { lt: oneDayAgo } },
    });
    if (count > 0) console.log(`[Cron] Cleaned up ${count} expired OTP records`);
  } catch (err) {
    console.error("[Cron] OTP cleanup failed:", err);
  }
}
