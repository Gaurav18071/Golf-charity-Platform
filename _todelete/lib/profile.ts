import { createClient } from "@/lib/supabase/client";
import type { SelectableRole } from "@/components/auth/RoleSelector";

/**
 * updateProfileRole
 *
 * Updates the `role` column on the current user's profile row.
 * Called immediately after a successful signUp when the user
 * has chosen a role during registration.
 *
 * Responsibilities:
 * - Update role in public.profiles
 * - Nothing else — no auth logic, no UI logic
 *
 * Why this file exists at lib/ rather than src/features/:
 * - Root-level components (components/auth/) use @/ aliases
 * - src/features/ is only reachable via @/src/ — not accessible cleanly
 *   from root lib/ callers without cross-tree imports
 *
 * @param userId  - The Supabase auth user UUID
 * @param role    - The role chosen at signup
 */
export async function updateProfileRole(
  userId: string,
  role: SelectableRole
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    // Non-fatal — profile row may not exist yet if DB trigger is slow.
    // Log and continue: the user can still sign in, role defaults to DONOR.
    console.warn(
      `[profile] Could not update role for user ${userId}:`,
      error.message
    );
  }
}
