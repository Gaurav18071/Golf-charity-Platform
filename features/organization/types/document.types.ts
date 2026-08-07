/**
 * Document Types
 * 
 * Type definitions for organization document management.
 * 
 * @module features/organization/types/document.types
 */

import type { DocumentType, DocumentVerificationStatus } from "@prisma/client";
import type { OrganizationDocument } from "./organization.types";

/**
 * Document with signed URL for preview
 */
export interface DocumentWithUrl extends OrganizationDocument {
  signedUrl?: string;
  previewUrl?: string;
}

/**
 * Document upload progress
 */
export interface UploadProgress {
  documentType: DocumentType;
  fileName: string;
  progress: number; // 0-100
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
}

/**
 * Document validation error
 */
export interface DocumentValidationError {
  field: string;
  message: string;
}

/**
 * Document upload response
 */
export interface DocumentUploadResponse {
  success: boolean;
  document?: OrganizationDocument;
  message: string;
  error?: string;
}

/**
 * Document delete response
 */
export interface DocumentDeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Document replace response
 */
export interface DocumentReplaceResponse {
  success: boolean;
  document?: OrganizationDocument;
  message: string;
  error?: string;
}

/**
 * Document list response
 */
export interface DocumentListResponse {
  success: boolean;
  documents: OrganizationDocument[];
  error?: string;
}

/**
 * Document preview response
 */
export interface DocumentPreviewResponse {
  success: boolean;
  signedUrl?: string;
  expiresIn?: number;
  error?: string;
}

/**
 * Document type metadata
 */
export interface DocumentTypeMetadata {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
  maxSize: number; // bytes
  allowedTypes: string[];
  icon?: string;
}

/**
 * Document statistics
 */
export interface DocumentStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<DocumentType, number>;
}

/**
 * File validation result
 */
export interface FileValidation {
  valid: boolean;
  errors: DocumentValidationError[];
}

/**
 * Upload state for UI
 */
export interface DocumentUploadState {
  file: File | null;
  documentType: DocumentType | null;
  progress: number;
  uploading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Document card props
 */
export interface DocumentCardData {
  id: string;
  documentType: DocumentType;
  originalFileName: string;
  fileSize: number;
  uploadedAt: Date;
  verificationStatus: DocumentVerificationStatus;
  reviewerNotes: string | null;
  mimeType: string;
}

/**
 * Document filter options
 */
export interface DocumentFilterOptions {
  documentType?: DocumentType;
  verificationStatus?: DocumentVerificationStatus;
  searchQuery?: string;
}

/**
 * Document sort options
 */
export type DocumentSortField = "uploadedAt" | "documentType" | "fileSize" | "verificationStatus";
export type DocumentSortOrder = "asc" | "desc";

export interface DocumentSortOptions {
  field: DocumentSortField;
  order: DocumentSortOrder;
}

/**
 * Bulk document operation
 */
export interface BulkDocumentOperation {
  documentIds: string[];
  action: "delete" | "approve" | "reject";
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ documentId: string; error: string }>;
}
