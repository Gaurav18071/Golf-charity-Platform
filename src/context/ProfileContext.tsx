"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useProfile } from "@/src/hooks/useProfile";
import type { Profile } from "@/src/features/profile/profile.types";

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileContextValue {
  /** The current user's profile. Null until loaded or if unauthenticated. */
  profile: Profile | null;

  /** True while the initial profile fetch is in progress. */
  loading: boolean;

  /** Error message if the fetch failed. Null otherwise. */
  error: string | null;

  /**
   * Manually re-fetch the profile.
   * Call this after a successful profile update to sync UI state.
   */
  refresh: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context creation
// ─────────────────────────────────────────────────────────────────────────────

const ProfileContext = createContext<ProfileContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileProviderProps {
  children: ReactNode;
}

/**
 * ProfileProvider
 *
 * Loads the current user's profile ONCE and shares it across the
 * entire subtree. Prevents duplicate Supabase requests from multiple
 * components each calling useProfile() independently.
 *
 * Wrap the dashboard layout with this provider — not the root layout,
 * since public pages do not need the profile.
 *
 * Usage:
 *   <ProfileProvider>
 *     {children}
 *   </ProfileProvider>
 */
export function ProfileProvider({ children }: ProfileProviderProps) {
  const { profile, loading, error, refresh } = useProfile();

  // Memoize the context value so consumers only re-render when the
  // actual data changes — not on every parent render.
  const value = useMemo<ProfileContextValue>(
    () => ({ profile, loading, error, refresh }),
    [profile, loading, error, refresh]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Consumer hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useProfileContext
 *
 * Consume the global profile context inside any client component
 * that lives within ProfileProvider.
 *
 * Throws a descriptive error if used outside the provider —
 * catches misconfiguration early in development.
 *
 * Usage:
 *   const { profile, loading } = useProfileContext();
 */
export function useProfileContext(): ProfileContextValue {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfileContext must be used within a ProfileProvider. " +
      "Wrap your dashboard layout with <ProfileProvider>."
    );
  }

  return context;
}
