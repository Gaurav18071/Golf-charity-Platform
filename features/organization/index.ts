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

export type {
  DocumentWithUrl,
  UploadProgress,
  DocumentValidationError,
  DocumentUploadResponse,
  DocumentDeleteResponse,
  DocumentReplaceResponse,
  DocumentListResponse,
  DocumentPreviewResponse,
  DocumentTypeMetadata,
  DocumentStatistics,
  FileValidation,
  DocumentUploadState,
  DocumentCardData,
  DocumentFilterOptions,
  DocumentSortField,
  DocumentSortOrder,
  DocumentSortOptions,
  BulkDocumentOperation,
  BulkOperationResponse,
} from "./types/document.types";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export {
  DocumentService,
  DocumentServiceError,
  DocumentServiceErrorType,
  documentService,
  type UploadDocumentInput,
  type UploadDocumentResult,
  type DeleteDocumentInput,
  type ReplaceDocumentInput,
} from "./services/document.service";

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORIES
// ─────────────────────────────────────────────────────────────────────────────

export {
  OrganizationStorageRepository,
  organizationStorageRepository,
} from "./repositories/storage.repository";

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
  approveOrganizationAction,
  rejectOrganizationAction,
  requestChangesOrganizationAction,
  approveOrganizationFormAction,
  rejectOrganizationFormAction,
  requestChangesOrganizationFormAction,
  getOrganizationsPendingReviewAction,
} from "./actions/organization.actions";

export {
  uploadDocumentAction,
  deleteDocumentAction,
  replaceDocumentAction,
  getDocumentsAction,
  getDocumentPreviewAction,
  reviewDocumentAction,
  type UploadDocumentActionResponse,
  type DeleteDocumentActionResponse,
  type ReplaceDocumentActionResponse,
  type GetDocumentsActionResponse,
  type GetDocumentPreviewActionResponse,
  type ReviewDocumentActionResponse,
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
  approveOrganizationSchema,
  rejectOrganizationSchema,
  requestChangesOrganizationSchema,
  verificationReviewSchema,
  type BasicInfoFormData,
  type AddressFormData,
  type LegalInfoFormData,
  type BankDetailsFormData,
  type BrandingFormData,
  type CompleteOrganizationFormData,
  type PartialOrganizationFormData,
  type UpdateOrganizationFormData,
  type ApproveOrganizationFormData,
  type RejectOrganizationFormData,
  type RequestChangesOrganizationFormData,
  type VerificationReviewFormData,
} from "./schemas/organization.schema";

export {
  documentUploadSchema,
  documentReviewSchema,
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
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  DocumentUploader,
  type DocumentUploaderProps,
  DocumentCard,
  type DocumentCardProps,
  DocumentList,
  type DocumentListProps,
  DocumentPreview,
  type DocumentPreviewProps,
  DocumentManager,
  type DocumentManagerProps,
} from "./components/documents";

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export {
  useDocumentUpload,
  type UploadState,
  type UseDocumentUploadOptions,
  type UseDocumentUploadReturn,
} from "./hooks/useDocumentUpload";

export {
  useDocuments,
  type Document,
  type DocumentsState,
  type UseDocumentsOptions,
  type UseDocumentsReturn,
} from "./hooks/useDocuments";

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

export {
  DOCUMENT_TYPE_METADATA,
  ALLOWED_EXTENSIONS,
  FILE_SIZE_LIMITS,
  validateFile,
  validateFiles,
  isImageFile,
  isPDFFile,
  getFileIcon,
  truncateFileName,
  formatUploadDate,
  getDocumentTypeLabel,
  getDocumentTypeDescription,
  isDocumentTypeRequired,
  getAcceptedFormats,
  getOptionalDocumentTypes,
  getVerificationStatusColor,
  getVerificationStatusIcon,
  getVerificationStatusLabel,
  createUploadFormData,
  createReplaceFormData,
  fileToBase64,
  canUploadMoreDocuments,
  type FileValidationError,
  type FileValidationResult,
} from "./utils/document-helpers";
