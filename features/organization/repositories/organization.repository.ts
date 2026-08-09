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
  OrganizationAdminReviewListItem,
  OrganizationAdminReviewDetail,
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
// ADMIN REVIEW QUERY OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find organizations for the admin review queue.
 *
 * Supports status filter, list-level text search, pagination, and ordering.
 * Repository-only query; no business rule enforcement here.
 */
export async function findOrganizationsForAdminReview(options?: {
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
  const {
    status,
    search,
    page = 1,
    pageSize = 20,
    sortBy = "submittedAt",
    sortOrder = "desc",
  } = options || {};

  const normalizedSearch = search?.trim();

  const where: {
    deletedAt: null;
    verificationStatus?: OrganizationVerificationStatus;
    OR?: Array<
      | { name: { contains: string; mode: "insensitive" } }
      | { email: { contains: string; mode: "insensitive" } }
      | { registrationNo: { contains: string; mode: "insensitive" } }
      | { profile: { fullName: { contains: string; mode: "insensitive" } } }
      | { profile: { email: { contains: string; mode: "insensitive" } } }
    >;
  } = {
    deletedAt: null,
    ...(status && { verificationStatus: status }),
  };

  if (normalizedSearch) {
    where.OR = [
      { name: { contains: normalizedSearch, mode: "insensitive" } },
      { email: { contains: normalizedSearch, mode: "insensitive" } },
      { registrationNo: { contains: normalizedSearch, mode: "insensitive" } },
      { profile: { fullName: { contains: normalizedSearch, mode: "insensitive" } } },
      { profile: { email: { contains: normalizedSearch, mode: "insensitive" } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        email: true,
        registrationNo: true,
        verificationStatus: true,
        submittedAt: true,
        reviewedAt: true,
        adminNotes: true,
        createdAt: true,
        documents: {
          select: {
            id: true,
          },
        },
        profile: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.organization.count({ where }),
  ]);

  return {
    organizations: rows.map((row) => ({
      ...row,
      documentsCount: row.documents.length,
    })),
    total,
  };
}

/**
 * Find a single organization detail for the admin review page.
 * Includes profile, uploaded documents, and review metadata.
 */
export async function findOrganizationForAdminReview(
  id: string
): Promise<OrganizationAdminReviewDetail | null> {
  const organization = await prisma.organization.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!organization) {
    return null;
  }

  return organization;
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
