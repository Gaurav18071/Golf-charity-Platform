/**
 * Profile Server Actions
 * 
 * Server-side actions for profile operations.
 * These can be called from client components.
 * 
 * @module features/profile/actions
 */

"use server";

import { getCurrentProfile, updateCurrentProfile } from "../profile.service";
import type { Profile, ProfileUpdate } from "../profile.types";

/**
 * Get current user's profile
 * 
 * @returns Profile or null
 */
export async function getCurrentProfileAction(): Promise<Profile | null> {
  try {
    return await getCurrentProfile();
  } catch (error) {
    console.error("[getCurrentProfileAction] Error:", error);
    return null;
  }
}

/**
 * Update current user's profile
 * 
 * @param update - Profile fields to update
 * @returns Updated profile
 */
export async function updateProfileAction(
  update: ProfileUpdate
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const profile = await updateCurrentProfile(update);
    return { success: true, profile };
  } catch (error) {
    console.error("[updateProfileAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
