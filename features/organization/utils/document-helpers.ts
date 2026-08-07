/**
 * Document Helper Utilities
 * 
 * Client-side utilities for document validation, formatting, and metadata.
 * Used by document upload components for instant feedback.
 * 
 * @module features/organization/utils/document-helpers
 */

import type { DocumentType } from "@prisma/client";
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "@/lib/supabase/storage";
import { File as FileIcon, FileText, Image, AlertCircle } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Document type metadata
 */
export const DOCUMENT_TYPE_METADATA: Record<
  DocumentType,
  {
    label: string;
    description: string;
    icon: typeof FileIcon;
    required: boolean;
    acceptedFormats: string;
    examples: string[];
  }
> = {
  REGISTRATION_CERTIFICATE: {
    label: "Registration Certificate",
    description: "Official certificate showing your organization is registered",
    icon: FileText,
    required: true,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["Trust Deed", "Society Registration", "NGO Certificate"],
  },
  PAN_CARD: {
    label: "PAN Card",
    description: "Permanent Account Number for tax purposes",
    icon: FileText,
    required: true,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["Organization PAN Card"],
  },
  GST_CERTIFICATE: {
    label: "GST Certificate",
    description: "Goods and Services Tax registration (if applicable)",
    icon: FileText,
    required: false,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["GST Registration Certificate"],
  },
  TAX_EXEMPTION_CERTIFICATE: {
    label: "Tax Exemption Certificate",
    description: "80G or 12A certificate for tax benefits",
    icon: FileText,
    required: false,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["80G Certificate", "12A Certificate"],
  },
  GOVERNMENT_REGISTRATION: {
    label: "Government Registration",
    description: "Any additional government registrations",
    icon: FileText,
    required: false,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["FCRA Certificate", "CSR Registration"],
  },
  BANK_STATEMENT: {
    label: "Bank Statement",
    description: "Recent bank statement (last 3 months)",
    icon: FileText,
    required: true,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["Account Statement", "Cancelled Cheque"],
  },
  OTHER: {
    label: "Other Document",
    description: "Any other supporting documents",
    icon: FileIcon,
    required: false,
    acceptedFormats: "PDF, PNG, JPEG",
    examples: ["Supporting Documents", "Additional Proof"],
  },
};

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpeg", ".jpg"] as const;

/**
 * File size limits
 */
