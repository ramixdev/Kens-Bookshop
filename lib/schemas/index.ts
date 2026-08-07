import { z } from "zod";

// ── Auth schemas ───────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  school_branch: z.string().optional(),
});

// ── Checkout schemas ───────────────────────────────────────────────────────────

export const guestCheckoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z
    .string()
    .email("A valid email is required for guest checkout")
    .min(1, "Email is mandatory for guest checkout"),
  phone: z.string().min(1, "Phone number is required"),
});

export const deliveryAddressSchema = z.object({
  delivery_address: z.string().min(10, "Please enter a complete delivery address"),
});

export const branchCollectSchema = z.object({
  branch_id: z.number().int().positive("Please select a branch"),
});

// ── Product schemas ────────────────────────────────────────────────────────────

const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  photo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be positive"),
  stock_qty: z.coerce.number().int().min(0, "Stock cannot be negative"),
  product_code: z.string().min(1, "Product code is required"),
  availability: z.boolean().default(true),
});

export const bookSchema = baseProductSchema.extend({
  category: z.literal("book"),
  isbn: z.string().optional(),
  author: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
});

export const pastPaperSchema = baseProductSchema.extend({
  category: z.literal("past_paper"),
  grade: z.string().optional(),
  subject: z.string().optional(),
});

export const stationerySchema = baseProductSchema.extend({
  category: z.literal("stationery"),
  brand: z.string().optional(),
});

export const bundleSchema = z.object({
  name: z.string().min(1, "Bundle name is required"),
  photo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be positive"),
  product_code: z.string().min(1, "Product code is required"),
  grade: z.string().optional(),
  availability: z.boolean().default(true),
  product_ids: z.array(z.string()).min(1, "A bundle must contain at least one product"),
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type PastPaperInput = z.infer<typeof pastPaperSchema>;
export type StationeryInput = z.infer<typeof stationerySchema>;
export type BundleInput = z.infer<typeof bundleSchema>;
