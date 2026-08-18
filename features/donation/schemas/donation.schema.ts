/**
 * Donation Zod Validation Schemas
 * 
 * Input validation schemas for donation creation and payment processing.
 * 
 * @module features/donation/schemas
 */

import { z } from "zod";
import { PaymentGateway } from "@prisma/client";

export const MIN_DONATION_AMOUNT = 10; // INR 10
export const MAX_DONATION_AMOUNT = 10_000_000; // INR 1 Crore

export const createDonationSchema = z.object({
  campaignId: z
    .string()
    .min(1, "Campaign ID is required")
    .uuid("Invalid campaign ID format"),
  amount: z
    .number()
    .min(MIN_DONATION_AMOUNT, `Minimum donation amount is ₹${MIN_DONATION_AMOUNT}`)
    .max(MAX_DONATION_AMOUNT, `Maximum donation amount is ₹${MAX_DONATION_AMOUNT.toLocaleString('en-IN')}`),
  currency: z.string().default("INR"),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

export const processPaymentSchema = z.object({
  donationId: z
    .string()
    .min(1, "Donation ID is required")
    .uuid("Invalid donation ID format"),
  gateway: z.nativeEnum(PaymentGateway).default(PaymentGateway.RAZORPAY),
  gatewayOrderId: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
  failureReason: z.string().optional(),
});

export type CreateDonationInputSchema = z.infer<typeof createDonationSchema>;
export type ProcessPaymentInputSchema = z.infer<typeof processPaymentSchema>;
