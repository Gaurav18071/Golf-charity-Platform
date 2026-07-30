"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/dashboard/sidebar/SidebarProvider";

export function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11 shrink-0 lg:hidden"
      aria-label="Open navigation menu"
      onClick={toggleSidebar}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}