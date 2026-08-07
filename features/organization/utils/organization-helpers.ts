/**
 * Organization Helper Utilities
 * 
 * Reusable utility functions for organization feature.
 * 
 * @module features/organization/utils
 */

import type {
  Organization,
  WizardStep,
  WizardState,
  StepStatus,
} from "../types/organization.types";
import type { OrganizationVerificationStatus } from "@prisma/client";
import {
  WIZARD_STEPS,
  ALLOWED_STATUS_TRANSITIONS,
  REQUIRED_DOCUMENTS_BY_TYPE,
} from "../constants/organization.constants";

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a wizard step is complete
 * 
 * @param step - Wizard step identifier
 * @param organization - Organization data (can be partial)
 * @returns True if step has all required fields
 */
export function isStepComplete(
  step: WizardStep,
  organization: Partial<Organization>
): boolean {
  switch (step) {
    case "basic-info":
      return !!(
        organization.name &&
        organization.type &&
        organization.description &&
        organization.email &&
        organization.phone
      );

    case "address":
      return !!(
        organization.address &&
        organization.city &&
        organization.state &&
        organization.country &&
        organization.postalCode
      );

    case "legal-info":
      return !!(
        organization.registrationNo &&
        organization.panNumber
      );

    case "bank-details":
      return !!(
        organization.accountHolder &&
        organization.accountNumber &&
        organization.bankName &&
        organization.ifscCode &&
        organization.branchName
      );

    case "branding":
      // Branding is optional
      return true;

    case "documents":
      // Documents check will be done separately
      return false;

    case "review":
      // Review step is never "complete" until submission
      return false;

    default:
      return false;
  }
}

/**
 * Get wizard state based on organization data
 * 
 * @param organization - Organization data
 * @param documentCount - Number of documents uploaded
 * @returns Wizard state
 */
export function getWizardState(
  organization: Partial<Organization>,
  documentCount = 0
): WizardState {
  const completedSteps: WizardStep[] = [];

  WIZARD_STEPS.forEach((step) => {
    if (step === "documents") {
      // Check if required documents are uploaded
      if (organization.type && documentCount > 0) {
        const requiredDocs = REQUIRED_DOCUMENTS_BY_TYPE[organization.type];
        if (documentCount >= requiredDocs.length) {
          completedSteps.push(step);
        }
      }
    } else if (isStepComplete(step, organization)) {
      completedSteps.push(step);
    }
  });

  // Determine current step (first incomplete step)
  let currentStep: WizardStep = "basic-info";
  for (const step of WIZARD_STEPS) {
    if (!completedSteps.includes(step)) {
      currentStep = step;
      break;
    }
  }

  // Can proceed if current step is complete
  const canProceed = completedSteps.includes(currentStep);

  // Can submit if all steps except review are complete
  const requiredSteps = WIZARD_STEPS.filter((s) => s !== "review");
  const canSubmit = requiredSteps.every((s) => completedSteps.includes(s));

  return {
    currentStep,
    completedSteps,
    canProceed,
    canSubmit,
  };
}

/**
 * Get step statuses
 * 
 * @param organization - Organization data
 * @param documentCount - Number of documents uploaded
 * @returns Array of step statuses
 */
export function getStepStatuses(
  organization: Partial<Organization>,
  documentCount = 0
): StepStatus[] {
  return WIZARD_STEPS.map((step) => {
    let completed = false;

    if (step === "documents") {
      if (organization.type && documentCount > 0) {
        const requiredDocs = REQUIRED_DOCUMENTS_BY_TYPE[organization.type];
        completed = documentCount >= requiredDocs.length;
      }
    } else {
      completed = isStepComplete(step, organization);
    }

    return {
      step,
      completed,
      hasErrors: false, // Can be enhanced with validation errors
    };
  });
}

/**
 * Get next wizard step
 * 
 * @param currentStep - Current wizard step
 * @returns Next step or null if at end
 */
export function getNextStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === WIZARD_STEPS.length - 1) {
    return null;
  }
  return WIZARD_STEPS[currentIndex + 1];
}

/**
 * Get previous wizard step
 * 
 * @param currentStep - Current wizard step
 * @returns Previous step or null if at start
 */
export function getPreviousStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return WIZARD_STEPS[currentIndex - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if organization can be edited
 * 
 * @param status - Current verification status
 * @returns True if organization can be edited
 */
export function canEditOrganization(
  status: OrganizationVerificationStatus
): boolean {
  return status === "DRAFT" || status === "REJECTED";
}

/**
 * Check if organization can be submitted
 * 
 * @param status - Current verification status
 * @returns True if organization can be submitted
 */
export function canSubmitOrganization(
  status: OrganizationVerificationStatus
): boolean {
  return status === "DRAFT" || status === "REJECTED";
}

/**
 * Check if organization can be deleted
 * 
 * @param status - Current verification status
 * @returns True if organization can be deleted
 */
export function canDeleteOrganization(
  status: OrganizationVerificationStatus
): boolean {
  return status === "DRAFT" || status === "REJECTED";
}

/**
 * Check if status transition is allowed
 * 
 * @param from - Current status
 * @param to - Target status
 * @returns True if transition is allowed
 */
export function isStatusTransitionAllowed(
  from: OrganizationVerificationStatus,
  to: OrganizationVerificationStatus
): boolean {
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

/**
 * Get allowed status transitions
 * 
 * @param currentStatus - Current verification status
 * @returns Array of allowed next statuses
 */
export function getAllowedStatusTransitions(
  currentStatus: OrganizationVerificationStatus
): OrganizationVerificationStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus];
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate organization completion percentage
 * 
 * @param organization - Organization data
 * @param documentCount - Number of documents uploaded
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionPercentage(
  organization: Partial<Organization>,
  documentCount = 0
): number {
  const stepStatuses = getStepStatuses(organization, documentCount);
  const completedSteps = stepStatuses.filter((s) => s.completed).length;
  const totalSteps = WIZARD_STEPS.length - 1; // Exclude review step

  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Get missing required fields for a step
 * 
 * @param step - Wizard step
 * @param organization - Organization data
 * @returns Array of missing field names
 */
export function getMissingFields(
  step: WizardStep,
  organization: Partial<Organization>
): string[] {
  const missing: string[] = [];

  switch (step) {
    case "basic-info":
      if (!organization.name) missing.push("name");
      if (!organization.type) missing.push("type");
      if (!organization.description) missing.push("description");
      if (!organization.email) missing.push("email");
      if (!organization.phone) missing.push("phone");
      break;

    case "address":
      if (!organization.address) missing.push("address");
      if (!organization.city) missing.push("city");
      if (!organization.state) missing.push("state");
      if (!organization.country) missing.push("country");
      if (!organization.postalCode) missing.push("postalCode");
      break;

    case "legal-info":
      if (!organization.registrationNo) missing.push("registrationNo");
      if (!organization.panNumber) missing.push("panNumber");
      break;

    case "bank-details":
      if (!organization.accountHolder) missing.push("accountHolder");
      if (!organization.accountNumber) missing.push("accountNumber");
      if (!organization.bankName) missing.push("bankName");
      if (!organization.ifscCode) missing.push("ifscCode");
      if (!organization.branchName) missing.push("branchName");
      break;
  }

  return missing;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get required document types for organization type
 * 
 * @param organizationType - Type of organization
 * @returns Array of required document types
 */
export function getRequiredDocumentTypes(
  organizationType: keyof typeof REQUIRED_DOCUMENTS_BY_TYPE
) {
  return REQUIRED_DOCUMENTS_BY_TYPE[organizationType] || [];
}

/**
 * Format file size to human-readable string
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
