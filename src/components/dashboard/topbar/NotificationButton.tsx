"use client";

import { Bell } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden md:flex h-11 w-11"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
    </Button>
  );
}