import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
});

const printSizeSchema = z.object({
  label: z.string().trim().min(1).max(40),
  priceCents: z.number().int().min(100).max(1_000_000),
});

const printEditionSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(240),
});

export const productSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(8).max(4000),
  priceCents: z.number().int().min(100).max(1_000_000),
  category: z.enum(['print', 'sticker', 'original', 'pack']).default('print'),
  stock: z.number().int().min(0).max(9999).default(12),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  format: z.string().trim().min(1).max(80).default('Print A4'),
  sizes: z.array(printSizeSchema).max(8).optional(),
  editions: z.array(printEditionSchema).max(8).optional(),
  frame: z.enum(['portrait', 'landscape', 'square']).optional(),
  slug: z.string().trim().min(2).max(80).optional(),
});

export const updateProductSchema = productSchema.partial();

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  size: z.string().trim().min(1).max(40).optional(),
  edition: z.string().trim().min(1).max(80).optional(),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(30),
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  addressLine1: z.string().trim().min(4).max(160),
  addressLine2: z.string().trim().max(160).optional().or(z.literal('')),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(12),
  province: z.string().trim().max(80).optional().or(z.literal('')),
  country: z.string().trim().min(2).max(80).default('España'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  payment: z.object({
    cardName: z.string().trim().min(2).max(80),
    cardNumber: z.string().trim().min(13).max(24),
    expiry: z.string().trim().regex(/^\d{2}\/\d{2}$/, 'Formato MM/AA'),
    cvc: z.string().trim().regex(/^\d{3,4}$/),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['paid', 'packing', 'shipped', 'delivered', 'cancelled']),
});
