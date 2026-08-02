import { ROLES } from "@/src/constants/roles";
import { PERMISSIONS, type Permission } from "@/src/constants/permissions";
import type { Profile } from "@/src/features/profile/profile.types";

/**
 * ROLE_PERMISSIONS
 *
 * Defines exactly which permissions each role has.
 * This is the single place where role-to-permission mapping lives.
 *
 * Rules:
 * - No role strings outside this file — always use ROLES constant
 * - No permission strings outside this file — always use PERMISSIONS constant
 * - Adding a new permission only requires updating this map
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_CAMPAIGNS,
    PERMISSIONS.CREATE_CAMPAIGN,
    PERMISSIONS.EDIT_CAMPAIGN,
    PERMISSIONS.DELETE_CAMPAIGN,
    PERMISSIONS.DONATE,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.APPROVE_CAMPAIGNS,
    PERMISSIONS.EDIT_PROFILE,
  ],

  [ROLES.ORGANIZER]: [
    PERMISSIONS.VIEW_CAMPAIGNS,
    PERMISSIONS.CREATE_CAMPAIGN,
    PERMISSIONS.EDIT_CAMPAIGN,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.EDIT_PROFILE,
  ],

  [ROLES.PENDING_ORGANIZER]: [
    PERMISSIONS.VIEW_CAMPAIGNS,
    PERMISSIONS.EDIT_PROFILE,
  ],

  [ROLES.DONOR]: [
    PERMISSIONS.VIEW_CAMPAIGNS,
    PERMISSIONS.DONATE,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.EDIT_PROFILE,
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Role guards
// Pure functions — accept a Profile, return a boolean.
// No role strings appear in calling code — consumers use these helpers only.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the profile belongs to an ADMIN.
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === ROLES.ADMIN;
}

/**
 * Returns true if the profile belongs to a DONOR.
 */
export function isDonor(profile: Profile | null): boolean {
  return profile?.role === ROLES.DONOR;
}

/**
 * Returns true if the profile belongs to a verified ORGANIZER.
 */
export function isOrganizer(profile: Profile | null): boolean {
  return profile?.role === ROLES.ORGANIZER;
}

/**
 * Returns true if the profile is a PENDING_ORGANIZER
 * (submitted organizer request, awaiting approval).
 */
export function isPendingOrganizer(profile: Profile | null): boolean {
  return profile?.role === ROLES.PENDING_ORGANIZER;
}

/**
 * Returns true if the profile is any kind of organizer
 * (verified or pending). Useful for showing organizer-related UI
 * before final approval is granted.
 */
export function isAnyOrganizer(profile: Profile | null): boolean {
  return isOrganizer(profile) || isPendingOrganizer(profile);
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * hasPermission
 *
 * Returns true if the given profile's role includes the requested permission.
 *
 * Usage:
 *   if (hasPermission(profile, PERMISSIONS.CREATE_CAMPAIGN)) { ... }
 *
 * Returns false if profile is null (unauthenticated).
 */
export function hasPermission(
  profile: Profile | null,
  permission: Permission
): boolean {
  if (!profile) return false;

  const allowed = ROLE_PERMISSIONS[profile.role];

  if (!allowed) return false;

  return allowed.includes(permission);
}

/**
 * getPermissions
 *
 * Returns the full list of permissions for a given profile's role.
 * Returns an empty array if profile is null.
 *
 * Useful for rendering permission-aware UI (e.g. conditional nav items).
 */
export function getPermissions(profile: Profile | null): Permission[] {
  if (!profile) return [];
  return ROLE_PERMISSIONS[profile.role] ?? [];
}
