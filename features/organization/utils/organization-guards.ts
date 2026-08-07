/**
 * Organization Authorization Guards
 * 
 * Reusable authorization checks for organization operations.
 * Use these in server actions before calling services.
 * 
 * @module features/organization/utils
 */

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION GUARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get authenticated user from Supabase session
 * 
 * @returns User data with profile
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<{
  userId: string;
  email: string | undefined;
  profile: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Get profile from Neon
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return {
    userId: user.id,
    email: user.email,
    profile,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE GUARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Require user to have specific role
 * 
 * @param allowedRoles - Array of allowed roles
 * @returns User data with profile
 * @throws Error if user doesn't have required role
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{
  userId: string;
  email: string | undefined;
  profile: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}> {
  const auth = await requireAuth();

  if (!allowedRoles.includes(auth.profile.role)) {
    throw new Error(
      `Forbidden. Required roles: ${allowedRoles.join(", ")}. Current role: ${auth.profile.role}`
    );
  }

  return auth;
}

/**
 * Require user to be DONOR
 */
export async function requireDonor() {
  return await requireRole(["DONOR"]);
}

/**
 * Require user to be PENDING_ORGANIZER
 */
export async function requirePendingOrganizer() {
  return await requireRole(["PENDING_ORGANIZER"]);
}

/**
 * Require user to be PENDING_ORGANIZER or ORGANIZER
 */
export async function requireOrganizerOrPending() {
  return await requireRole(["PENDING_ORGANIZER", "ORGANIZER"]);
}

/**
 * Require user to be ORGANIZER
 */
export async function requireOrganizer() {
  return await requireRole(["ORGANIZER"]);
}

/**
 * Require user to be ADMIN
 */
export async function requireAdmin() {
  return await requireRole(["ADMIN"]);
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION OWNERSHIP GUARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify user owns the organization
 * 
 * @param organizationId - Organization UUID
 * @param profileId - Profile UUID
 * @returns True if user owns organization
 * @throws Error if not owner or organization doesn't exist
 */
export async function requireOrganizationOwnership(
  organizationId: string,
  profileId: string
): Promise<boolean> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { profileId: true },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (organization.profileId !== profileId) {
    throw new Error("You do not own this organization");
  }

  return true;
}

/**
 * Verify user owns the organization or is admin
 * 
 * @param organizationId - Organization UUID
 * @param profileId - Profile UUID
 * @param userRole - User's role
 * @returns True if authorized
 */
export async function requireOrganizationOwnershipOrAdmin(
  organizationId: string,
  profileId: string,
  userRole: UserRole
): Promise<boolean> {
  // Admins can access any organization
  if (userRole === "ADMIN") {
    return true;
  }

  // Otherwise check ownership
  return await requireOrganizationOwnership(organizationId, profileId);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT GUARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify user owns the document's organization
 * 
 * @param documentId - Document UUID
 * @param profileId - Profile UUID
 * @returns True if authorized
 * @throws Error if not authorized or document doesn't exist
 */
export async function requireDocumentOwnership(
  documentId: string,
  profileId: string
): Promise<boolean> {
  const document = await prisma.organizationDocument.findUnique({
    where: { id: documentId },
    select: {
      organization: {
        select: { profileId: true },
      },
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.organization.profileId !== profileId) {
    throw new Error("You do not own this document");
  }

  return true;
}
