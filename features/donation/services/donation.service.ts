/**
 * Donation Service Layer
 * 
 * Business logic layer for donation lifecycle and payment handling.
 * Enforces business rules and state validation before repository access.
 * 
 * @module features/donation/services
 */

import { prisma } from "@/lib/prisma";
import { CampaignStatus, DonationStatus, PaymentGateway } from "@prisma/client";
import * as donationRepo from "../repositories/donation.repository";
import { createDonationSchema, processPaymentSchema } from "../schemas/donation.schema";
import type {
  CreateDonationInput,
  ProcessPaymentInput,
  CreateDonationResult,
  ProcessPaymentResult,
} from "../types/donation.types";

/**
 * Creates a donation for an active campaign.
 * Business Rules:
 * 1. Campaign must exist and have status ACTIVE.
 * 2. Campaign must not be soft-deleted.
 * 3. Campaign end date must not have passed.
 * 4. Donor profile must exist.
 * 5. Amount must be valid (validated via Zod).
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

  // Validate donor profile
  const donor = await prisma.profile.findUnique({
    where: { id: donorId },
    select: { id: true },
  });

  if (!donor) {
    throw new Error("Donor profile not found. Please log in again.");
  }

  // Create donation record in DB
  const { donation, payment } = await donationRepo.createDonationRecord(
    donorId,
    parsed,
    PaymentGateway.MOCK
  );

  return {
    donationId: donation.id,
    amount: Number(donation.amount),
    currency: donation.currency,
    status: donation.status,
    paymentId: payment.id,
    paymentStatus: payment.status,
    gateway: payment.gateway,
  };
}

/**
 * Processes/verifies a payment and updates the donation & payment statuses safely.
 * Business Rules:
 * 1. Donation must exist.
 * 2. Can only process payment if current status is PENDING or AUTHORIZED.
 * 3. Safe state transitions: updates campaign amount only upon CAPTURED/COMPLETED status.
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

  // Mark completed (Mock / Gateway Verification)
  const updatedDonation = await donationRepo.markPaymentAndDonationCompleted(
    parsed.donationId,
    parsed.gatewayPaymentId,
    parsed.gatewaySignature
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
  };
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
