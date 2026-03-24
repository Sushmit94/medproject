import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit Indian mobile number"),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  identifier: z.string().min(3), // email, phone, or businessId
  password: z.string().min(1),
});

export const businessSignupSchema = z.object({
  name: z.string().min(2).max(100),
  businessName: z.string().min(2).max(200),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit Indian mobile number"),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  categoryId: z.string().min(1),
  subCategoryIds: z.array(z.string()).optional(),
  areaId: z.string().optional(),
  address: z.string().optional(),
  supplyChainRole: z.enum(["MANUFACTURER", "WHOLESALER", "RETAILER"]).optional(),
});
