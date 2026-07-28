import { z } from "zod";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth";

export type SignupFormData = z.infer<typeof signupSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

export type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
>;