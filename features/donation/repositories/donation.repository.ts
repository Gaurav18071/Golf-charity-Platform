/**
 * Donation Repository Layer
 * 
 * Direct database access using Prisma ORM.
 * Strictly database operations without UI or HTTP logic.
 * 
 * @module features/donation/repositories
 */

import { prisma } from "@/lib/prisma";
import { DonationStatus, PaymentGateway, PaymentStatus, Prisma } from "@prisma/client";
import type {
  CreateDonationInput,
  DonationWithDetails,
  CampaignDonationStats,
  DonationReceiptDetails,
} from "../types/donation.types";

/**
 * Creates a Donation and associated Payment record atomically in PENDING status.
 */
export async function createDonationRecord(
  donorId: string,
  input: CreateDonationInput,
  gatewayOrderId: string,
  gateway: PaymentGateway = PaymentGateway.RAZORPAY,
  rawResponse?: Record<string, unknown>
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
        gatewayOrderId,
        amount: input.amount,
        currency: input.currency ?? "INR",
        status: PaymentStatus.PENDING,
        gatewayResponse: rawResponse as Prisma.InputJsonValue | undefined,
      },
    });

    return { donation, payment };
  });
}

/**
 * Finds a payment record by its gateway order ID.
 */
export async function findPaymentByGatewayOrderId(gatewayOrderId: string) {
  return await prisma.payment.findUnique({
    where: { gatewayOrderId },
    include: {
      donation: {
        include: {
          campaign: true,
          donor: true,
        },
      },
    },
  });
}

/**
 * Finds a payment record by its gateway payment ID.
 */
export async function findPaymentByGatewayPaymentId(gatewayPaymentId: string) {
  return await prisma.payment.findUnique({
    where: { gatewayPaymentId },
    include: {
      donation: {
        include: {
          campaign: true,
          donor: true,
        },
      },
    },
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
              taxExemptionNo: true,
              panNumber: true,
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
 * Retrieves full donation receipt details by donation ID.
 */
export async function getDonationReceiptDetails(
  donationId: string
): Promise<DonationReceiptDetails | null> {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      donor: {
        select: {
          fullName: true,
          email: true,
        },
      },
      campaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          organization: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              taxExemptionNo: true,
              panNumber: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          gateway: true,
          gatewayPaymentId: true,
          gatewayOrderId: true,
          status: true,
          processedAt: true,
        },
      },
    },
  });

  if (!donation) return null;

  return {
    donationId: donation.id,
    amount: Number(donation.amount),
    currency: donation.currency,
    status: donation.status,
    donatedAt: donation.donatedAt,
    isAnonymous: donation.isAnonymous,
    message: donation.message,
    donor: donation.donor,
    campaign: donation.campaign,
    payment: donation.payment,
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
          gatewayOrderId: true,
          gatewayPaymentId: true,
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
 * Ensures idempotency: If already completed, returns immediately without re-incrementing.
 */
export async function markPaymentAndDonationCompleted(
  donationId: string,
  gatewayPaymentId?: string,
  gatewaySignature?: string,
  rawResponse?: Record<string, unknown>
) {
  return await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { payment: true },
    });

    if (!donation) throw new Error("Donation not found");
    if (donation.status === DonationStatus.COMPLETED) {
      return donation; // Already completed (idempotent guard)
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
            gatewayPaymentId || donation.payment.gatewayPaymentId || `PAY_${donationId.slice(0, 8)}_${Date.now()}`,
          gatewaySignature: gatewaySignature || donation.payment.gatewaySignature,
          processedAt: now,
          netAmount: amountNumber,
          ...(rawResponse ? { gatewayResponse: rawResponse as Prisma.InputJsonValue } : {}),
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
  failureReason: string,
  rawResponse?: Record<string, unknown>
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
          ...(rawResponse ? { gatewayResponse: rawResponse as Prisma.InputJsonValue } : {}),
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
