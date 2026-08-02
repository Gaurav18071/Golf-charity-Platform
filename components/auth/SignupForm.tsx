"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { signupSchema } from "@/schemas/auth";
import type { SignupFormData } from "@/types/auth";
import { signUp } from "@/lib/auth";
import { AUTH_PLACEHOLDERS, AUTH_TEXT } from "@/constants/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError("");
      setIsDuplicateEmail(false);

      await signUp(data.fullName, data.email, data.password);

      reset();
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      if (message.toLowerCase().includes("already exists")) {
        setIsDuplicateEmail(true);
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Account created!
          </h3>
          <p className="text-sm text-slate-500">
            Your account is ready. Sign in to get started.
          </p>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          Sign in to your account
        </Button>

        <p className="text-sm text-slate-500">
          Want to create another?{" "}
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="font-medium text-emerald-700 hover:underline"
          >
            Sign up again
          </button>
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder={AUTH_PLACEHOLDERS.fullName}
          disabled={loading}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={AUTH_PLACEHOLDERS.email}
          disabled={loading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder={AUTH_PLACEHOLDERS.password}
          disabled={loading}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder={AUTH_PLACEHOLDERS.password}
          disabled={loading}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Error — with sign-in link if duplicate email */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <span>{error}</span>
            {isDuplicateEmail && (
              <Link
                href={`/login?email=${encodeURIComponent(getValues("email"))}`}
                className="mt-2 block font-semibold underline underline-offset-2 hover:opacity-80"
              >
                Go to Sign In →
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating your account…" : AUTH_TEXT.signupButton}
      </Button>

      {/* Sign in link */}
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-700 hover:underline"
        >
          Sign in
        </Link>
      </p>

    </form>
  );
}
