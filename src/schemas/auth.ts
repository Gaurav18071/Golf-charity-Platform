import { z } from "zod";
import {
  FULL_NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/src/constants/auth";

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(
        FULL_NAME_MIN_LENGTH,
        `Full name must be at least ${FULL_NAME_MIN_LENGTH} characters`
      ),

    email: z.email("Please enter a valid email address"),

    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });