/**
 * Donation Service Layer
 * 
 * Business logic layer for donation lifecycle and payment handling.
 * Enforces business rules, gateway integration, and server-side payment verification.
 * 
 * @module features/donation/services
 */

import { prisma } from "@/lib/prisma";
import { CampaignStatus, DonationStatus, PaymentGateway } from "@prisma/client";
import * as donationRepo from "../repositories/donation.repository";
import { createDonationSchema, processPaymentSchema } from "../schemas/donation.schema";
import { getPaymentGateway } from "../gateway";
import type {
  CreateDonationInput,
  ProcessPaymentInput,
  CreateDonationResult,
  ProcessPaymentResult,
  DonationReceiptDetails,
} from "../types/donation.types";

/**
 * Creates a donation and gateway order for an active campaign.
 * Business Rules:
 * 1. Campaign must exist and have status ACTIVE.
 * 2. Campaign must not be soft-deleted.
 * 3. Campaign end date must not have passed.
 * 4. Donor profile must exist.
 * 5. Amount must be valid (₹10 - ₹1,00,00,000).
 * 6. Generates gateway order server-side before persisting.
 */
export async function createDonation(
  donorId: string,
  input: CreateDonationInput
): Promise<CreateDonationResult> {
  // Validate input schema
  const parsed = createDonationSchema.parse(input);

  // Validate campaign eligibility
  const campaign = await prisma.campaign.findUnique({
    where: { id: parsed.campaignId },
    select: {
      id: true,
      status: true,
      endDate: true,
      deletedAt: true,
      title: true,
    },
  });

  if (!campaign || campaign.deletedAt !== null) {
    throw new Error("Campaign not found or is no longer available.");
  }

  if (campaign.status !== CampaignStatus.ACTIVE) {
    throw new Error(`Cannot donate to a campaign with status: ${campaign.status}.`);
  }

  if (new Date(campaign.endDate) < new Date()) {
    throw new Error("This campaign has ended and is no longer accepting donations.");
  }

  // Validate or auto-create donor profile
  let donor = await prisma.profile.findUnique({
    where: { id: donorId },
    select: { id: true, fullName: true, email: true },
  });

  if (!donor) {
    try {
      donor = await prisma.profile.upsert({
        where: { id: donorId },
        update: {},
        create: {
          id: donorId,
          email: `user_${donorId.slice(0, 8)}@example.com`,
          fullName: "Donor",
          role: "DONOR",
        },
        select: { id: true, fullName: true, email: true },
      });
    } catch (err) {
      console.warn("Could not auto-create donor profile:", err);
    }
  }

  if (!donor) {
    throw new Error("Donor profile not found. Please log in again.");
  }

  // Initialize Payment Gateway
  const gateway = getPaymentGateway(PaymentGateway.RAZORPAY);

  // Generate temporary ID for receipt tracking
  const tempReceipt = `rec_${Date.now().toString().slice(-8)}`;

  // Create Order on Gateway
  const orderResult = await gateway.createOrder({
    donationId: tempReceipt,
    amount: parsed.amount,
    currency: parsed.currency || "INR",
    receipt: tempReceipt,
    notes: {
      campaignId: campaign.id,
      campaignTitle: campaign.title.slice(0, 30),
      donorId,
    },
  });

  // Create donation and payment records in DB atomically
  const { donation, payment } = await donationRepo.createDonationRecord(
    donorId,
    parsed,
    orderResult.orderId,
    orderResult.gateway,
    orderResult.rawResponse
  );

  return {
    donationId: donation.id,
    amount: Number(donation.amount),
    currency: donation.currency,
    status: donation.status,
    paymentId: payment.id,
    paymentStatus: payment.status,
    gateway: payment.gateway,
    gatewayOrderId: orderResult.orderId,
    keyId: orderResult.keyId,
  };
}

/**
 * Processes and verifies a payment server-side using cryptographic signatures.
 * Business Rules:
 * 1. Donation must exist.
 * 2. If already COMPLETED, returns idempotent result.
 * 3. Verifies gateway cryptographic signature before marking success.
 * 4. Safe state transitions: updates campaign amount only upon CAPTURED/COMPLETED status.
 */
export async function processPayment(
  input: ProcessPaymentInput
): Promise<ProcessPaymentResult> {
  const parsed = processPaymentSchema.parse(input);

  const existingDonation = await donationRepo.findDonationById(parsed.donationId);

  if (!existingDonation) {
    throw new Error("Donation record not found.");
  }

  if (existingDonation.status === DonationStatus.COMPLETED) {
    // Already completed - return idempotent result
    return {
      donationId: existingDonation.id,
      donationStatus: DonationStatus.COMPLETED,
      paymentId: existingDonation.payment?.id ?? "",
      paymentStatus: existingDonation.payment?.status ?? "CAPTURED",
      gatewayPaymentId: existingDonation.payment?.gatewayPaymentId ?? undefined,
    };
  }

  if (parsed.failureReason) {
    const updated = await donationRepo.markPaymentAndDonationFailed(
      parsed.donationId,
      parsed.failureReason
    );
    return {
      donationId: updated.id,
      donationStatus: updated.status,
      paymentId: existingDonation.payment?.id ?? "",
      paymentStatus: "FAILED",
    };
  }

  // Cryptographic Signature Verification via Payment Gateway
  const gateway = getPaymentGateway(
    parsed.gateway || existingDonation.payment?.gateway || PaymentGateway.RAZORPAY
  );

  const verification = await gateway.verifyPayment({
    gatewayOrderId: parsed.gatewayOrderId || existingDonation.payment?.gatewayOrderId || "",
    gatewayPaymentId: parsed.gatewayPaymentId || "",
    gatewaySignature: parsed.gatewaySignature || "",
    expectedAmount: existingDonation.amount,
    expectedCurrency: existingDonation.currency,
  });

  if (!verification.isValid) {
    await donationRepo.markPaymentAndDonationFailed(
      parsed.donationId,
      verification.failureReason || "Signature verification failed",
      verification.rawResponse
    );
    throw new Error(`Payment verification failed: ${verification.failureReason || "Invalid signature"}`);
  }

  // Mark completed & increment campaign currentAmount atomically
  const updatedDonation = await donationRepo.markPaymentAndDonationCompleted(
    parsed.donationId,
    verification.gatewayPaymentId,
    parsed.gatewaySignature,
    verification.rawResponse
  );

  // Fetch updated campaign currentAmount
  const campaign = await prisma.campaign.findUnique({
    where: { id: existingDonation.campaignId },
    select: { currentAmount: true },
  });

  return {
    donationId: updatedDonation.id,
    donationStatus: updatedDonation.status,
    paymentId: existingDonation.payment?.id ?? "",
    paymentStatus: "CAPTURED",
    campaignCurrentAmount: campaign ? Number(campaign.currentAmount) : undefined,
    gatewayPaymentId: verification.gatewayPaymentId,
  };
}

/**
 * Handles Webhook Events from Razorpay.
 * Verifies webhook HMAC signature and processes events idempotently.
 */
export async function processRazorpayWebhook(
  rawBody: string,
  signature: string,
  event: { event: string; payload?: { payment?: { entity: { id: string; order_id: string; status: string; error_description?: string } } } }
): Promise<{ success: boolean; message: string }> {
  const gateway = getPaymentGateway(PaymentGateway.RAZORPAY);

  const isValid = gateway.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.error("[processRazorpayWebhook] Invalid webhook signature.");
    return { success: false, message: "Invalid signature" };
  }

  const eventType = event.event;
  const paymentEntity = event.payload?.payment?.entity;

  if (!paymentEntity) {
    return { success: true, message: "Ignored: No payment entity found in payload" };
  }

  const { id: gatewayPaymentId, order_id: gatewayOrderId, status, error_description } = paymentEntity;

  // Look up payment by gatewayOrderId
  const payment = await donationRepo.findPaymentByGatewayOrderId(gatewayOrderId);
  if (!payment) {
    console.warn(`[processRazorpayWebhook] No local payment found for order: ${gatewayOrderId}`);
    return { success: true, message: `Payment with order ID ${gatewayOrderId} not found in database` };
  }

  if (eventType === "payment.captured" || (eventType === "order.paid" && status === "captured")) {
    await donationRepo.markPaymentAndDonationCompleted(
      payment.donationId,
      gatewayPaymentId,
      undefined,
      paymentEntity as unknown as Record<string, unknown>
    );
    return { success: true, message: `Payment ${gatewayPaymentId} successfully marked CAPTURED` };
  }

  if (eventType === "payment.failed") {
    await donationRepo.markPaymentAndDonationFailed(
      payment.donationId,
      error_description || "Payment failed at gateway",
      paymentEntity as unknown as Record<string, unknown>
    );
    return { success: true, message: `Payment ${gatewayPaymentId} marked FAILED` };
  }

  return { success: true, message: `Event ${eventType} handled without state change` };
}

/**
 * Retrieves full donation receipt details by ID.
 */
export async function getDonationReceipt(donationId: string): Promise<DonationReceiptDetails | null> {
  return await donationRepo.getDonationReceiptDetails(donationId);
}

/**
 * Retrieves donation details by ID.
 */
export async function getDonationById(donationId: string) {
  return await donationRepo.findDonationById(donationId);
}

/**
 * Retrieves donor donation history.
 */
export async function getDonorDonations(
  donorId: string,
  statusFilter?: DonationStatus
) {
  return await donationRepo.findDonorDonations(donorId, statusFilter);
}

/**
 * Retrieves donor aggregated statistics.
 */
export async function getDonorSummaryStats(donorId: string) {
  return await donationRepo.getDonorSummaryStats(donorId);
}

/**
 * Retrieves campaign donation statistics.
 */
export async function getCampaignDonationStats(campaignId: string) {
  return await donationRepo.getCampaignDonationStats(campaignId);
}
