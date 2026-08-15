/**
 * Donation Repository Layer
 * 
 * Direct database access using Prisma ORM.
 * Strictly database operations without UI or HTTP logic.
 * 
 * @module features/donation/repositories
 */

import { prisma } from "@/lib/prisma";
import { DonationStatus, PaymentGateway, PaymentStatus } from "@prisma/client";
import type {
  CreateDonationInput,
  DonationWithDetails,
  CampaignDonationStats,
} from "../types/donation.types";

/**
 * Creates a Donation and associated Payment record atomically in PENDING status.
 */
export async function createDonationRecord(
  donorId: string,
  input: CreateDonationInput,
  gateway: PaymentGateway = PaymentGateway.MOCK
) {
  return await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.create({
      data: {
        donorId,
        campaignId: input.campaignId,
        amount: input.amount,
        currency: input.currency ?? "INR",
        isAnonymous: input.isAnonymous ?? false,
        message: input.message || null,
        status: DonationStatus.PENDING,
      },
    });

    const payment = await tx.payment.create({
      data: {
        donationId: donation.id,
        gateway,
        gatewayOrderId: `ORD_${donation.id.slice(0, 8)}_${Date.now()}`,
        amount: input.amount,
        currency: input.currency ?? "INR",
        status: PaymentStatus.PENDING,
      },
    });

    return { donation, payment };
  });
}

/**
 * Retrieves full donation record by ID.
 */
export async function findDonationById(
  donationId: string
): Promise<DonationWithDetails | null> {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      donor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
      campaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          organization: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          gateway: true,
          gatewayOrderId: true,
          gatewayPaymentId: true,
          status: true,
          processedAt: true,
          failureReason: true,
        },
      },
    },
  });

  if (!donation) return null;

  return {
    ...donation,
    amount: Number(donation.amount),
    payment: donation.payment
      ? {
          ...donation.payment,
        }
      : null,
  };
}

/**
 * Retrieves donor donation history with campaign & organization info.
 */
export async function findDonorDonations(
  donorId: string,
  statusFilter?: DonationStatus,
  take = 50
) {
  const donations = await prisma.donation.findMany({
    where: {
      donorId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          gateway: true,
          status: true,
          processedAt: true,
        },
      },
    },
  });

  return donations.map((d) => ({
    ...d,
    amount: Number(d.amount),
  }));
}

/**
 * Calculates aggregated donation statistics for a donor.
 */
export async function getDonorSummaryStats(donorId: string) {
  const summary = await prisma.donation.groupBy({
    by: ["status"],
    where: { donorId },
    _count: { id: true },
    _sum: { amount: true },
  });

  const countMap = Object.fromEntries(summary.map((s) => [s.status, s._count.id]));
  const amountMap = Object.fromEntries(
    summary.map((s) => [s.status, Number(s._sum.amount ?? 0)])
  );

  const completedCount = countMap[DonationStatus.COMPLETED] ?? 0;
  const pendingCount = countMap[DonationStatus.PENDING] ?? 0;
  const failedCount =
    (countMap[DonationStatus.FAILED] ?? 0) +
    (countMap[DonationStatus.REFUNDED] ?? 0);
  const totalDonated = amountMap[DonationStatus.COMPLETED] ?? 0;

  // Additional stats for completed donations
  const completedDonations = await prisma.donation.findMany({
    where: { donorId, status: DonationStatus.COMPLETED },
    select: { amount: true, campaignId: true },
  });

  const campaignsSupportedCount = new Set(
    completedDonations.map((d) => d.campaignId)
  ).size;
  const averageDonation =
    completedCount > 0 ? totalDonated / completedCount : 0;
  const largestDonation =
    completedDonations.length > 0
      ? Math.max(...completedDonations.map((d) => Number(d.amount)))
      : 0;

  return {
    totalDonated,
    completedCount,
    pendingCount,
    failedCount,
    campaignsSupportedCount,
    averageDonation,
    largestDonation,
  };
}

/**
 * Calculates campaign donation statistics.
 */
export async function getCampaignDonationStats(
  campaignId: string
): Promise<CampaignDonationStats> {
  const [aggregates, recentDonations] = await Promise.all([
    prisma.donation.aggregate({
      where: { campaignId, status: DonationStatus.COMPLETED },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.findMany({
      where: { campaignId, status: DonationStatus.COMPLETED },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        donor: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ]);

  // Unique donor count
  const donorGroup = await prisma.donation.groupBy({
    by: ["donorId"],
    where: { campaignId, status: DonationStatus.COMPLETED },
  });

  return {
    totalRaised: Number(aggregates._sum.amount ?? 0),
    donationCount: aggregates._count.id,
    donorCount: donorGroup.length,
    recentDonations: recentDonations.map((d) => ({
      id: d.id,
      amount: Number(d.amount),
      currency: d.currency,
      isAnonymous: d.isAnonymous,
      donorName: d.isAnonymous ? "Anonymous Donor" : d.donor.fullName,
      donatedAt: d.donatedAt,
      createdAt: d.createdAt,
    })),
  };
}

/**
 * Safely marks payment as CAPTURED and donation as COMPLETED,
 * and atomically increments campaign's currentAmount.
 */
export async function markPaymentAndDonationCompleted(
  donationId: string,
  gatewayPaymentId?: string,
  gatewaySignature?: string
) {
  return await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { payment: true },
    });

    if (!donation) throw new Error("Donation not found");
    if (donation.status === DonationStatus.COMPLETED) {
      return donation; // Already completed (idempotent)
    }

    const now = new Date();
    const amountNumber = Number(donation.amount);

    // Update payment
    if (donation.payment) {
      await tx.payment.update({
        where: { id: donation.payment.id },
        data: {
          status: PaymentStatus.CAPTURED,
          gatewayPaymentId:
            gatewayPaymentId || `PAY_${donationId.slice(0, 8)}_${Date.now()}`,
          gatewaySignature: gatewaySignature || null,
          processedAt: now,
          netAmount: amountNumber,
        },
      });
    }

    // Update donation
    const updatedDonation = await tx.donation.update({
      where: { id: donationId },
      data: {
        status: DonationStatus.COMPLETED,
        donatedAt: now,
      },
    });

    // Atomically increment campaign current amount
    await tx.campaign.update({
      where: { id: donation.campaignId },
      data: {
        currentAmount: {
          increment: amountNumber,
        },
      },
    });

    return updatedDonation;
  });
}

/**
 * Marks payment and donation as FAILED.
 */
export async function markPaymentAndDonationFailed(
  donationId: string,
  failureReason: string
) {
  return await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { payment: true },
    });

    if (!donation) throw new Error("Donation not found");

    if (donation.payment) {
      await tx.payment.update({
        where: { id: donation.payment.id },
        data: {
          status: PaymentStatus.FAILED,
          failureReason,
          processedAt: new Date(),
        },
      });
    }

    return await tx.donation.update({
      where: { id: donationId },
      data: {
        status: DonationStatus.FAILED,
      },
    });
  });
}
