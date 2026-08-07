"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentProfileAction } from "@/features/profile/actions/profile.actions";
import type { Profile } from "@/features/profile/profile.types";

/**
 * UseProfileResult
 *
 * The shape returned by useProfile.
 * Consumers only receive what they need — no service internals leak out.
 */
export interface UseProfileResult {
  /** The current user's profile. Null until loaded or if unauthenticated. */
  profile: Profile | null;

  /** True while the initial profile fetch is in progress. */
  loading: boolean;

  /** Error message if the fetch failed. Null otherwise. */
  error: string | null;

  /**
   * Manually re-fetch the profile from Supabase.
   * Use after a profile update to reflect the latest data.
   */
  refresh: () => Promise<void>;
}

/**
 * useProfile
 *
 * Loads the current user's profile from Supabase.
 *
 * Responsibilities:
 *   - Fetch profile on mount
 *   - Track loading state
 *   - Track error state
 *   - Expose refresh() for manual re-fetch
 *
 * No UI logic. No permission logic. No role logic.
 * This hook is a pure data-loading primitive.
 *
 * Usage:
 *   const { profile, loading, error, refresh } = useProfile();
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCurrentProfileAction();
      setProfile(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load profile.";
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refresh: fetchProfile };
}
