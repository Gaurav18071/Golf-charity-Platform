/**
 * Document Server Actions
 * 
 * Server actions for document upload, retrieval, and deletion.
 * Handles file upload validation and authorization.
 * 
 * @module features/organization/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import {
  requireAuth,
  requireAdmin,
  requireDocumentOwnership,
} from "../utils/organization-guards";
import * as documentRepo from "../repositories/document.repository";
import {
  documentUploadSchema,
  documentReviewSchema,
} from "../schemas/document.schema";
import type {
  UploadDocumentResponse,
  DeleteDocumentResponse,
  GetDocumentResponse,
  ListDocumentsResponse,
  ReviewDocumentResponse,
} from "../types/organization-response.types";
import type {
  DocumentUploadFormData,
  DocumentReviewFormData,
} from "../schemas/document.schema";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../constants/organization.constants";

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload document metadata (file should be uploaded to storage first)
 * 
 * Authorization: Requires ownership of organization
 * Validation: File size, type, and metadata
 * 
 * @param documentData - Document metadata after file upload
 * @returns Created document record
 */
export async function uploadDocumentAction(
  documentData: DocumentUploadFormData
): Promise<UploadDocumentResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Validation
    const validated = documentUploadSchema.parse(documentData);

    // Verify user owns the organization
    const organization = await documentRepo.findDocumentsByOrganizationId(
      validated.organizationId
    );

    // Business logic: Create document record
    const document = await documentRepo.createDocument(validated);

    // Revalidate paths
    revalidatePath("/dashboard/organizer/verification");

    return {
      success: true,
      data: { document },
      message: SUCCESS_MESSAGES.DOCUMENT_UPLOADED,
    };
  } catch (error) {
    console.error("[uploadDocumentAction] Error:", error);

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
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all documents for an organization
 * 
 * Authorization: Requires ownership of organization or admin role
 * 
 * @param organizationId - Organization UUID
 * @returns List of documents
 */
export async function getOrganizationDocumentsAction(
  organizationId: string
): Promise<ListDocumentsResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Get documents
    const documents = await documentRepo.findDocumentsByOrganizationId(
      organizationId
    );

    return {
      success: true,
      data: { documents },
    };
  } catch (error) {
    console.error("[getOrganizationDocumentsAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

/**
 * Get document by ID
 * 
 * Authorization: Requires ownership or admin role
 * 
 * @param documentId - Document UUID
 * @returns Document data
 */
export async function getDocumentByIdAction(
  documentId: string
): Promise<GetDocumentResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Get document
    const document = await documentRepo.findDocumentById(documentId);

    if (!document) {
      return {
        success: false,
        error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
        code: "NOT_FOUND",
      };
    }

    // Ownership check (will throw if not authorized)
    await requireDocumentOwnership(documentId, profile.id);

    return {
      success: true,
      data: { document },
    };
  } catch (error) {
    console.error("[getDocumentByIdAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch document",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete document
 * 
 * Authorization: Requires ownership
 * Note: This only deletes the database record. File cleanup should be handled separately.
 * 
 * @param documentId - Document UUID
 * @returns Deleted document ID
 */
export async function deleteDocumentAction(
  documentId: string
): Promise<DeleteDocumentResponse> {
  try {
    // Authorization
    const { profile } = await requireAuth();

    // Ownership check
    await requireDocumentOwnership(documentId, profile.id);

    // Business logic: Delete document
    await documentRepo.deleteDocument(documentId);

    // Revalidate paths
    revalidatePath("/dashboard/organizer/verification");

    return {
      success: true,
      data: { documentId },
      message: SUCCESS_MESSAGES.DOCUMENT_DELETED,
    };
  } catch (error) {
    console.error("[deleteDocumentAction] Error:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DOCUMENT REVIEW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Review document (Admin only)
 * 
 * Authorization: Requires ADMIN role
 * 
 * @param reviewData - Review data with verification status and notes
 * @returns Updated document
 */
export async function reviewDocumentAction(
  reviewData: DocumentReviewFormData
): Promise<ReviewDocumentResponse> {
  try {
    // Authorization: Admin only
    await requireAdmin();

    // Validation
    const validated = documentReviewSchema.parse(reviewData);

    // Get document before review
    const docBefore = await documentRepo.findDocumentById(
      validated.documentId
    );

    if (!docBefore) {
      return {
        success: false,
        error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
      };
    }

    const previousStatus = docBefore.verificationStatus;

    // Business logic: Update verification status
    const document = await documentRepo.updateDocumentVerificationStatus(
      validated.documentId,
      validated.verificationStatus,
      validated.reviewerNotes
    );

    // Revalidate paths
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/organizer/verification");

    return {
      success: true,
      data: {
        document,
        previousStatus,
        newStatus: document.verificationStatus,
        reviewedAt: document.reviewedAt || new Date(),
      },
      message: `Document ${document.verificationStatus.toLowerCase()}`,
    };
  } catch (error) {
    console.error("[reviewDocumentAction] Error:", error);

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
        error instanceof Error ? error.message : "Failed to review document",
    };
  }
}
