import { createClient } from "@/src/lib/supabase/client";

/**
 * Format raw Supabase authentication error messages into clean user-friendly text.
 */
export function formatAuthError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message.includes("Invalid login credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("User already registered")) {
      return "An account with this email address already exists. Please log in.";
    }
    if (message.includes("Password should be at least")) {
      return "Password must be at least 6 characters long.";
    }
    if (message.includes("Rate limit exceeded")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    return message;
  }
  return "An unexpected authentication error occurred. Please try again.";
}

/**
 * Register a new user
 */
export async function signUp(
  fullName: string,
  email: string,
  password: string
) {
  const supabase = createClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/login`,
    },
  });

  if (error) {
    throw new Error(formatAuthError(error));
  }

  return data;
}

/**
 * Login existing user
 */
export async function signIn(
  email: string,
  password: string
) {
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

  if (error) {
    return null;
  }

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

  if (error) {
    return null;
  }

  return session;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    throw new Error(formatAuthError(error));
  }

  return data;
}

/**
 * Update user password after reset redirect
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(formatAuthError(error));
  }

  return data;
}