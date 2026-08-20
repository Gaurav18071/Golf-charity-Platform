/**
 * Organization Service
 * 
 * Business logic layer for organization management.
 * Handles all business rules, validation, and state transitions.
 * Never calls Prisma directly - uses repository layer.
 * 
 * @module features/organization/services
 */

import * as organizationRepo from "../repositories/organization.repository";
import * as documentRepo from "../repositories/document.repository";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/features/notification/services/notification.service";
import type {
  Organization,
  OrganizationWithDocuments,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationDraftInput,
  OrganizationSummary,
  VerificationReviewInput,
  OrganizationAdminReviewListItem,
  OrganizationAdminReviewDetail,
} from "../types/organization.types";
import type {
  OrganizationType,
  OrganizationVerificationStatus,
  UserRole,
} from "@prisma/client";
import {
  ALLOWED_STATUS_TRANSITIONS,
  REQUIRED_DOCUMENTS_BY_TYPE,
  ERROR_MESSAGES,
} from "../constants/organization.constants";

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE ROLE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Change user role to PENDING_ORGANIZER
 * 
 * Business Rule: User must be DONOR to become organizer
 * 
 * @param profileId - Profile UUID
 * @param currentRole - Current user role
 * @returns Updated profile role
 * @throws Error if user is not a DONOR
 */
export async function changeRoleToPendingOrganizer(
  profileId: string,
  currentRole: UserRole
): Promise<{ previousRole: UserRole; newRole: "PENDING_ORGANIZER" }> {
  // Business Rule: Only DONOR can become PENDING_ORGANIZER
  if (currentRole !== "DONOR") {
    throw new Error(
      "Only donors can apply to become organizers. Current role: " + currentRole
    );
  }

  // Update profile role
  await prisma.profile.update({
    where: { id: profileId },
    data: { role: "PENDING_ORGANIZER" },
  });

  return {
    previousRole: currentRole,
    newRole: "PENDING_ORGANIZER",
  };
}

/**
 * Change user role to ORGANIZER after approval
 * 
 * Business Rule: Organization must be APPROVED
 * 
 * @param profileId - Profile UUID
 * @returns Updated profile role
 * @throws Error if organization not approved
 */
