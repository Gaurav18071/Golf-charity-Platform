/**
 * Donation Module Types
 * 
 * TypeScript interfaces and types for the donation and payment domain.
 * 
 * @module features/donation/types
 */

import type { DonationStatus, PaymentGateway, PaymentStatus } from "@prisma/client";

export interface CreateDonationInput {
  campaignId: string;
  amount: number;
  currency?: string;
  isAnonymous?: boolean;
  message?: string;
}

export interface ProcessPaymentInput {
  donationId: string;
  gateway?: PaymentGateway;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  failureReason?: string;
}

export interface DonationWithDetails {
  id: string;
  donorId: string;
  campaignId: string;
  amount: number;
  currency: string;
  isAnonymous: boolean;
  message: string | null;
  status: DonationStatus;
  donatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  donor: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  campaign: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    organization: {
      id: string;
      name: string;
      logoUrl: string | null;
    };
  };
  payment: {
    id: string;
    gateway: PaymentGateway;
    gatewayOrderId: string | null;
    gatewayPaymentId: string | null;
    status: PaymentStatus;
    processedAt: Date | null;
    failureReason: string | null;
  } | null;
}

export interface DonorDonationSummary {
  totalDonated: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  campaignsSupportedCount: number;
  averageDonation: number;
  largestDonation: number;
}

export interface CampaignDonationStats {
  totalRaised: number;
  donationCount: number;
  donorCount: number;
  recentDonations: Array<{
    id: string;
    amount: number;
    currency: string;
    isAnonymous: boolean;
    donorName: string;
    donatedAt: Date | null;
    createdAt: Date;
  }>;
}

export interface CreateDonationResult {
  donationId: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  paymentId: string;
  paymentStatus: PaymentStatus;
  gateway: PaymentGateway;
}

export interface ProcessPaymentResult {
  donationId: string;
  donationStatus: DonationStatus;
  paymentId: string;
  paymentStatus: PaymentStatus;
  campaignCurrentAmount?: number;
}
