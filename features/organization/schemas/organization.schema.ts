/**
 * Organization Validation Schemas
 * 
 * Zod schemas for validating organization data at each step
 * of the wizard and for complete organization submissions.
 * 
 * @module features/organization/schemas
 */

import { z } from "zod";
import { VALIDATION_RULES } from "../constants/organization.constants";
import {
  OrganizationType,
  OrganizationVerificationStatus,
} from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: BASIC INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(
      VALIDATION_RULES.ORG_NAME_MIN_LENGTH,
      `Organization name must be at least ${VALIDATION_RULES.ORG_NAME_MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_RULES.ORG_NAME_MAX_LENGTH,
      `Organization name must not exceed ${VALIDATION_RULES.ORG_NAME_MAX_LENGTH} characters`
    )
    .trim(),

  type: z.nativeEnum(OrganizationType),

  description: z
    .string()
    .min(
      VALIDATION_RULES.DESCRIPTION_MIN_LENGTH,
      `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
      `Description must not exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`
    )
    .trim(),

  website: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),

  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .min(
      VALIDATION_RULES.PHONE_MIN_LENGTH,
      `Phone number must be at least ${VALIDATION_RULES.PHONE_MIN_LENGTH} digits`
    )
    .max(
      VALIDATION_RULES.PHONE_MAX_LENGTH,
      `Phone number must not exceed ${VALIDATION_RULES.PHONE_MAX_LENGTH} digits`
    )
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
    .trim(),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: ADDRESS DETAILS
