/**
 * Profile Feature - Public API
 * 
 * Central export point for profile feature.
 * Import from this file instead of individual modules.
 * 
 * @module features/profile
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type { Profile, ProfileUpdate } from "./profile.types";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export {
  getCurrentProfile,
  getProfileById,
  updateCurrentProfile,
} from "./profile.service";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

export { ProfileProvider, useProfileContext } from "./context/ProfileContext";

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export { useProfile } from "./hooks/useProfile";

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export { updateProfileAction } from "./actions/profile.actions";