export async function changeRoleToOrganizer(
  profileId: string
): Promise<{ previousRole: UserRole; newRole: "ORGANIZER" }> {
  // Get profile
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Business Rule: Must have approved organization
  const organization = await organizationRepo.findOrganizationByProfileId(
    profileId
  );

  if (!organization || organization.verificationStatus !== "APPROVED") {
    throw new Error(
      "Cannot change role to ORGANIZER without approved organization"
    );
  }

  // Update profile role
  await prisma.profile.update({
    where: { id: profileId },
    data: { role: "ORGANIZER" },
  });

  return {
    previousRole: profile.role,
    newRole: "ORGANIZER",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create organization draft
 * 
 * Business Rules:
 * - Profile must not already have an organization
 * - Profile must be PENDING_ORGANIZER or ORGANIZER
 * 
 * @param data - Organization data (can be partial for draft)
 * @returns Created organization
 * @throws Error if profile already has organization
 */
export async function createOrganizationDraft(
  data: OrganizationDraftInput & { profileId: string }
): Promise<Organization> {
  const { profileId } = data;

  // Business Rule: One organization per profile
  const exists = await organizationRepo.organizationExistsForProfile(profileId);
  if (exists) {
    throw new Error(ERROR_MESSAGES.ALREADY_EXISTS);
  }

  // Business Rule: Must have minimal data for draft
  if (!data.name || !data.email) {
    throw new Error("Organization name and email are required for draft");
  }

  // Create with defaults
  const organizationData: CreateOrganizationInput = {
    profileId,
    name: data.name,
    type: data.type || "OTHER",
    description: data.description || "",
    email: data.email,
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "",
    state: data.state || "",
    country: data.country || "India",
    postalCode: data.postalCode || "",
    registrationNo: data.registrationNo || "",
    panNumber: data.panNumber || "",
    gstNumber: data.gstNumber,
    taxExemptionNo: data.taxExemptionNo,
    accountHolder: data.accountHolder || "",
    accountNumber: data.accountNumber || "",
    bankName: data.bankName || "",
    ifscCode: data.ifscCode || "",
    branchName: data.branchName || "",
    logoUrl: data.logoUrl,
    coverImageUrl: data.coverImageUrl,
  };

  return await organizationRepo.createOrganization(organizationData);
}

/**
 * Update organization
 * 
 * Business Rules:
 * - Can only update organizations in DRAFT or REJECTED status
 * - PENDING, UNDER_REVIEW, and APPROVED organizations are locked
 * 
 * @param id - Organization ID
 * @param data - Fields to update
 * @param profileId - Profile ID (for authorization check)
 * @returns Updated organization
 * @throws Error if not authorized or cannot modify
 */
export async function updateOrganizationData(
  id: string,
  data: Omit<UpdateOrganizationInput, "id">,
  profileId: string
): Promise<Organization> {
  // Get existing organization
  const existing = await organizationRepo.findOrganizationById(id);
  if (!existing) {
    throw new Error(ERROR_MESSAGES.NOT_FOUND);
  }

  // Business Rule: User must own this organization
  if (existing.profileId !== profileId) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Business Rule: Can modify DRAFT, REJECTED, or APPROVED organizations (PENDING and UNDER_REVIEW are locked)
  const modifiableStatuses: OrganizationVerificationStatus[] = [
    "DRAFT",
    "REJECTED",
    "APPROVED",
  ];
  if (!modifiableStatuses.includes(existing.verificationStatus)) {
    throw new Error(ERROR_MESSAGES.CANNOT_MODIFY);
  }

  return await organizationRepo.updateOrganization(id, data);
}

/**
 * Get organization by profile ID
 * 
 * @param profileId - Profile UUID
 * @param includeDocuments - Include related documents
 * @returns Organization or null
 */
export async function getOrganizationByProfileId(
  profileId: string,
  includeDocuments = false
): Promise<Organization | OrganizationWithDocuments | null> {
  if (includeDocuments) {
    return await organizationRepo.findOrganizationByProfileIdWithDocuments(
      profileId
    );
  }
  return await organizationRepo.findOrganizationByProfileId(profileId);
}

/**
 * Get organization by ID (with authorization check)
 * 
 * @param id - Organization UUID
 * @param profileId - Profile UUID (for authorization)
 * @param includeDocuments - Include related documents
 * @returns Organization or null
 * @throws Error if not authorized
 */
export async function getOrganizationById(
  id: string,
  profileId: string,
  includeDocuments = false
): Promise<Organization | OrganizationWithDocuments | null> {
  const org = includeDocuments
    ? await organizationRepo.findOrganizationByIdWithDocuments(id)
    : await organizationRepo.findOrganizationById(id);

  if (!org) {
    return null;
  }

  // Authorization check
  if (org.profileId !== profileId) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  return org;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION & VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate organization is ready for submission
 * 
 * Business Rules:
 * - All required fields must be filled
 * - All required documents must be uploaded
 * - Organization must be in DRAFT or REJECTED status
 * 
 * @param organization - Organization to validate
 * @returns Validation result
 */
export async function validateOrganizationForSubmission(
  organization: Organization
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check status
  if (
    !["DRAFT", "REJECTED"].includes(organization.verificationStatus)
  ) {
    errors.push("Organization is not in a submittable status");
    return { valid: false, errors };
  }

  // Check required fields
  const requiredFields: (keyof Organization)[] = [
    "name",
    "type",
    "description",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "postalCode",
    "registrationNo",
    "panNumber",
    "accountHolder",
    "accountNumber",
    "bankName",
    "ifscCode",
    "branchName",
  ];

  requiredFields.forEach((field) => {
    const value = organization[field];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push(`${field} is required`);
    }
  });

  // Check required documents
  const requiredDocs = REQUIRED_DOCUMENTS_BY_TYPE[organization.type];
  const hasAllDocs = await documentRepo.hasAllRequiredDocuments(
    organization.id,
    requiredDocs
  );

  if (!hasAllDocs) {
    errors.push(
      `Missing required documents for ${organization.type} organization`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Submit organization for review
 * 
 * Business Rules:
 * - Must pass validation
 * - Status changes from DRAFT/REJECTED to PENDING
 * 
 * @param id - Organization ID
 * @param profileId - Profile ID (for authorization)
 * @returns Updated organization with PENDING status
 * @throws Error if validation fails or not authorized
 */
export async function submitOrganizationForReview(
  id: string,
  profileId: string
): Promise<Organization> {
  // Get organization
  const organization = await organizationRepo.findOrganizationById(id);
  if (!organization) {
    throw new Error(ERROR_MESSAGES.NOT_FOUND);
  }

  // Authorization check
  if (organization.profileId !== profileId) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Validate organization
  const validation = await validateOrganizationForSubmission(organization);
  if (!validation.valid) {
    throw new Error(
      `Cannot submit: ${validation.errors.join(", ")}`
    );
  }

  // Update status to PENDING
  return await organizationRepo.updateOrganizationVerificationStatus(
    id,
    "PENDING"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Review organization (Admin only)
 * 
 * Business Rules:
 * - Status transition must be valid
 * - If approved, change profile role to ORGANIZER
 * - If rejected, allow resubmission
 * 
 * @param review - Review data
 * @returns Updated organization
 * @throws Error if invalid status transition
 */
export async function reviewOrganization(
  review: VerificationReviewInput
): Promise<Organization> {
  const { organizationId, verificationStatus, adminNotes } = review;

  // Get organization
  const organization = await organizationRepo.findOrganizationById(
    organizationId
  );
  if (!organization) {
    throw new Error(ERROR_MESSAGES.NOT_FOUND);
  }

  // Business Rule: Check valid status transition
  const allowedTransitions =
    ALLOWED_STATUS_TRANSITIONS[organization.verificationStatus];
  if (!allowedTransitions.includes(verificationStatus)) {
    throw new Error(
      `Cannot transition from ${organization.verificationStatus} to ${verificationStatus}`
    );
  }

  // Update organization status
  const updated = await organizationRepo.updateOrganizationVerificationStatus(
    organizationId,
    verificationStatus,
    adminNotes
  );

  // Business Rule: If approved, change profile role to ORGANIZER and approve pending documents
  if (verificationStatus === "APPROVED") {
    await changeRoleToOrganizer(organization.profileId);
    await prisma.organizationDocument.updateMany({
      where: { organizationId, verificationStatus: "PENDING" },
      data: { verificationStatus: "APPROVED", reviewedAt: new Date() },
    });

    createNotification({
      userId: organization.profileId,
      type: "ORGANIZATION_APPROVED",
      title: "Organization Verified! 🎉",
      message: `Your organization "${organization.name}" has been approved. You now have full access to create campaigns and receive donations.`,
      actionUrl: "/organizer/organization",
    }).catch((e) => console.warn("Failed to create org approval notification:", e));
  } else if (verificationStatus === "REJECTED") {
    createNotification({
      userId: organization.profileId,
      type: "ORGANIZATION_REJECTED",
      title: "Organization Review Update",
      message: adminNotes
        ? `Your organization verification was not approved: "${adminNotes}".`
        : `Your organization verification was not approved. Please review your submitted details.`,
      actionUrl: "/organizer/organization",
    }).catch((e) => console.warn("Failed to create org rejection notification:", e));
  }

  return updated;
}

/**
 * Admin review list with filter/search support.
 *
 * Business Rule: This service method is a read-only admin workflow surface.
 * The repo returns the data shape; the service is responsible for preserving
 * the review use case boundaries.
 */
export async function getOrganizationsForAdminReview(options?: {
  status?: OrganizationVerificationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "submittedAt" | "reviewedAt" | "name";
  sortOrder?: "asc" | "desc";
}): Promise<{
  organizations: OrganizationAdminReviewListItem[];
  total: number;
}> {
  return await organizationRepo.findOrganizationsForAdminReview(options);
}

/**
 * Fetch one admin verification detail payload.
 */
export async function getOrganizationForAdminReview(
  id: string
): Promise<OrganizationAdminReviewDetail | null> {
  return await organizationRepo.findOrganizationForAdminReview(id);
}

/**
 * Get organizations pending review (Admin only)
 * 
 * @returns Array of organizations awaiting review
 */
export async function getOrganizationsPendingReview(): Promise<
  OrganizationSummary[]
> {
  return await organizationRepo.findOrganizationsPendingReview();
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete organization (soft delete)
 * 
 * Business Rules:
 * - Can only delete DRAFT or REJECTED organizations
 * - Cannot delete approved organizations with active campaigns
 * 
 * @param id - Organization ID
 * @param profileId - Profile ID (for authorization)
 * @returns Deleted organization
 * @throws Error if cannot delete or not authorized
 */
export async function deleteOrganization(
  id: string,
  profileId: string
): Promise<Organization> {
  // Get organization
  const organization = await organizationRepo.findOrganizationById(id);
  if (!organization) {
    throw new Error(ERROR_MESSAGES.NOT_FOUND);
  }

  // Authorization check
  if (organization.profileId !== profileId) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Business Rule: Can only delete DRAFT or REJECTED
  if (!["DRAFT", "REJECTED"].includes(organization.verificationStatus)) {
    throw new Error("Cannot delete organization in current status");
  }

  return await organizationRepo.softDeleteOrganization(id);
}
