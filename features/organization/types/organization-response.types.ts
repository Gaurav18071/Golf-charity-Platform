/**
 * Organization API Response Types
 * 
 * Standardized response types for server actions and API endpoints.
 * All server actions should return these response types for consistency.
 * 
 * @module features/organization/types
 */

import type {
  Organization,
  OrganizationWithDocuments,
  OrganizationDocument,
  OrganizationSummary,
} from "./organization.types";

// ─────────────────────────────────────────────────────────────────────────────
// BASE RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Success response wrapper
 */
export interface SuccessResponse<T = void> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error response wrapper
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Generic action response
 */
export type ActionResponse<T = void> = SuccessResponse<T> | ErrorResponse;

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION ACTION RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response for organization creation
 */
export type CreateOrganizationResponse = ActionResponse<{
  organization: Organization;
}>;

/**
 * Response for organization update
 */
export type UpdateOrganizationResponse = ActionResponse<{
  organization: Organization;
}>;

/**
 * Response for organization retrieval
 */
export type GetOrganizationResponse = ActionResponse<{
  organization: OrganizationWithDocuments;
}>;

/**
 * Response for organization list
 */
export type ListOrganizationsResponse = ActionResponse<{
  organizations: OrganizationSummary[];
  total: number;
  page: number;
  pageSize: number;
}>;

/**
 * Response for organization deletion
 */
export type DeleteOrganizationResponse = ActionResponse<{
  organizationId: string;
}>;

/**
 * Response for organization submission
 */
export type SubmitOrganizationResponse = ActionResponse<{
  organization: Organization;
  submittedAt: Date;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT ACTION RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response for document upload
 */
export type UploadDocumentResponse = ActionResponse<{
  document: OrganizationDocument;
  uploadUrl?: string;
}>;

/**
 * Response for document deletion
 */
export type DeleteDocumentResponse = ActionResponse<{
  documentId: string;
}>;

/**
 * Response for document retrieval
 */
export type GetDocumentResponse = ActionResponse<{
  document: OrganizationDocument;
  downloadUrl?: string;
}>;

/**
 * Response for document list
 */
export type ListDocumentsResponse = ActionResponse<{
  documents: OrganizationDocument[];
}>;

// ─────────────────────────────────────────────────────────────────────────────
// ROLE ACTION RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response for becoming an organizer
 */
export type BecomeOrganizerResponse = ActionResponse<{
  profileId: string;
  previousRole: string;
  newRole: "PENDING_ORGANIZER";
}>;

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION ACTION RESPONSES (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response for organization verification review
 */
export type ReviewOrganizationResponse = ActionResponse<{
  organization: Organization;
  previousStatus: string;
  newStatus: string;
  reviewedAt: Date;
}>;

/**
 * Response for document verification review
 */
export type ReviewDocumentResponse = ActionResponse<{
  document: OrganizationDocument;
  previousStatus: string;
  newStatus: string;
  reviewedAt: Date;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER TYPE GUARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ActionResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse<T>(
  response: ActionResponse<T>
): response is ErrorResponse {
  return response.success === false;
}
