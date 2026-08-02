"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background px-4 py-8">

      {/* ── Top-left logo — click goes back to home ── */}
      <div className="absolute left-6 top-6">
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-none"
          aria-label="Go to homepage"
        >
          {/* Golf flag icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition group-hover:bg-emerald-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {/* Golf flag on a pin */}
              <line x1="6" y1="3" x2="6" y2="21" />
              <path d="M6 3 L18 8 L6 13" fill="currentColor" stroke="none" />
            </svg>
          </div>

          {/* Brand name */}
          <span className="text-base font-bold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
            Golf Charity
          </span>
        </Link>
      </div>

      {/* ── Centered card ── */}
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </CardHeader>

          <CardContent>{children}</CardContent>
        </Card>
      </div>

    </div>
  );
}
