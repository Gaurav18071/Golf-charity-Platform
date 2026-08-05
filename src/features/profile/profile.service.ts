import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileUpdate } from "@/src/features/profile/profile.types";

/**
 * ProfileService
 *
 * Single responsibility: profile data access against public.profiles.
 *
 * Rules:
 * - No auth logic here (belongs in lib/auth.ts)
 * - No role/permission logic here (belongs in features/auth/permissions.ts)
 * - No UI logic here
 * - All functions are pure async — no side effects beyond DB reads/writes
 */

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the profile for the currently authenticated user.
 * Returns null if the user has no profile row yet (trigger may not have run).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getProfileById(user.id);
}

/**
 * Fetch a profile by its UUID.
 * Returns null if not found.
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, verification_status, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return mapRowToProfile(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the current user's editable profile fields.
 * Only fullName and avatarUrl are allowed — role is managed server-side.
 * Returns the updated profile on success, throws on failure.
 */
export async function updateCurrentProfile(
  update: ProfileUpdate
): Promise<Profile> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  // Map camelCase fields back to snake_case for the DB
  const payload: Record<string, unknown> = {};
  if (update.fullName !== undefined) payload["full_name"] = update.fullName;
  if (update.avatarUrl !== undefined) payload["avatar_url"] = update.avatarUrl;

  if (Object.keys(payload).length === 0) {
    throw new Error("No fields provided for update.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select("id, full_name, avatar_url, role, verification_status, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update profile.");
  }

  return mapRowToProfile(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a raw Supabase row (snake_case) to the Profile domain type (camelCase).
 * Keeps the DB column names isolated to this file only.
 */
function mapRowToProfile(row: {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role as Profile["role"],
    verificationStatus: row.verification_status as Profile["verificationStatus"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
