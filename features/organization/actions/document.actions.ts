/**
 * Document Server Actions
 * 
 * Server actions for document upload, retrieval, deletion, and preview.
 * Bridges client components with document service layer.
 * 
 * @module features/organization/actions/document.actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { documentService, DocumentServiceError, DocumentServiceErrorType } from "../services/document.service";
import * as documentRepo from "../repositories/document.repository";
import { requireAuth, requireAdmin } from "../utils/organization-guards";
import { documentReviewSchema } from "../schemas/document.schema";
import type { DocumentType } from "@prisma/client";
import type { DocumentReviewFormData } from "../schemas/document.schema";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadDocumentActionResponse {
  success: boolean;
  document?: {
    id: string;
    documentType: DocumentType;
    originalFileName: string;
    fileSize: number;
    uploadedAt: Date;
    verificationStatus: string;
  };
  message?: string;
  error?: string;
}

export interface DeleteDocumentActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ReplaceDocumentActionResponse {
  success: boolean;
  document?: {
    id: string;
    documentType: DocumentType;
    originalFileName: string;
    fileSize: number;
    uploadedAt: Date;
    verificationStatus: string;
  };
  message?: string;
  error?: string;
}

export interface GetDocumentsActionResponse {
  success: boolean;
  documents?: Array<{
    id: string;
    documentType: DocumentType;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    verificationStatus: string;
    reviewerNotes: string | null;
  }>;
  error?: string;
}

export interface GetDocumentPreviewActionResponse {
  success: boolean;
  signedUrl?: string;
  expiresIn?: number;
  error?: string;
}

export interface ReviewDocumentActionResponse {
  success: boolean;
  document?: any;
  message?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a document file
 * 
 * This action receives FormData with the file and metadata,
 * converts it to the format expected by the service, and uploads.
 * 
 * Authorization: User must own the organization
 * Validation: File type, size, and metadata
 * 
 * @param formData - FormData containing file and metadata
 * @returns Upload result
 */
