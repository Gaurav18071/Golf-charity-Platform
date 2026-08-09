/**
 * Document Validation Schemas
 * 
 * Zod schemas for validating document uploads and metadata.
 * 
 * @module features/organization/schemas
 */

import { z } from "zod";
import { FILE_UPLOAD_RULES } from "../constants/organization.constants";
import { DocumentType, DocumentVerificationStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT UPLOAD SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for document upload metadata
 */
export const documentUploadSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),

  documentType: z.nativeEnum(DocumentType),

  originalFileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must not exceed 255 characters"),

  storagePath: z
    .string()
    .min(1, "Storage path is required")
    .max(500, "Storage path must not exceed 500 characters"),

  mimeType: z
    .string()
    .refine(
      (type) =>
        (FILE_UPLOAD_RULES.ALLOWED_FILE_TYPES as readonly string[]).includes(
          type
        ),
      {
        message: `File type must be one of: ${FILE_UPLOAD_RULES.ALLOWED_FILE_TYPES.join(", ")}`,
      }
    ),

  fileSize: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be positive")
    .max(
      FILE_UPLOAD_RULES.MAX_FILE_SIZE,
      `File size must not exceed ${FILE_UPLOAD_RULES.MAX_FILE_SIZE / (1024 * 1024)}MB`
    ),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT REVIEW SCHEMA (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for admin document review
 */
export const documentReviewSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),

  verificationStatus: z.nativeEnum(DocumentVerificationStatus),

  reviewerNotes: z
    .string()
    .max(500, "Reviewer notes must not exceed 500 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type DocumentReviewFormData = z.infer<typeof documentReviewSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT-SIDE FILE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Client-side file validation helper
 * Use this before uploading files to validate on the client
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_UPLOAD_RULES.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must not exceed ${FILE_UPLOAD_RULES.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!FILE_UPLOAD_RULES.ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${FILE_UPLOAD_RULES.ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Batch file validation helper
 */
export function validateFiles(
  files: File[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  files.forEach((file, index) => {
    const result = validateFile(file);
    if (!result.valid && result.error) {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
