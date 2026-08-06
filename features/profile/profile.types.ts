import { UserRole } from "@/types/role";

/**
 * VerificationStatus
 *
 * Mirrors the verification_status enum in the database.
 * Represents how far along an organizer's verification is.
 */
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

/**
 * Profile
 *
 * Represents one row from the public.profiles table.
 * Created automatically by a Supabase database trigger on signup.
 * Never create this manually inside application code.
 *
 * Field names use camelCase to match the Prisma model conventions.
 * The database columns use snake_case (handled by Prisma @@map).
 */
export interface Profile {
  /** UUID — matches auth.users.id (set by the DB trigger) */
  id: string;

  /** Display name — populated from auth metadata on trigger */
  fullName: string;

  /** Optional avatar image URL */
  avatarUrl: string | null;

  /** The user's role on the platform */
  role: UserRole;

  /** Organizer verification state — only relevant for ORGANIZER role */
  verificationStatus: VerificationStatus;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * ProfileUpdate
 *
 * Fields the user is allowed to change via the profile service.
 * Partial — only include fields being changed.
 * id, role, verificationStatus are excluded — those are managed server-side.
 */
export type ProfileUpdate = Partial<Pick<Profile, "fullName" | "avatarUrl">>;