export async function uploadDocumentAction(
  formData: FormData
): Promise<UploadDocumentActionResponse> {
  try {
    // ── Authentication ────────────────────────────────────────────────────────
    const { profile } = await requireAuth();

    // ── Extract form data ─────────────────────────────────────────────────────
    const file = formData.get("file") as File | null;
    const organizationId = formData.get("organizationId") as string;
    const documentType = formData.get("documentType") as DocumentType;

    // ── Validate input ────────────────────────────────────────────────────────
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    if (!organizationId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }

    if (!documentType) {
      return {
        success: false,
        error: "Document type is required",
      };
    }

    // ── Call service layer ────────────────────────────────────────────────────
    const result = await documentService.uploadDocument({
      file,
      organizationId,
      documentType,
      userId: profile.id,
    });

    // ── Revalidate paths ──────────────────────────────────────────────────────
    revalidatePath("/dashboard/organizer/verification");
    revalidatePath(`/dashboard/organizer/organization/${organizationId}`);

    // ── Return success response ───────────────────────────────────────────────
    return {
      success: true,
      document: {
        id: result.document.id,
        documentType: result.document.documentType,
        originalFileName: result.document.originalFileName,
        fileSize: result.document.fileSize,
        uploadedAt: result.document.uploadedAt,
        verificationStatus: result.document.verificationStatus,
      },
      message: result.message,
    };
  } catch (error) {
    console.error("[uploadDocumentAction] Error:", error);

    // ── Handle service errors ─────────────────────────────────────────────────
    if (error instanceof DocumentServiceError) {
      return {
        success: false,
        error: error.message,
      };
    }

    // ── Handle unexpected errors ──────────────────────────────────────────────
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete a document
 * 
 * Deletes both the database record and the file from storage.
 * 
 * Authorization: User must own the organization
 * 
 * @param documentId - Document UUID
 * @returns Delete result
 */
export async function deleteDocumentAction(
  documentId: string
): Promise<DeleteDocumentActionResponse> {
  try {
    // ── Authentication ────────────────────────────────────────────────────────
    const { profile } = await requireAuth();

    // ── Call service layer ────────────────────────────────────────────────────
    const result = await documentService.deleteDocument({
      documentId,
      userId: profile.id,
    });

    // ── Revalidate paths ──────────────────────────────────────────────────────
    revalidatePath("/dashboard/organizer/verification");

    // ── Return success response ───────────────────────────────────────────────
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error("[deleteDocumentAction] Error:", error);

    // ── Handle service errors ─────────────────────────────────────────────────
    if (error instanceof DocumentServiceError) {
      return {
        success: false,
        error: error.message,
      };
    }

    // ── Handle unexpected errors ──────────────────────────────────────────────
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replace an existing document with a new file
 * 
 * Uploads new file, updates database, and deletes old file.
 * Resets verification status to PENDING.
 * 
 * Authorization: User must own the organization
 * 
 * @param formData - FormData containing new file and document ID
 * @returns Replace result
 */
export async function replaceDocumentAction(
  formData: FormData
): Promise<ReplaceDocumentActionResponse> {
  try {
    // ── Authentication ────────────────────────────────────────────────────────
    const { profile } = await requireAuth();

    // ── Extract form data ─────────────────────────────────────────────────────
    const file = formData.get("file") as File | null;
    const documentId = formData.get("documentId") as string;

    // ── Validate input ────────────────────────────────────────────────────────
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    if (!documentId) {
      return {
        success: false,
        error: "Document ID is required",
      };
    }

    // ── Call service layer ────────────────────────────────────────────────────
    const result = await documentService.replaceDocument({
      documentId,
      newFile: file,
      userId: profile.id,
    });

    // ── Revalidate paths ──────────────────────────────────────────────────────
    revalidatePath("/dashboard/organizer/verification");

    // ── Return success response ───────────────────────────────────────────────
    return {
      success: true,
      document: {
        id: result.document.id,
        documentType: result.document.documentType,
        originalFileName: result.document.originalFileName,
        fileSize: result.document.fileSize,
        uploadedAt: result.document.uploadedAt,
        verificationStatus: result.document.verificationStatus,
      },
      message: result.message,
    };
  } catch (error) {
    console.error("[replaceDocumentAction] Error:", error);

    // ── Handle service errors ─────────────────────────────────────────────────
    if (error instanceof DocumentServiceError) {
      return {
        success: false,
        error: error.message,
      };
    }

    // ── Handle unexpected errors ──────────────────────────────────────────────
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to replace document",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all documents for an organization
 * 
 * Authorization: User must own the organization
 * 
 * @param organizationId - Organization UUID
 * @returns List of documents
 */
export async function getDocumentsAction(
  organizationId: string
): Promise<GetDocumentsActionResponse> {
  try {
    // ── Authentication ────────────────────────────────────────────────────────
    const { profile } = await requireAuth();

    // ── Call service layer ────────────────────────────────────────────────────
    const documents = await documentService.getDocuments(
      organizationId,
      profile.id
    );

    // ── Return success response ───────────────────────────────────────────────
    return {
      success: true,
      documents: documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        originalFileName: doc.originalFileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        verificationStatus: doc.verificationStatus,
        reviewerNotes: doc.reviewerNotes,
      })),
    };
  } catch (error) {
    console.error("[getDocumentsAction] Error:", error);

    // ── Handle service errors ─────────────────────────────────────────────────
    if (error instanceof DocumentServiceError) {
      return {
        success: false,
        error: error.message,
      };
    }

    // ── Handle unexpected errors ──────────────────────────────────────────────
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET DOCUMENT PREVIEW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get signed URL for document preview
 * 
 * Generates a temporary URL (valid for 1 hour) to preview the document.
 * 
 * Authorization: User must own the organization
 * 
 * @param documentId - Document UUID
 * @returns Signed URL for preview
 */
export async function getDocumentPreviewAction(
  documentId: string
): Promise<GetDocumentPreviewActionResponse> {
  try {
    // ── Authentication ────────────────────────────────────────────────────────
    const { profile } = await requireAuth();

    // ── Call service layer ────────────────────────────────────────────────────
    const result = await documentService.getDocumentSignedUrl(
      documentId,
      profile.id
    );

    // ── Return success response ───────────────────────────────────────────────
    return {
      success: true,
      signedUrl: result.signedUrl,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    console.error("[getDocumentPreviewAction] Error:", error);

    // ── Handle service errors ─────────────────────────────────────────────────
    if (error instanceof DocumentServiceError) {
      return {
        success: false,
        error: error.message,
      };
    }

    // ── Handle unexpected errors ──────────────────────────────────────────────
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate preview URL",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: REVIEW DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Review a document (Admin only)
 * 
 * Approve, reject, or request changes for a document.
 * 
 * Authorization: Requires ADMIN role
 * 
 * @param reviewData - Review data with verification status and notes
 * @returns Updated document
 */
export async function reviewDocumentAction(
  reviewData: DocumentReviewFormData
): Promise<ReviewDocumentActionResponse> {
  try {
    // ── Authorization: Admin only ─────────────────────────────────────────────
    await requireAdmin();

    // ── Validation ────────────────────────────────────────────────────────────
    const validated = documentReviewSchema.parse(reviewData);

    // ── Get document before review ────────────────────────────────────────────
    const docBefore = await documentRepo.findDocumentById(
      validated.documentId
    );

    if (!docBefore) {
      return {
        success: false,
        error: "Document not found",
      };
    }

    const previousStatus = docBefore.verificationStatus;

    // ── Update verification status ────────────────────────────────────────────
    const document = await documentRepo.updateDocumentVerificationStatus(
      validated.documentId,
      validated.verificationStatus,
      validated.reviewerNotes
    );

    // ── Revalidate paths ──────────────────────────────────────────────────────
    revalidatePath("/admin/organizer-requests");
    revalidatePath("/dashboard/organizer/verification");

    // ── Return success response ───────────────────────────────────────────────
    return {
      success: true,
      document: {
        ...document,
        previousStatus,
        newStatus: document.verificationStatus,
      },
      message: `Document ${document.verificationStatus.toLowerCase()}`,
    };
  } catch (error) {
    console.error("[reviewDocumentAction] Error:", error);

    // ── Handle validation errors ──────────────────────────────────────────────
    if (error && typeof error === "object" && "errors" in error) {
      return {
        success: false,
        error: "Validation failed",
      };
    }

    // ── Handle unexpected errors ──────────────────────────────────────────────
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to review document",
    };
  }
}