// ─────────────────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters")
    .trim(),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters")
    .trim(),

  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must not exceed 50 characters")
    .trim(),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must not exceed 50 characters")
    .trim()
    .default("India"),

  postalCode: z
    .string()
    .min(
      VALIDATION_RULES.POSTAL_CODE_MIN_LENGTH,
      `Postal code must be at least ${VALIDATION_RULES.POSTAL_CODE_MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_RULES.POSTAL_CODE_MAX_LENGTH,
      `Postal code must not exceed ${VALIDATION_RULES.POSTAL_CODE_MAX_LENGTH} characters`
    )
    .regex(/^[A-Z0-9\s\-]+$/i, "Please enter a valid postal code")
    .trim(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: LEGAL INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export const legalInfoSchema = z.object({
  registrationNo: z
    .string()
    .min(
      VALIDATION_RULES.REGISTRATION_NO_MIN_LENGTH,
      `Registration number must be at least ${VALIDATION_RULES.REGISTRATION_NO_MIN_LENGTH} characters`
    )
    .max(
      VALIDATION_RULES.REGISTRATION_NO_MAX_LENGTH,
      `Registration number must not exceed ${VALIDATION_RULES.REGISTRATION_NO_MAX_LENGTH} characters`
    )
    .trim(),

  panNumber: z
    .string()
    .length(
      VALIDATION_RULES.PAN_LENGTH,
      `PAN number must be exactly ${VALIDATION_RULES.PAN_LENGTH} characters`
    )
    .regex(
      VALIDATION_RULES.PAN_PATTERN,
      "Please enter a valid PAN number (e.g., ABCDE1234F)"
    )
    .toUpperCase()
    .trim(),

  gstNumber: z
    .string()
    .length(
      VALIDATION_RULES.GST_LENGTH,
      `GST number must be exactly ${VALIDATION_RULES.GST_LENGTH} characters`
    )
    .regex(
      VALIDATION_RULES.GST_PATTERN,
      "Please enter a valid GST number"
    )
    .toUpperCase()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),

  taxExemptionNo: z
    .string()
    .min(5, "Tax exemption number must be at least 5 characters")
    .max(50, "Tax exemption number must not exceed 50 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type LegalInfoFormData = z.infer<typeof legalInfoSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: BANK DETAILS
// ─────────────────────────────────────────────────────────────────────────────

export const bankDetailsSchema = z.object({
  accountHolder: z
    .string()
    .min(3, "Account holder name must be at least 3 characters")
    .max(100, "Account holder name must not exceed 100 characters")
    .trim(),

  accountNumber: z
    .string()
    .min(
      VALIDATION_RULES.ACCOUNT_NUMBER_MIN_LENGTH,
      `Account number must be at least ${VALIDATION_RULES.ACCOUNT_NUMBER_MIN_LENGTH} digits`
    )
    .max(
      VALIDATION_RULES.ACCOUNT_NUMBER_MAX_LENGTH,
      `Account number must not exceed ${VALIDATION_RULES.ACCOUNT_NUMBER_MAX_LENGTH} digits`
    )
    .regex(/^[0-9]+$/, "Account number must contain only digits")
    .trim(),

  bankName: z
    .string()
    .min(3, "Bank name must be at least 3 characters")
    .max(100, "Bank name must not exceed 100 characters")
    .trim(),

  ifscCode: z
    .string()
    .length(
      VALIDATION_RULES.IFSC_LENGTH,
      `IFSC code must be exactly ${VALIDATION_RULES.IFSC_LENGTH} characters`
    )
    .regex(
      VALIDATION_RULES.IFSC_PATTERN,
      "Please enter a valid IFSC code (e.g., SBIN0001234)"
    )
    .toUpperCase()
    .trim(),

  branchName: z
    .string()
    .min(3, "Branch name must be at least 3 characters")
    .max(100, "Branch name must not exceed 100 characters")
    .trim(),
});

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: BRANDING (OPTIONAL)
// ─────────────────────────────────────────────────────────────────────────────

export const brandingSchema = z.object({
  logoUrl: z
    .string()
    .url("Please enter a valid logo URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),

  coverImageUrl: z
    .string()
    .url("Please enter a valid cover image URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type BrandingFormData = z.infer<typeof brandingSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE ORGANIZATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete organization schema (all steps combined)
 * Used for final validation before submission
 */
export const completeOrganizationSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  ...basicInfoSchema.shape,
  ...addressSchema.shape,
  ...legalInfoSchema.shape,
  ...bankDetailsSchema.shape,
  ...brandingSchema.shape,
});

export type CompleteOrganizationFormData = z.infer<
  typeof completeOrganizationSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// PARTIAL ORGANIZATION SCHEMA (DRAFT)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Partial organization schema for draft saving
 * All fields optional except profileId
 */
export const partialOrganizationSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  name: z.string().trim().optional(),
  type: z.nativeEnum(OrganizationType).optional(),
  description: z.string().trim().optional(),
  website: z.string().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  registrationNo: z.string().trim().optional(),
  panNumber: z.string().toUpperCase().trim().optional(),
  gstNumber: z.string().toUpperCase().trim().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  taxExemptionNo: z.string().trim().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  accountHolder: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  ifscCode: z.string().toUpperCase().trim().optional(),
  branchName: z.string().trim().optional(),
  logoUrl: z.string().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  coverImageUrl: z.string().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
});

export type PartialOrganizationFormData = z.infer<
  typeof partialOrganizationSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ORGANIZATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Organization update schema
 * All fields optional except id
 */
export const updateOrganizationSchema = z.object({
  id: z.string().uuid("Invalid organization ID"),
  name: z.string().trim().optional(),
  type: z.nativeEnum(OrganizationType).optional(),
  description: z.string().trim().optional(),
  website: z.string().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  registrationNo: z.string().trim().optional(),
  panNumber: z.string().toUpperCase().trim().optional(),
  gstNumber: z.string().toUpperCase().trim().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  taxExemptionNo: z.string().trim().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  accountHolder: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  ifscCode: z.string().toUpperCase().trim().optional(),
  branchName: z.string().trim().optional(),
  logoUrl: z.string().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  coverImageUrl: z.string().optional().or(z.literal("")).transform((val) => (val === "" ? null : val)),
});

export type UpdateOrganizationFormData = z.infer<
  typeof updateOrganizationSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION SCHEMAS (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin approve schema.
 *
 * Required: organizationId.
 * Optional: adminNotes.
 */
export const approveOrganizationSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  adminNotes: z
    .string()
    .max(1000, "Admin notes must not exceed 1000 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type ApproveOrganizationFormData = z.infer<
  typeof approveOrganizationSchema
>;

/**
 * Admin reject schema.
 *
 * Required: organizationId and rejectionReason.
 */
export const rejectOrganizationSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(2000, "Rejection reason must not exceed 2000 characters")
    .trim(),
  adminNotes: z
    .string()
    .max(1000, "Admin notes must not exceed 1000 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type RejectOrganizationFormData = z.infer<
  typeof rejectOrganizationSchema
>;

/**
 * Admin request-changes schema.
 *
 * Required: organizationId and changeRequestNotes.
 */
export const requestChangesOrganizationSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  changeRequestNotes: z
    .string()
    .min(10, "Change request notes must be at least 10 characters")
    .max(2000, "Change request notes must not exceed 2000 characters")
    .trim(),
  adminNotes: z
    .string()
    .max(1000, "Admin notes must not exceed 1000 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type RequestChangesOrganizationFormData = z.infer<
  typeof requestChangesOrganizationSchema
>;

/**
 * Organization verification review schema
 */
export const verificationReviewSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  verificationStatus: z.nativeEnum(OrganizationVerificationStatus),
  adminNotes: z
    .string()
    .max(1000, "Admin notes must not exceed 1000 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
});

export type VerificationReviewFormData = z.infer<
  typeof verificationReviewSchema
>;
