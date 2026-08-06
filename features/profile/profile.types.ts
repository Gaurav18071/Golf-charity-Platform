import { UserRole } from "@/types/role";

/**
 * Profile
 *
 * Represents one row from the profiles table in Neon database.
 * Synced from Supabase Auth user on signup or login.
 *
 * Field names use camelCase to match TypeScript conventions.
 * The database columns use snake_case (handled by Prisma @@map).
 */
export interface Profile {
  /** UUID — matches auth.users.id from Supabase Auth */
  id: string;

  /** Email address from Supabase Auth */
  email: string;

  /** Display name — populated from auth metadata */
  fullName: string;

  /** Optional avatar image URL */
  avatarUrl: string | null;

  /** The user's role on the platform */
  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * ProfileUpdate
 *
 * Fields the user is allowed to change via the profile service.
 * Partial — only include fields being changed.
 * id, email, role are excluded — those are managed server-side.
 */
export type ProfileUpdate = Partial<Pick<Profile, "fullName" | "avatarUrl">>;
