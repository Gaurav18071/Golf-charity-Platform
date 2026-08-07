/**
 * Become Organizer Action
 * 
 * Server action for changing user role to PENDING_ORGANIZER.
 * Entry point for users wanting to become organizers.
 * 
 * @module features/organization/actions
 */

"use server";

import { requireDonor } from "../utils/organization-guards";
import * as organizationService from "../services/organization.service";
import type { BecomeOrganizerResponse } from "../types/organization-response.types";
import { SUCCESS_MESSAGES } from "../constants/organization.constants";

/**
 * Change user role from DONOR to PENDING_ORGANIZER
 * 
 * Authorization: Requires DONOR role
 * 
 * @returns Success response with role change data
 */
export async function becomeOrganizerAction(): Promise<BecomeOrganizerResponse> {
  try {
    // Authorization: Require DONOR role
    const { profile } = await requireDonor();

    // Business logic: Change role to PENDING_ORGANIZER
    const result = await organizationService.changeRoleToPendingOrganizer(
      profile.id,
      profile.role
    );

    return {
      success: true,
      data: {
        profileId: profile.id,
        previousRole: result.previousRole,
        newRole: result.newRole,
      },
      message: SUCCESS_MESSAGES.BECAME_ORGANIZER,
    };
  } catch (error) {
    console.error("[becomeOrganizerAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to become organizer. Please try again.",
    };
  }
}
