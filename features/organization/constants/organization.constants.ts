/**
 * Organization Feature Constants
 * 
 * Centralized constants for organization management including
 * validation rules, status mappings, and configuration values.
 * 
 * @module features/organization/constants
 */

import type {
  OrganizationType,
  DocumentType,
  WizardStep,
} from "../types/organization.types";

// Import VerificationStatus from Prisma and create aliases
import type { VerificationStatus } from "@prisma/client";
type OrganizationVerificationStatus = VerificationStatus;
type DocumentVerificationStatus = VerificationStatus;

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Field length constraints
 */
export const VALIDATION_RULES = {
  // Organization Name
  ORG_NAME_MIN_LENGTH: 3,
  ORG_NAME_MAX_LENGTH: 100,

  // Description
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 2000,

  // Phone
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,

  // PAN Number (India specific)
  PAN_LENGTH: 10,
  PAN_PATTERN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

  // GST Number (India specific)
  GST_LENGTH: 15,
  GST_PATTERN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,

  // IFSC Code (India specific)
  IFSC_LENGTH: 11,
  IFSC_PATTERN: /^[A-Z]{4}0[A-Z0-9]{6}$/,

  // Account Number
  ACCOUNT_NUMBER_MIN_LENGTH: 9,
  ACCOUNT_NUMBER_MAX_LENGTH: 18,

  // Postal Code
  POSTAL_CODE_MIN_LENGTH: 5,
  POSTAL_CODE_MAX_LENGTH: 10,

  // Registration Number
  REGISTRATION_NO_MIN_LENGTH: 5,
  REGISTRATION_NO_MAX_LENGTH: 50,
} as const;

/**
 * File upload constraints
 */
export const FILE_UPLOAD_RULES = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ] as string[],
  ALLOWED_EXTENSIONS: [".pdf", ".jpg", ".jpeg", ".png"],
  MAX_FILES_PER_TYPE: 3,
};

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION TYPE MAPPINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Human-readable organization type labels
 */
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  NGO: "Non-Governmental Organization (NGO)",
  TRUST: "Public Charitable Trust",
  SOCIETY: "Registered Society",
  COMPANY: "Section 8 Company",
  FOUNDATION: "Foundation",
  EDUCATIONAL: "Educational Institution",
  RELIGIOUS: "Religious Organization",
  INDIVIDUAL: "Individual / Sole Proprietor",
  OTHER: "Other",
};

/**
 * Organization type descriptions
 */
export const ORGANIZATION_TYPE_DESCRIPTIONS: Record<
  OrganizationType,
  string
> = {
  NGO: "Registered under Section 8 of Companies Act or similar",
  TRUST: "Registered under Indian Trusts Act, 1882",
  SOCIETY: "Registered under Societies Registration Act, 1860",
  COMPANY: "Section 8 Company under Companies Act, 2013",
  FOUNDATION: "Private or public foundation",
  EDUCATIONAL: "Schools, colleges, universities",
  RELIGIOUS: "Religious or spiritual organizations",
  INDIVIDUAL: "Individuals running charitable initiatives",
  OTHER: "Other types of charitable organizations",
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION STATUS MAPPINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verification status labels
 */
export const VERIFICATION_STATUS_LABELS: Record<
  OrganizationVerificationStatus,
  string
> = {
  DRAFT: "Draft",
  PENDING: "Pending Review",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/**
 * Verification status colors (Tailwind classes)
 */
export const VERIFICATION_STATUS_COLORS: Record<
  OrganizationVerificationStatus,
  string
> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

/**
 * Allowed status transitions
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  OrganizationVerificationStatus,
  OrganizationVerificationStatus[]
> = {
  DRAFT: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"],
  PENDING: ["UNDER_REVIEW", "APPROVED", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "PENDING"],
  APPROVED: ["UNDER_REVIEW", "REJECTED"],
  REJECTED: ["PENDING", "UNDER_REVIEW", "APPROVED"],
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPE MAPPINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Document type labels
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  REGISTRATION_CERTIFICATE: "Registration Certificate",
  PAN_CARD: "PAN Card",
  GST_CERTIFICATE: "GST Certificate",
  TAX_EXEMPTION_CERTIFICATE: "Tax Exemption Certificate (80G/12A)",
  BANK_PROOF: "Bank Account Proof",
  GOVERNMENT_CERTIFICATE: "Government Certificate",
  OTHER: "Other Document",
};

/**
 * Required document types by organization type
 */
export const REQUIRED_DOCUMENTS_BY_TYPE: Record<
  OrganizationType,
  DocumentType[]
> = {
  NGO: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  TRUST: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  SOCIETY: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  COMPANY: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  FOUNDATION: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  EDUCATIONAL: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  RELIGIOUS: ["REGISTRATION_CERTIFICATE", "PAN_CARD", "BANK_PROOF"],
  INDIVIDUAL: ["PAN_CARD", "BANK_PROOF"],
  OTHER: ["PAN_CARD", "BANK_PROOF"],
};

/**
 * Document verification status labels
 */
export const DOCUMENT_STATUS_LABELS: Record<DocumentVerificationStatus, string> =
  {
    DRAFT: "Draft",
    PENDING: "Pending Verification",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

/**
 * Document verification status colors
 */
export const DOCUMENT_STATUS_COLORS: Record<DocumentVerificationStatus, string> =
  {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    UNDER_REVIEW: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wizard step order
 */
export const WIZARD_STEPS: WizardStep[] = [
  "basic-info",
  "address",
  "legal-info",
  "bank-details",
  "branding",
  "documents",
  "review",
];

/**
 * Wizard step labels
 */
export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  "basic-info": "Basic Information",
  address: "Address Details",
  "legal-info": "Legal Information",
  "bank-details": "Bank Details",
  branding: "Branding",
  documents: "Documents",
  review: "Review & Submit",
};

/**
 * Wizard step descriptions
 */
export const WIZARD_STEP_DESCRIPTIONS: Record<WizardStep, string> = {
  "basic-info": "Organization name, type, and contact information",
  address: "Physical address and location details",
  "legal-info": "Registration and legal documentation",
  "bank-details": "Bank account for receiving donations",
  branding: "Logo and cover image (optional)",
  documents: "Upload verification documents",
  review: "Review all information before submission",
};

// ─────────────────────────────────────────────────────────────────────────────
// ERROR MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Organization not found",
  ALREADY_EXISTS: "An organization already exists for this profile",
  INVALID_STATUS: "Invalid verification status",
  CANNOT_SUBMIT: "Organization is not ready for submission",
  CANNOT_MODIFY: "Cannot modify organization in current status",
  DOCUMENT_NOT_FOUND: "Document not found",
  FILE_TOO_LARGE: "File size exceeds maximum allowed size",
  INVALID_FILE_TYPE: "File type is not allowed",
  MAX_FILES_EXCEEDED: "Maximum number of files exceeded for this document type",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  ORGANIZATION_CREATED: "Organization draft created successfully",
  ORGANIZATION_UPDATED: "Organization updated successfully",
  ORGANIZATION_SUBMITTED: "Organization submitted for review",
  DOCUMENT_UPLOADED: "Document uploaded successfully",
  DOCUMENT_DELETED: "Document deleted successfully",
  BECAME_ORGANIZER: "You are now a pending organizer",
} as const;
