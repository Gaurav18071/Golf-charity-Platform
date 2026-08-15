/**
 * Donation Server Actions
 * 
 * Server actions for creating donations, processing payments, and fetching giving history.
 * Enforces authenticated server context using Supabase Auth.
 * 
 * @module features/donation/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as donationService from "../services/donation.service";
import type { CreateDonationInput, ProcessPaymentInput } from "../types/donation.types";
import { DonationStatus } from "@prisma/client";

/**
 * Server action to create a donation record.
 */
export async function createDonationAction(input: CreateDonationInput) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in to make a donation." };
    }

    const result = await donationService.createDonation(user.id, input);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("createDonationAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create donation.",
    };
  }
}

/**
 * Server action to process/verify payment for a donation.
 */
export async function processPaymentAction(input: ProcessPaymentInput) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    // Verify donation ownership or admin authorization
    const donation = await donationService.getDonationById(input.donationId);

    if (!donation) {
      return { success: false, error: "Donation record not found." };
    }

    if (donation.donorId !== user.id) {
      return { success: false, error: "Unauthorized donation access." };
    }

    const result = await donationService.processPayment(input);

    revalidatePath(`/campaigns/${donation.campaignId}`);
    revalidatePath("/donations");
    revalidatePath("/donations/history");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("processPaymentAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment processing failed.",
    };
  }
}

/**
 * Server action to get donor donation history.
 */
export async function getDonorDonationsAction(status?: DonationStatus) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    const donations = await donationService.getDonorDonations(user.id, status);
    const summary = await donationService.getDonorSummaryStats(user.id);

    return {
      success: true,
      data: { donations, summary },
    };
  } catch (error) {
    console.error("getDonorDonationsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch donation history.",
    };
  }
}

/**
 * Server action to get statistics for a campaign.
 */
export async function getCampaignStatsAction(campaignId: string) {
  try {
    const stats = await donationService.getCampaignDonationStats(campaignId);
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("getCampaignStatsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch campaign stats.",
    };
  }
}
