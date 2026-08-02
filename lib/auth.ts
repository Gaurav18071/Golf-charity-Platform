import { createClient } from "@/lib/supabase/client";
import { updateProfileRole } from "@/lib/profile";
import type { SelectableRole } from "@/components/auth/RoleSelector";

/**
 * Format Supabase error messages into clean user-friendly text.
 */
export function formatAuthError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message.includes("Invalid login credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (
      message.includes("User already registered") ||
      message.includes("user_already_exists") ||
      message.includes("already been registered")
    ) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (message.includes("Password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (message.includes("Rate limit exceeded")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    return message;
  }
  return "An unexpected error occurred. Please try again.";
}

/**
 * Register a new user.
 *
 * @param fullName     - Display name stored in auth metadata + profile
 * @param email        - User's email address
 * @param password     - User's chosen password
 * @param role         - Role selected at signup (default: DONOR)
 *                       After auth creation, profile role is updated via
 *                       lib/profile.ts. Auth remains responsible only for
 *                       the Supabase auth.signUp call itself.
 */
export async function signUp(
  fullName: string,
  email: string,
  password: string,
  role: SelectableRole = "DONOR"
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: "http://localhost:3000/login",
    },
  });

  if (error) {
    throw new Error(formatAuthError(error));
  }

  // Supabase silently succeeds when email confirmation is OFF and the user
  // already exists — identities array will be empty in that case.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error(
      "An account with this email already exists. Please sign in instead."
    );
  }

  // Update the profile role after successful auth creation.
  // Delegated to lib/profile.ts — auth.ts stays auth-only.
  // Non-blocking: if profile trigger hasn't run yet, updateProfileRole
  // handles the failure gracefully with a console.warn.
  if (data.user) {
    await updateProfileRole(data.user.id, role);
  }

  return data;
}

/**
 * Login existing user
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(formatAuthError(error));
  }

  return data;
}

/**
 * Logout current user
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) return null;
  return session;
}
