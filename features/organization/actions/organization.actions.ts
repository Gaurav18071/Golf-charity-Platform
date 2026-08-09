/**
 * Organization Server Actions
 * 
 * Server actions for organization CRUD operations.
 * Handles authentication, authorization, validation, and error handling.
 * 
 * @module features/organization/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import {
  requireAuth,
  requireOrganizerOrPending,
  requireOrganizationOwnership,
  requireAdmin,
} from "../utils/organization-guards";
import * as organizationService from "../services/organization.service";
import {
  completeOrganizationSchema,
  partialOrganizationSchema,
  updateOrganizationSchema,
  verificationReviewSchema,
  approveOrganizationSchema,
  rejectOrganizationSchema,
  requestChangesOrganizationSchema,
} from "../schemas/organization.schema";
import type {
  CreateOrganizationResponse,
  UpdateOrganizationResponse,
  GetOrganizationResponse,
  SubmitOrganizationResponse,
  DeleteOrganizationResponse,
  ReviewOrganizationResponse,
  ListOrganizationsResponse,
} from "../types/organization-response.types";
import type {
  CompleteOrganizationFormData,
  PartialOrganizationFormData,
  UpdateOrganizationFormData,
  VerificationReviewFormData,
  ApproveOrganizationFormData,
  RejectOrganizationFormData,
  RequestChangesOrganizationFormData,
} from "../schemas/organization.schema";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../constants/organization.constants";

// ─────────────────────────────────────────────────────────────────────────────
// CREATE & UPDATE ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create organization draft
 * 
 * Authorization: Requires PENDING_ORGANIZER or ORGANIZER role
 * Validation: Partial schema (allows incomplete data for drafts)
 * 
 * @param formData - Partial organization data
 * @returns Created organization
 */
export async function createOrganizationDraftAction(
  formData: PartialOrganizationFormData
): Promise<CreateOrganizationResponse> {
  try {
    // Authorization
    const { profile } = await requireOrganizerOrPending();

    // Validation
    const validated = partialOrganizationSchema.parse({
      ...formData,
      profileId: profile.id,
    });

    // Business logic
    const organization = await organizationService.createOrganizationDraft(
      validated
    );

    // Revalidate paths
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");

    return {
      success: true,
      data: { organization },
      message: SUCCESS_MESSAGES.ORGANIZATION_CREATED,
    };
  } catch (error) {
    console.error("[createOrganizationDraftAction] Error:", error);

    // Handle Zod validation errors
    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create organization draft",
    };
  }
}

/**
 * Update organization
 * 
 * Authorization: Requires ownership of organization
 * Business Rule: Can only update DRAFT or REJECTED organizations
 * 
 * @param formData - Organization update data
 * @returns Updated organization
 */
export async function updateOrganizationAction(
  formData: UpdateOrganizationFormData
): Promise<UpdateOrganizationResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Validation
    const validated = updateOrganizationSchema.parse(formData);

    // Ownership check
    await requireOrganizationOwnership(validated.id, profile.id);

    // Business logic
    const { id, ...updateData } = validated;
    const organization = await organizationService.updateOrganizationData(
      id,
      updateData,
      profile.id
    );

    // Revalidate paths
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");

    return {
      success: true,
      data: { organization },
      message: SUCCESS_MESSAGES.ORGANIZATION_UPDATED,
    };
  } catch (error) {
    console.error("[updateOrganizationAction] Error:", error);

    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update organization",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// READ ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current user's organization
 * 
 * Authorization: Requires authentication
 * 
 * @param includeDocuments - Whether to include related documents
 * @returns Organization data or null
 */
export async function getMyOrganizationAction(
  includeDocuments = true
): Promise<GetOrganizationResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Business logic
    const organization =
      await organizationService.getOrganizationByProfileId(
        profile.id,
        includeDocuments
      );

    if (!organization) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: { organization: organization as any }, // Type assertion due to conditional include
    };
  } catch (error) {
    console.error("[getMyOrganizationAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch organization",
    };
  }
}

