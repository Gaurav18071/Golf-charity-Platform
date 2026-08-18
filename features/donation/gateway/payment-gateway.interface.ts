/**
 * Payment Gateway Interface & Types
 * 
 * Standard abstraction for payment providers (Razorpay, Stripe, Mock).
 * Enables interchangeable gateway implementations with uniform contracts.
 * 
 * @module features/donation/gateway
 */

import { PaymentGateway } from "@prisma/client";

export interface CreateOrderParams {
  donationId: string;
  amount: number; // in standard currency units (e.g. INR 500)
  currency: string; // e.g. "INR"
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrderResult {
  orderId: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  keyId?: string; // Public key for client checkout if applicable
  rawResponse?: Record<string, unknown>;
}

export interface VerifyPaymentParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  expectedAmount?: number;
  expectedCurrency?: string;
}

export interface GatewayVerificationResult {
  isValid: boolean;
  gatewayPaymentId: string;
  gatewayOrderId: string;
  amount?: number;
  currency?: string;
  status: "CAPTURED" | "FAILED" | "PENDING";
  failureReason?: string;
  rawResponse?: Record<string, unknown>;
}

export interface IPaymentGateway {
  readonly gatewayType: PaymentGateway;

  /**
   * Generates a payment order on the gateway
   */
  createOrder(params: CreateOrderParams): Promise<GatewayOrderResult>;

  /**
   * Verifies payment authenticity server-side using cryptographic signatures
   */
  verifyPayment(params: VerifyPaymentParams): Promise<GatewayVerificationResult>;

  /**
   * Validates webhook request signature against raw payload
   */
  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean;
}
