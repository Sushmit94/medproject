import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import businessRoutes from "./routes/business.routes.js";
import locationRoutes from "./routes/location.routes.js";
import searchRoutes from "./routes/search.routes.js";
import licenseRoutes from "./routes/license.routes.js";
import staffLinkRoutes from "./routes/staffLink.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import campRoutes from "./routes/camp.routes.js";
import bloodRoutes from "./routes/blood.routes.js";
import jobRoutes from "./routes/job.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import contentRoutes from "./routes/content.routes.js";
import adRoutes from "./routes/ad.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import businessServiceRoutes from "./routes/businessService.routes.js";
import productCategoryRoutes from "./routes/productCategory.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import { runDailyTasks } from "./lib/cron.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "development" ? 1000 : 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/staff/link", staffLinkRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/inquiries", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/business-services", businessServiceRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/otp", otpRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Run daily tasks once on startup, then every 24 hours
  runDailyTasks();
  setInterval(runDailyTasks, 24 * 60 * 60 * 1000);
});

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
