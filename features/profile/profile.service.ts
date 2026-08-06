import { createClient } from "@/lib/supabase/client";
import { prisma } from "@/lib/prisma";
import type { Profile, ProfileUpdate } from "@/features/profile/profile.types";

/**
 * ProfileService
 *
 * Single responsibility: profile data access from Neon database via Prisma.
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
 * Returns null if the user has no profile row yet.
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
 * Fetch a profile by its UUID from Neon database.
 * Returns null if not found.
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: profile.role as Profile["role"],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
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

  // Build update payload
  const payload: { fullName?: string; avatarUrl?: string | null } = {};
  if (update.fullName !== undefined) payload.fullName = update.fullName;
  if (update.avatarUrl !== undefined) payload.avatarUrl = update.avatarUrl;

  if (Object.keys(payload).length === 0) {
    throw new Error("No fields provided for update.");
  }

  try {
    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: payload,
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: profile.role as Profile["role"],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update profile."
    );
  }
}
