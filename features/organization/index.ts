/**
 * Organization Feature - Public API
 * 
 * Central export point for organization feature.
 * Import from this file instead of individual modules.
 * 
 * @module features/organization
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type {
  Organization,
  OrganizationWithDocuments,
  OrganizationDocument,
  OrganizationSummary,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationDraftInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  WizardStep,
  WizardState,
  StepStatus,
  OrganizationType,
  OrganizationVerificationStatus,
  DocumentType,
  DocumentVerificationStatus,
} from "./types/organization.types";

export type {
  ActionResponse,
  SuccessResponse,
  ErrorResponse,
  CreateOrganizationResponse,
  UpdateOrganizationResponse,
  GetOrganizationResponse,
  SubmitOrganizationResponse,
  DeleteOrganizationResponse,
  BecomeOrganizerResponse,
  ReviewOrganizationResponse,
  UploadDocumentResponse,
  DeleteDocumentResponse,
  isSuccessResponse,
  isErrorResponse,
} from "./types/organization-response.types";

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export { becomeOrganizerAction } from "./actions/become-organizer.action";

export {
  createOrganizationDraftAction,
  updateOrganizationAction,
  getMyOrganizationAction,
  getOrganizationByIdAction,
  submitOrganizationAction,
  deleteOrganizationAction,
  reviewOrganizationAction,
  getOrganizationsPendingReviewAction,
} from "./actions/organization.actions";

export {
  uploadDocumentAction,
  getOrganizationDocumentsAction,
  getDocumentByIdAction,
  deleteDocumentAction,
  reviewDocumentAction,
} from "./actions/document.actions";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export {
  basicInfoSchema,
  addressSchema,
  legalInfoSchema,
  bankDetailsSchema,
  brandingSchema,
  completeOrganizationSchema,
  partialOrganizationSchema,
  updateOrganizationSchema,
  verificationReviewSchema,
  type BasicInfoFormData,
  type AddressFormData,
  type LegalInfoFormData,
  type BankDetailsFormData,
  type BrandingFormData,
  type CompleteOrganizationFormData,
  type PartialOrganizationFormData,
  type UpdateOrganizationFormData,
  type VerificationReviewFormData,
} from "./schemas/organization.schema";

export {
  documentUploadSchema,
  documentReviewSchema,
  validateFile,
  validateFiles,
  type DocumentUploadFormData,
  type DocumentReviewFormData,
} from "./schemas/document.schema";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  VALIDATION_RULES,
  FILE_UPLOAD_RULES,
  ORGANIZATION_TYPE_LABELS,
  ORGANIZATION_TYPE_DESCRIPTIONS,
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS,
  ALLOWED_STATUS_TRANSITIONS,
  DOCUMENT_TYPE_LABELS,
  REQUIRED_DOCUMENTS_BY_TYPE,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
  WIZARD_STEPS,
  WIZARD_STEP_LABELS,
  WIZARD_STEP_DESCRIPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "./constants/organization.constants";

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export {
  isStepComplete,
  getWizardState,
  getStepStatuses,
  getNextStep,
  getPreviousStep,
  canEditOrganization,
  canSubmitOrganization,
  canDeleteOrganization,
  isStatusTransitionAllowed,
  getAllowedStatusTransitions,
  calculateCompletionPercentage,
  getMissingFields,
  getRequiredDocumentTypes,
  formatFileSize,
  getFileExtension,
} from "./utils/organization-helpers";