/**
 * Get organization by ID
 * 
 * Authorization: Requires ownership or admin role
 * 
 * @param organizationId - Organization UUID
 * @param includeDocuments - Whether to include related documents
 * @returns Organization data
 */
export async function getOrganizationByIdAction(
  organizationId: string,
  includeDocuments = true
): Promise<GetOrganizationResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Business logic
    const organization = await organizationService.getOrganizationById(
      organizationId,
      profile.id,
      includeDocuments
    );

    if (!organization) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: { organization: organization as any },
    };
  } catch (error) {
    console.error("[getOrganizationByIdAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch organization",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT FOR REVIEW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submit organization for admin review
 * 
 * Authorization: Requires ownership
 * Business Rule: Organization must be complete and in DRAFT/REJECTED status
 * 
 * @param organizationId - Organization UUID
 * @returns Updated organization with PENDING status
 */
export async function submitOrganizationAction(
  organizationId: string
): Promise<SubmitOrganizationResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Ownership check
    await requireOrganizationOwnership(organizationId, profile.id);

    // Business logic
    const organization =
      await organizationService.submitOrganizationForReview(
        organizationId,
        profile.id
      );

    // Revalidate paths
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      data: {
        organization,
        submittedAt: organization.submittedAt || new Date(),
      },
      message: SUCCESS_MESSAGES.ORGANIZATION_SUBMITTED,
    };
  } catch (error) {
    console.error("[submitOrganizationAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit organization",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete organization (soft delete)
 * 
 * Authorization: Requires ownership
 * Business Rule: Can only delete DRAFT or REJECTED organizations
 * 
 * @param organizationId - Organization UUID
 * @returns Deleted organization ID
 */
export async function deleteOrganizationAction(
  organizationId: string
): Promise<DeleteOrganizationResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Ownership check
    await requireOrganizationOwnership(organizationId, profile.id);

    // Business logic
    await organizationService.deleteOrganization(organizationId, profile.id);

    // Revalidate paths
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");

    return {
      success: true,
      data: { organizationId },
      message: "Organization deleted successfully",
    };
  } catch (error) {
    console.error("[deleteOrganizationAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Approve organization (Admin only)
 *
 * Authorization: requires ADMIN role.
 * Validation: organizationId + optional admin notes.
 */
export async function approveOrganizationAction(
  reviewData: FormData | ApproveOrganizationFormData
): Promise<ReviewOrganizationResponse> {
  try {
    await requireAdmin();

    const normalizedReviewData =
      reviewData instanceof FormData
        ? {
            organizationId: reviewData.get("organizationId")?.toString(),
            adminNotes: reviewData.get("adminNotes")?.toString(),
          }
        : reviewData;

    const validated = approveOrganizationSchema.parse(normalizedReviewData);

    const organization = await organizationService.reviewOrganization({
      organizationId: validated.organizationId,
      verificationStatus: "APPROVED",
      adminNotes: validated.adminNotes,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/organizations");
    revalidatePath("/dashboard/admin/organizations/[id]");
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");

    const previousStatus = organization.verificationStatus;

    return {
      success: true,
      data: {
        organization,
        previousStatus,
        newStatus: organization.verificationStatus,
        reviewedAt: organization.reviewedAt || new Date(),
      },
      message: "Organization approved",
    };
  } catch (error) {
    console.error("[approveOrganizationAction] Error:", error);

    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to approve organization",
    };
  }
}

/**
 * Reject organization (Admin only)
 *
 * Authorization: requires ADMIN role.
 * Validation: organizationId + rejectionReason + optional admin notes.
 */
export async function rejectOrganizationAction(
  reviewData: FormData | RejectOrganizationFormData
): Promise<ReviewOrganizationResponse> {
  try {
    await requireAdmin();

    const normalizedReviewData =
      reviewData instanceof FormData
        ? {
            organizationId: reviewData.get("organizationId")?.toString(),
            rejectionReason: reviewData.get("rejectionReason")?.toString(),
            adminNotes: reviewData.get("adminNotes")?.toString(),
          }
        : reviewData;

    const validated = rejectOrganizationSchema.parse(normalizedReviewData);

    const organization = await organizationService.reviewOrganization({
      organizationId: validated.organizationId,
      verificationStatus: "REJECTED",
      adminNotes: validated.rejectionReason,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/organizations");
    revalidatePath("/dashboard/admin/organizations/[id]");
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");

    const previousStatus = organization.verificationStatus;

    return {
      success: true,
      data: {
        organization,
        previousStatus,
        newStatus: organization.verificationStatus,
        reviewedAt: organization.reviewedAt || new Date(),
      },
      message: "Organization rejected",
    };
  } catch (error) {
    console.error("[rejectOrganizationAction] Error:", error);

    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to reject organization",
    };
  }
}

/**
 * Request changes for organization (Admin only)
 *
 * Authorization: requires ADMIN role.
 * Validation: organizationId + changeRequestNotes + optional admin notes.
 */
export async function requestChangesOrganizationAction(
  reviewData: FormData | RequestChangesOrganizationFormData
): Promise<ReviewOrganizationResponse> {
  try {
    await requireAdmin();

    const normalizedReviewData =
      reviewData instanceof FormData
        ? {
            organizationId: reviewData.get("organizationId")?.toString(),
            changeRequestNotes: reviewData
              .get("changeRequestNotes")
              ?.toString(),
            adminNotes: reviewData.get("adminNotes")?.toString(),
          }
        : reviewData;

    const validated = requestChangesOrganizationSchema.parse(
      normalizedReviewData
    );

    const organization = await organizationService.reviewOrganization({
      organizationId: validated.organizationId,
      verificationStatus: "REJECTED",
      adminNotes: validated.changeRequestNotes,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/organizations");
    revalidatePath("/dashboard/admin/organizations/[id]");
    revalidatePath("/dashboard/organizer");
    revalidatePath("/dashboard/organizer/verification");

    const previousStatus = organization.verificationStatus;

    return {
      success: true,
      data: {
        organization,
        previousStatus,
        newStatus: organization.verificationStatus,
        reviewedAt: organization.reviewedAt || new Date(),
      },
      message: "Change request submitted",
    };
  } catch (error) {
    console.error("[requestChangesOrganizationAction] Error:", error);

    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "Validation failed",
        details: error.errors as Record<string, string[]>,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to request changes",
    };
  }
}

export async function approveOrganizationFormAction(
  formData: FormData
): Promise<void> {
  await approveOrganizationAction({
    organizationId: formData.get("organizationId")?.toString() ?? "",
    adminNotes: formData.get("adminNotes")?.toString() ?? "",
  });
}

export async function rejectOrganizationFormAction(
  formData: FormData
): Promise<void> {
  await rejectOrganizationAction({
    organizationId: formData.get("organizationId")?.toString() ?? "",
    rejectionReason: formData.get("rejectionReason")?.toString() ?? "",
    adminNotes: formData.get("adminNotes")?.toString() ?? "",
  });
}

export async function requestChangesOrganizationFormAction(
  formData: FormData
): Promise<void> {
  await requestChangesOrganizationAction({
    organizationId: formData.get("organizationId")?.toString() ?? "",
    changeRequestNotes:
      formData.get("changeRequestNotes")?.toString() ?? "",
    adminNotes: formData.get("adminNotes")?.toString() ?? "",
  });
}

/**
 * Get organizations pending review (Admin only)
 * 
 * Authorization: Requires ADMIN role
 * 
 * @returns List of organizations awaiting review
 */
export async function getOrganizationsPendingReviewAction(): Promise<ListOrganizationsResponse> {
  try {
    // Authorization: Admin only
    await requireAdmin();

    // Business logic
    const organizations =
      await organizationService.getOrganizationsPendingReview();

    return {
      success: true,
      data: {
        organizations,
        total: organizations.length,
        page: 1,
        pageSize: organizations.length,
      },
    };
  } catch (error) {
    console.error("[getOrganizationsPendingReviewAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch pending organizations",
    };
  }
}
