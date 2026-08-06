/**
 * PERMISSIONS
 *
 * Single source of truth for all permission strings.
 * No permission string should be hardcoded anywhere else in the codebase.
 *
 * Usage:
 *   import { PERMISSIONS } from "@/src/constants/permissions";
 *   hasPermission(profile, PERMISSIONS.CREATE_CAMPAIGN);
 */

export const PERMISSIONS = {
  // ── Campaigns ──────────────────────────────────────────────────────────────
  VIEW_CAMPAIGNS:    "VIEW_CAMPAIGNS",
  CREATE_CAMPAIGN:   "CREATE_CAMPAIGN",
  EDIT_CAMPAIGN:     "EDIT_CAMPAIGN",
  DELETE_CAMPAIGN:   "DELETE_CAMPAIGN",

  // ── Donations ──────────────────────────────────────────────────────────────
  DONATE:            "DONATE",
  VIEW_DONATIONS:    "VIEW_DONATIONS",

  // ── Admin ──────────────────────────────────────────────────────────────────
  VIEW_ADMIN_DASHBOARD: "VIEW_ADMIN_DASHBOARD",
  MANAGE_USERS:         "MANAGE_USERS",
  APPROVE_CAMPAIGNS:    "APPROVE_CAMPAIGNS",

  // ── Profile ────────────────────────────────────────────────────────────────
  EDIT_PROFILE:      "EDIT_PROFILE",
} as const;

/**
 * Permission
 *
 * TypeScript type derived from PERMISSIONS constant.
 * Use this anywhere a permission value is expected.
 */
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];




