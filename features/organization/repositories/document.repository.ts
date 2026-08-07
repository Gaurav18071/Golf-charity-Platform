/**
 * Document Repository
 * 
 * Pure database access layer for OrganizationDocument entity.
 * Contains ONLY database operations - NO business logic.
 * 
 * @module features/organization/repositories
 */

import { prisma } from "@/lib/prisma";
import type {
  OrganizationDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "../types/organization.types";
import type { DocumentType, DocumentVerificationStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// CREATE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new document in PENDING verification status
 * 
 * @param data - Document creation data
 * @returns Created document
 */
export async function createDocument(
  data: CreateDocumentInput
): Promise<OrganizationDocument> {
  return await prisma.organizationDocument.create({
    data: {
      ...data,
      verificationStatus: "PENDING",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// READ OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find document by ID
 * 
 * @param id - Document UUID
 * @returns Document or null if not found
 */
export async function findDocumentById(
  id: string
): Promise<OrganizationDocument | null> {
  return await prisma.organizationDocument.findUnique({
    where: { id },
  });
}

/**
 * Find all documents for an organization
 * 
 * @param organizationId - Organization UUID
 * @returns Array of documents
 */
export async function findDocumentsByOrganizationId(
  organizationId: string
): Promise<OrganizationDocument[]> {
  return await prisma.organizationDocument.findMany({
    where: { organizationId },
    orderBy: { uploadedAt: "desc" },
  });
}

/**
 * Find documents by organization and type
 * 
 * @param organizationId - Organization UUID
 * @param documentType - Type of document
 * @returns Array of documents of specified type
 */
export async function findDocumentsByTypeAndOrganization(
  organizationId: string,
  documentType: DocumentType
): Promise<OrganizationDocument[]> {
  return await prisma.organizationDocument.findMany({
    where: {
      organizationId,
      documentType,
    },
    orderBy: { uploadedAt: "desc" },
  });
}

/**
 * Count documents by type for an organization
 * 
 * @param organizationId - Organization UUID
 * @param documentType - Type of document
 * @returns Count of documents
 */
export async function countDocumentsByType(
  organizationId: string,
  documentType: DocumentType
): Promise<number> {
  return await prisma.organizationDocument.count({
    where: {
      organizationId,
      documentType,
    },
  });
}

/**
 * Find documents by verification status
 * 
 * @param organizationId - Organization UUID
 * @param status - Verification status
 * @returns Array of documents with specified status
 */
export async function findDocumentsByVerificationStatus(
  organizationId: string,
  status: DocumentVerificationStatus
): Promise<OrganizationDocument[]> {
  return await prisma.organizationDocument.findMany({
    where: {
      organizationId,
      verificationStatus: status,
    },
    orderBy: { uploadedAt: "desc" },
  });
}

/**
 * Check if organization has all required documents
 * 
 * @param organizationId - Organization UUID
 * @param requiredTypes - Array of required document types
 * @returns True if all required document types are present
 */
export async function hasAllRequiredDocuments(
  organizationId: string,
  requiredTypes: DocumentType[]
): Promise<boolean> {
  const documents = await prisma.organizationDocument.findMany({
    where: { organizationId },
    select: { documentType: true },
    distinct: ["documentType"],
  });

  const uploadedTypes = new Set(documents.map((d) => d.documentType));

  return requiredTypes.every((type) => uploadedTypes.has(type));
}

/**
 * Get document count by verification status
 * 
 * @param organizationId - Organization UUID
 * @returns Object with counts by status
 */
export async function getDocumentCountsByStatus(organizationId: string): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}> {
  const [pending, approved, rejected, total] = await Promise.all([
    prisma.organizationDocument.count({
      where: { organizationId, verificationStatus: "PENDING" },
    }),
    prisma.organizationDocument.count({
      where: { organizationId, verificationStatus: "APPROVED" },
    }),
    prisma.organizationDocument.count({
      where: { organizationId, verificationStatus: "REJECTED" },
    }),
    prisma.organizationDocument.count({
      where: { organizationId },
    }),
  ]);

  return { pending, approved, rejected, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update document verification status
 * 
 * @param id - Document UUID
 * @param status - New verification status
 * @param reviewerNotes - Optional reviewer notes
 * @returns Updated document
 */
export async function updateDocumentVerificationStatus(
  id: string,
  status: DocumentVerificationStatus,
  reviewerNotes?: string | null
): Promise<OrganizationDocument> {
  const updateData: {
    verificationStatus: DocumentVerificationStatus;
    reviewerNotes?: string | null;
    reviewedAt?: Date;
  } = {
    verificationStatus: status,
    reviewedAt: new Date(),
  };

  if (reviewerNotes !== undefined) {
    updateData.reviewerNotes = reviewerNotes;
  }

  return await prisma.organizationDocument.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Update document metadata
 * 
 * @param id - Document UUID
 * @param data - Fields to update
 * @returns Updated document
 */
export async function updateDocument(
  id: string,
  data: Omit<UpdateDocumentInput, "id">
): Promise<OrganizationDocument> {
  return await prisma.organizationDocument.update({
    where: { id },
    data,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete document by ID
 * 
 * @param id - Document UUID
 * @returns Deleted document
 */
export async function deleteDocument(
  id: string
): Promise<OrganizationDocument> {
  return await prisma.organizationDocument.delete({
    where: { id },
  });
}

/**
 * Delete all documents for an organization
 * 
 * @param organizationId - Organization UUID
 * @returns Count of deleted documents
 */
export async function deleteAllDocumentsByOrganization(
  organizationId: string
): Promise<{ count: number }> {
  return await prisma.organizationDocument.deleteMany({
    where: { organizationId },
  });
}

/**
 * Delete documents by type for an organization
 * 
 * @param organizationId - Organization UUID
 * @param documentType - Type of documents to delete
 * @returns Count of deleted documents
 */
export async function deleteDocumentsByType(
  organizationId: string,
  documentType: DocumentType
): Promise<{ count: number }> {
  return await prisma.organizationDocument.deleteMany({
    where: {
      organizationId,
      documentType,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get global document statistics (Admin use)
 * 
 * @returns Document counts across all organizations
 */
export async function getGlobalDocumentStatistics(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.organizationDocument.count(),
    prisma.organizationDocument.count({
      where: { verificationStatus: "PENDING" },
    }),
    prisma.organizationDocument.count({
      where: { verificationStatus: "APPROVED" },
    }),
    prisma.organizationDocument.count({
      where: { verificationStatus: "REJECTED" },
    }),
  ]);

  return { total, pending, approved, rejected };
}