export const FILE_SIZE_LIMITS = {
  MIN: 1024, // 1 KB
  MAX: MAX_FILE_SIZE, // 10 MB
  RECOMMENDED_MAX: 5 * 1024 * 1024, // 5 MB
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FileValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: FileValidationError[];
  warnings: FileValidationError[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a file for upload
 * 
 * Checks:
 * - File exists
 * - File name is valid
 * - File size is within limits
 * - File type is allowed
 * - MIME type matches extension
 * 
 * @param file - File to validate
 * @returns Validation result with errors and warnings
 */
export function validateFile(file: File | null): FileValidationResult {
  const errors: FileValidationError[] = [];
  const warnings: FileValidationError[] = [];

  // ── Check file exists ────────────────────────────────────────────────────
  if (!file) {
    errors.push({
      code: "FILE_REQUIRED",
      message: "Please select a file to upload",
      field: "file",
    });
    return { valid: false, errors, warnings };
  }

  // ── Check file name ──────────────────────────────────────────────────────
  if (!file.name || file.name.trim().length === 0) {
    errors.push({
      code: "INVALID_NAME",
      message: "File name is required",
      field: "file",
    });
  }

  // Check for special characters that might cause issues
  if (/[<>:"|?*]/.test(file.name)) {
    errors.push({
      code: "INVALID_CHARACTERS",
      message: "File name contains invalid characters",
      field: "file",
    });
  }

  // ── Check file size ──────────────────────────────────────────────────────
  if (file.size === 0) {
    errors.push({
      code: "FILE_EMPTY",
      message: "File is empty (0 bytes)",
      field: "file",
    });
  } else if (file.size < FILE_SIZE_LIMITS.MIN) {
    warnings.push({
      code: "FILE_TOO_SMALL",
      message: `File is very small (${formatFileSize(file.size)}). This might be corrupted.`,
      field: "file",
    });
  } else if (file.size > FILE_SIZE_LIMITS.MAX) {
    errors.push({
      code: "FILE_TOO_LARGE",
      message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(FILE_SIZE_LIMITS.MAX)})`,
      field: "file",
    });
  } else if (file.size > FILE_SIZE_LIMITS.RECOMMENDED_MAX) {
    warnings.push({
      code: "FILE_LARGE",
      message: `File is large (${formatFileSize(file.size)}). Consider compressing it for faster uploads.`,
      field: "file",
    });
  }

  // ── Check file type ──────────────────────────────────────────────────────
  const extension = getFileExtension(file.name);

  if (!extension) {
    errors.push({
      code: "NO_EXTENSION",
      message: "File must have an extension (.pdf, .png, .jpeg, or .jpg)",
      field: "file",
    });
  } else if (!ALLOWED_EXTENSIONS.includes(`.${extension}` as typeof ALLOWED_EXTENSIONS[number])) {
    errors.push({
      code: "INVALID_EXTENSION",
      message: `File type ".${extension}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
      field: "file",
    });
  }

  // ── Check MIME type ──────────────────────────────────────────────────────
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    errors.push({
      code: "INVALID_MIME_TYPE",
      message: `File type "${file.type}" is not supported. Allowed: PDF, PNG, JPEG, JPG`,
      field: "file",
    });
  }

  // ── Verify MIME type matches extension ───────────────────────────────────
  if (file.type && extension) {
    const mimeExtensionMap: Record<string, string[]> = {
      "application/pdf": ["pdf"],
      "image/png": ["png"],
      "image/jpeg": ["jpeg", "jpg"],
      "image/jpg": ["jpg", "jpeg"],
    };

    const expectedExtensions = mimeExtensionMap[file.type];
    if (expectedExtensions && !expectedExtensions.includes(extension)) {
      warnings.push({
        code: "MIME_EXTENSION_MISMATCH",
        message: `File extension ".${extension}" doesn't match file type "${file.type}"`,
        field: "file",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple files
 * 
 * @param files - Array of files to validate
 * @returns Map of file names to validation results
 */
export function validateFiles(
  files: File[]
): Map<string, FileValidationResult> {
  const results = new Map<string, FileValidationResult>();

  files.forEach((file) => {
    const result = validateFile(file);
    results.set(file.name, result);
  });

  return results;
}

/**
 * Check if file is an image
 * 
 * @param file - File to check
 * @returns True if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Check if file is a PDF
 * 
 * @param file - File to check
 * @returns True if file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format file size to human-readable string
 * 
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 * 
 * @param filename - File name
 * @returns File extension (lowercase, without dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Get file icon based on file type
 * 
 * @param file - File or MIME type string
 * @returns Lucide icon component
 */
export function getFileIcon(file: File | string): typeof FileIcon {
  const mimeType = typeof file === "string" ? file : file.type;

  if (mimeType.startsWith("image/")) {
    return Image;
  }

  if (mimeType === "application/pdf") {
    return FileText;
  }

  return FileIcon;
}

/**
 * Truncate filename if too long
 * 
 * @param filename - File name
 * @param maxLength - Maximum length (default: 30)
 * @returns Truncated filename with extension preserved
 */
export function truncateFileName(filename: string, maxLength = 30): string {
  if (filename.length <= maxLength) return filename;

  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.substring(
    0,
    filename.length - extension.length - 1
  );

  const truncatedLength = maxLength - extension.length - 4; // 4 for "..." and "."
  const truncated = nameWithoutExt.substring(0, truncatedLength);

  return `${truncated}...${extension}`;
}

/**
 * Format upload date relative to now
 * 
 * @param date - Upload date
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatUploadDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get document type label
 * 
 * @param documentType - Document type enum value
 * @returns Human-readable label
 */
export function getDocumentTypeLabel(documentType: DocumentType): string {
  return DOCUMENT_TYPE_METADATA[documentType]?.label ?? documentType;
}

/**
 * Get document type description
 * 
 * @param documentType - Document type enum value
 * @returns Description text
 */
export function getDocumentTypeDescription(documentType: DocumentType): string {
  return DOCUMENT_TYPE_METADATA[documentType]?.description ?? "";
}

/**
 * Check if document type is required
 * 
 * @param documentType - Document type enum value
 * @returns True if required for all organizations
 */
export function isDocumentTypeRequired(documentType: DocumentType): boolean {
  return DOCUMENT_TYPE_METADATA[documentType]?.required ?? false;
}

/**
 * Get accepted formats for document type
 * 
 * @param documentType - Document type enum value
 * @returns Formatted string of accepted formats
 */
export function getAcceptedFormats(documentType: DocumentType): string {
  return DOCUMENT_TYPE_METADATA[documentType]?.acceptedFormats ?? "PDF, PNG, JPEG";
}

/**
 * Get all required document types
 * 
 * @returns Array of required document types
 */
export function getRequiredDocumentTypes(): DocumentType[] {
  return Object.entries(DOCUMENT_TYPE_METADATA)
    .filter(([_, meta]) => meta.required)
    .map(([type, _]) => type as DocumentType);
}

/**
 * Get all optional document types
 * 
 * @returns Array of optional document types
 */
export function getOptionalDocumentTypes(): DocumentType[] {
  return Object.entries(DOCUMENT_TYPE_METADATA)
    .filter(([_, meta]) => !meta.required)
    .map(([type, _]) => type as DocumentType);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT STATUS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get verification status color
 * 
 * @param status - Verification status
 * @returns Tailwind color class
 */
export function getVerificationStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/**
 * Get verification status icon
 * 
 * @param status - Verification status
 * @returns Lucide icon component
 */
export function getVerificationStatusIcon(status: string): typeof FileIcon {
  switch (status) {
    case "PENDING":
      return AlertCircle;
    case "APPROVED":
      return FileText;
    case "REJECTED":
      return AlertCircle;
    default:
      return FileIcon;
  }
}

/**
 * Get verification status label
 * 
 * @param status - Verification status
 * @returns Human-readable label
 */
export function getVerificationStatusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create FormData for file upload
 * 
 * @param file - File to upload
 * @param organizationId - Organization UUID
 * @param documentType - Document type
 * @returns FormData ready for server action
 */
export function createUploadFormData(
  file: File,
  organizationId: string,
  documentType: DocumentType
): FormData {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("organizationId", organizationId);
  formData.append("documentType", documentType);
  return formData;
}

/**
 * Create FormData for document replacement
 * 
 * @param file - New file
 * @param documentId - Existing document UUID
 * @returns FormData ready for server action
 */
export function createReplaceFormData(file: File, documentId: string): FormData {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentId", documentId);
  return formData;
}

/**
 * Convert file to base64 for preview
 * 
 * @param file - File to convert
 * @returns Promise resolving to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Check if document upload is allowed based on count
 * 
 * @param currentCount - Current number of uploaded documents
 * @param maxCount - Maximum allowed documents (default: 10)
 * @returns True if more documents can be uploaded
 */
export function canUploadMoreDocuments(
  currentCount: number,
  maxCount = 10
): boolean {
  return currentCount < maxCount;
}
