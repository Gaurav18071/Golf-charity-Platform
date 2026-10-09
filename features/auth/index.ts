/**
 * Auth Feature - Public API
 * 
 * Central export point for authentication and authorization.
 * Import from this file instead of individual modules.
 * 
 * @module features/auth
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export { ROLES, PERMISSIONS } from "./permissions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type { Permission } from "./permissions";

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORIZATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export {
  isAdmin,
  isDonor,
  isOrganizer,
  isPendingOrganizer,
  isAnyOrganizer,
  hasPermission,
  getPermissions,
} from "./permissions";
