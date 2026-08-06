import { ROLES } from "@/constants/roles";

/**
 * UserRole
 *
 * Derived directly from the ROLES constant — single source of truth.
 * All future code that references a user role must use this type.
 * Never use raw strings like "ADMIN" or "DONOR" anywhere in the codebase.
 */
export type UserRole = (typeof ROLES)[keyof typeof ROLES];
