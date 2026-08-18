/**
 * Razorpay Payment Gateway Implementation
 * 
 * Implements IPaymentGateway for Razorpay payment processing.
 * Handles official order creation, HMAC-SHA256 signature verification, and webhook validation.
 * 
 * @module features/donation/gateway
 */

import crypto from "crypto";
import { PaymentGateway } from "@prisma/client";
import type {
  IPaymentGateway,
  CreateOrderParams,
  GatewayOrderResult,
  VerifyPaymentParams,
  GatewayVerificationResult,
} from "./payment-gateway.interface";

export class RazorpayGateway implements IPaymentGateway {
  public readonly gatewayType: PaymentGateway = PaymentGateway.RAZORPAY;

  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  }

  /**
   * Creates a Razorpay Order via REST API.
   * If real credentials are provided, calls https://api.razorpay.com/v1/orders.
   * If credentials are not configured, generates a deterministic test order with clear server warnings.
   */
  public async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const amountInPaise = Math.round(params.amount * 100);

    if (this.keyId && this.keySecret) {
      const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: params.currency || "INR",
          receipt: params.receipt,
          notes: {
            donationId: params.donationId,
            ...(params.notes || {}),
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error("[RazorpayGateway.createOrder] API Error:", response.status, errBody);
        throw new Error(`Razorpay Order creation failed: ${response.statusText} (${errBody})`);
      }

      const data = await response.json();
      return {
        orderId: data.id,
        gateway: PaymentGateway.RAZORPAY,
        amount: params.amount,
        currency: data.currency || "INR",
        keyId: this.keyId,
        rawResponse: data,
      };
    }

    // Development/Test Mode fallback when Razorpay credentials are not yet set
    console.warn(
      "[RazorpayGateway] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment. Using test order generation."
    );

    const testOrderId = `order_rzp_test_${params.donationId.replace(/-/g, "").slice(0, 14)}_${Date.now()}`;

    return {
      orderId: testOrderId,
      gateway: PaymentGateway.RAZORPAY,
      amount: params.amount,
      currency: params.currency || "INR",
      keyId: this.keyId || "rzp_test_placeholder",
      rawResponse: {
        id: testOrderId,
        amount: amountInPaise,
        currency: params.currency || "INR",
        receipt: params.receipt,
        status: "created",
        mode: "test_fallback",
      },
    };
  }

  /**
   * Verifies Razorpay payment signature server-side.
   * Signature algorithm: HMAC-SHA256 of `${order_id}|${payment_id}` using `RAZORPAY_KEY_SECRET`.
   */
  public async verifyPayment(
    params: VerifyPaymentParams
  ): Promise<GatewayVerificationResult> {
    const { gatewayOrderId, gatewayPaymentId, gatewaySignature } = params;

    if (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
      return {
        isValid: false,
        gatewayOrderId,
        gatewayPaymentId,
        status: "FAILED",
        failureReason: "Missing required verification fields (order ID, payment ID, or signature)",
      };
    }

    // If real key secret exists, verify cryptographically
    if (this.keySecret) {
      const generatedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(`${gatewayOrderId}|${gatewayPaymentId}`)
        .digest("hex");

      const isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(gatewaySignature)
      );

      if (!isValid) {
        return {
          isValid: false,
          gatewayOrderId,
          gatewayPaymentId,
          status: "FAILED",
          failureReason: "Invalid cryptographic payment signature",
        };
      }

      return {
        isValid: true,
        gatewayOrderId,
        gatewayPaymentId,
        status: "CAPTURED",
      };
    }

    // Test fallback verification: ensure signature is non-empty and order/payment matches test prefix
    const isTestOrder = gatewayOrderId.startsWith("order_rzp_test_") || gatewayOrderId.startsWith("order_");
    const isTestPayment = gatewayPaymentId.startsWith("pay_");

    if (isTestOrder && isTestPayment && gatewaySignature.length >= 10) {
      return {
        isValid: true,
        gatewayOrderId,
        gatewayPaymentId,
        status: "CAPTURED",
      };
    }

    return {
      isValid: false,
      gatewayOrderId,
      gatewayPaymentId,
      status: "FAILED",
      failureReason: "Signature verification failed",
    };
  }

  /**
   * Verifies webhook payload signature.
   * HMAC-SHA256 of raw body against RAZORPAY_WEBHOOK_SECRET.
   */
  public verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secretOverride?: string
  ): boolean {
    const secret = secretOverride || this.webhookSecret;
    if (!secret || !signature) {
      console.warn("[RazorpayGateway.verifyWebhookSignature] Missing webhook secret or signature header.");
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );
    } catch (err) {
      console.error("[RazorpayGateway.verifyWebhookSignature] Error verifying signature:", err);
      return false;
    }
  }
}
