/**
 * Organization Type Definitions
 * 
 * These types mirror the Prisma schema and provide type safety
 * throughout the organization feature.
 * 
 * @module features/organization/types
 */

import type {
  Organization as PrismaOrganization,
  OrganizationDocument as PrismaOrganizationDocument,
  OrganizationType,
  OrganizationVerificationStatus,
  DocumentType,
  DocumentVerificationStatus,
} from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete Organization entity from database
 */
export type Organization = PrismaOrganization;

/**
 * Organization with related documents included
 */
export interface OrganizationWithDocuments extends PrismaOrganization {
  documents: OrganizationDocument[];
}

/**
 * Organization create input (excludes auto-generated fields)
 */
export interface CreateOrganizationInput {
  profileId: string;
  
  // Basic Information
  name: string;
  type: OrganizationType;
  description: string;
  website?: string | null;
  email: string;
  phone: string;

  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  // Legal Information
  registrationNo: string;
  panNumber: string;
  gstNumber?: string | null;
  taxExemptionNo?: string | null;

  // Bank Details
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;

  // Branding
  logoUrl?: string | null;
  coverImageUrl?: string | null;
}

/**
 * Organization update input (all fields optional except id)
 */
export interface UpdateOrganizationInput {
  id: string;
  
  // Basic Information
  name?: string;
  type?: OrganizationType;
  description?: string;
  website?: string | null;
  email?: string;
  phone?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Legal Information
  registrationNo?: string;
  panNumber?: string;
  gstNumber?: string | null;
  taxExemptionNo?: string | null;

  // Bank Details
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  branchName?: string;

  // Branding
  logoUrl?: string | null;
  coverImageUrl?: string | null;
}

/**
 * Organization draft data for wizard steps
 * Allows partial data during multi-step form
 */
export interface OrganizationDraftInput {
  profileId: string;
  
  // Step 1: Basic Information
  name?: string;
  type?: OrganizationType;
  description?: string;
  website?: string | null;
  email?: string;
  phone?: string;

  // Step 2: Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Step 3: Legal Information
  registrationNo?: string;
  panNumber?: string;
  gstNumber?: string | null;
  taxExemptionNo?: string | null;

  // Step 4: Bank Details
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  branchName?: string;

  // Step 5: Branding
  logoUrl?: string | null;
  coverImageUrl?: string | null;
}

/**
 * Organization summary for listings
 */
export interface OrganizationSummary {
  id: string;
  name: string;
  type: OrganizationType;
  verificationStatus: OrganizationVerificationStatus;
  logoUrl: string | null;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete Document entity from database
 */
export type OrganizationDocument = PrismaOrganizationDocument;

/**
 * Document upload input
 */
export interface CreateDocumentInput {
  organizationId: string;
  documentType: DocumentType;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
}

/**
 * Document update input
 */
export interface UpdateDocumentInput {
  id: string;
  verificationStatus?: DocumentVerificationStatus;
  reviewerNotes?: string | null;
}

/**
 * Document with upload metadata
 */
export interface DocumentWithMetadata extends OrganizationDocument {
  uploadProgress?: number;
  uploadError?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verification review input (Admin use)
 */
export interface VerificationReviewInput {
  organizationId: string;
  verificationStatus: OrganizationVerificationStatus;
  adminNotes?: string | null;
}

/**
 * Document review input (Admin use)
 */
export interface DocumentReviewInput {
  documentId: string;
  verificationStatus: DocumentVerificationStatus;
  reviewerNotes?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD STEP TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wizard step identifiers
 */
export type WizardStep =
  | "basic-info"
  | "address"
  | "legal-info"
  | "bank-details"
  | "branding"
  | "documents"
  | "review";

/**
 * Step completion status
 */
export interface StepStatus {
  step: WizardStep;
  completed: boolean;
  hasErrors: boolean;
}

/**
 * Wizard state
 */
export interface WizardState {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  canProceed: boolean;
  canSubmit: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRISMA ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type {
  OrganizationType,
  OrganizationVerificationStatus,
  DocumentType,
  DocumentVerificationStatus,
};
