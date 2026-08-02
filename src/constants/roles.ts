/**
 * ROLES
 *
 * Single source of truth for all user role strings.
 * No role string should be hardcoded anywhere else in the codebase.
 * Import from here — always.
 */

export const ROLES = {
  ADMIN: "ADMIN",
  DONOR: "DONOR",
  ORGANIZER: "ORGANIZER",
  PENDING_ORGANIZER: "PENDING_ORGANIZER",
} as const;
