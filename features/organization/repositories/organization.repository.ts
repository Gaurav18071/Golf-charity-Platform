/**
 * Organization Repository
 * 
 * Pure database access layer for Organization entity.
 * Contains ONLY database operations - NO business logic.
 * All business logic belongs in the service layer.
 * 
 * @module features/organization/repositories
 */

import { prisma } from "@/lib/prisma";
import type {
  Organization,
  OrganizationWithDocuments,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationSummary,
} from "../types/organization.types";
import type {
  OrganizationType,
  OrganizationVerificationStatus,
} from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// CREATE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new organization in DRAFT status
 * 
 * @param data - Organization creation data
 * @returns Created organization
 */
export async function createOrganization(
  data: CreateOrganizationInput
): Promise<Organization> {
  return await prisma.organization.create({
    data: {
      ...data,
      verificationStatus: "DRAFT",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// READ OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find organization by ID
 * 
 * @param id - Organization UUID
 * @returns Organization or null if not found
 */
export async function findOrganizationById(
  id: string
): Promise<Organization | null> {
  return await prisma.organization.findUnique({
    where: { id },
  });
}

/**
 * Find organization by ID with related documents
 * 
 * @param id - Organization UUID
 * @returns Organization with documents or null if not found
 */
export async function findOrganizationByIdWithDocuments(
  id: string
): Promise<OrganizationWithDocuments | null> {
  return await prisma.organization.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });
}

/**
 * Find organization by profile ID
 * 
 * @param profileId - Profile UUID
 * @returns Organization or null if not found
 */
export async function findOrganizationByProfileId(
  profileId: string
): Promise<Organization | null> {
  return await prisma.organization.findUnique({
    where: { profileId },
  });
}

/**
 * Find organization by profile ID with documents
 * 
 * @param profileId - Profile UUID
 * @returns Organization with documents or null if not found
 */
export async function findOrganizationByProfileIdWithDocuments(
  profileId: string
): Promise<OrganizationWithDocuments | null> {
  return await prisma.organization.findUnique({
    where: { profileId },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });
}

/**
 * Check if organization exists for profile
 * 
 * @param profileId - Profile UUID
 * @returns True if organization exists
 */
export async function organizationExistsForProfile(
  profileId: string
): Promise<boolean> {
  const count = await prisma.organization.count({
    where: { profileId },
  });
  return count > 0;
}

/**
 * Find all organizations (with pagination and filters)
 * 
 * @param options - Query options
 * @returns Array of organization summaries and total count
 */
export async function findOrganizations(options?: {
  status?: OrganizationVerificationStatus;
  type?: OrganizationType;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "name" | "submittedAt";
  sortOrder?: "asc" | "desc";
}): Promise<{ organizations: OrganizationSummary[]; total: number }> {
  const {
    status,
    type,
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options || {};

  const where = {
    ...(status && { verificationStatus: status }),
    ...(type && { type }),
    deletedAt: null,
  };

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        verificationStatus: true,
        logoUrl: true,
        createdAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.organization.count({ where }),
  ]);

  return { organizations, total };
}

/**
 * Find organizations pending review
 * 
 * @returns Array of organizations pending or under review
 */
export async function findOrganizationsPendingReview(): Promise<
  OrganizationSummary[]
> {
  return await prisma.organization.findMany({
    where: {
      verificationStatus: {
        in: ["PENDING", "UNDER_REVIEW"],
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      type: true,
      verificationStatus: true,
      logoUrl: true,
      createdAt: true,
    },
    orderBy: { submittedAt: "asc" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update organization by ID
 * 
 * @param id - Organization UUID
 * @param data - Fields to update
 * @returns Updated organization
 */
export async function updateOrganization(
  id: string,
  data: Omit<UpdateOrganizationInput, "id">
): Promise<Organization> {
  return await prisma.organization.update({
    where: { id },
    data,
  });
}

/**
 * Update organization verification status
 * 
 * @param id - Organization UUID
 * @param status - New verification status
 * @param adminNotes - Optional admin notes
 * @returns Updated organization
 */
export async function updateOrganizationVerificationStatus(
  id: string,
  status: OrganizationVerificationStatus,
  adminNotes?: string | null
): Promise<Organization> {
  const updateData: {
    verificationStatus: OrganizationVerificationStatus;
    adminNotes?: string | null;
    submittedAt?: Date | null;
    reviewedAt?: Date | null;
  } = {
    verificationStatus: status,
  };

  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }

  // Set submittedAt when status changes to PENDING
  if (status === "PENDING") {
    updateData.submittedAt = new Date();
  }

  // Set reviewedAt when status changes to APPROVED or REJECTED
  if (status === "APPROVED" || status === "REJECTED") {
    updateData.reviewedAt = new Date();
  }

  return await prisma.organization.update({
    where: { id },
    data: updateData,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft delete organization (sets deletedAt timestamp)
 * 
 * @param id - Organization UUID
 * @returns Updated organization with deletedAt set
 */
export async function softDeleteOrganization(
  id: string
): Promise<Organization> {
  return await prisma.organization.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Hard delete organization (permanent removal)
 * WARNING: This will cascade delete all related documents and campaigns
 * 
 * @param id - Organization UUID
 * @returns Deleted organization
 */
export async function hardDeleteOrganization(
  id: string
): Promise<Organization> {
  return await prisma.organization.delete({
    where: { id },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get organization statistics
 * 
 * @returns Count of organizations by status
 */
export async function getOrganizationStatistics(): Promise<{
  total: number;
  draft: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
}> {
  const [total, draft, pending, underReview, approved, rejected] =
    await Promise.all([
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.organization.count({
        where: { verificationStatus: "DRAFT", deletedAt: null },
      }),
      prisma.organization.count({
        where: { verificationStatus: "PENDING", deletedAt: null },
      }),
      prisma.organization.count({
        where: { verificationStatus: "UNDER_REVIEW", deletedAt: null },
      }),
      prisma.organization.count({
        where: { verificationStatus: "APPROVED", deletedAt: null },
      }),
      prisma.organization.count({
        where: { verificationStatus: "REJECTED", deletedAt: null },
      }),
    ]);

  return {
    total,
    draft,
    pending,
    underReview,
    approved,
    rejected,
  };
}
