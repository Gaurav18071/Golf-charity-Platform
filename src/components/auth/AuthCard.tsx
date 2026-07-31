"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </CardHeader>

        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}