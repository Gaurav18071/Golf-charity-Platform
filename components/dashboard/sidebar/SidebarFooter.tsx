"use client";

import { LogOut } from "lucide-react";
import { LogoutConfirmDialog } from "@/components/dashboard/shared/LogoutConfirmDialog";

export function SidebarFooter() {
  return (
    <div className="border-t p-4">
      <LogoutConfirmDialog
        trigger={
          <button
            type="button"
            className="
              flex w-full items-center gap-3 rounded-lg
              px-3 py-2 text-sm font-medium
              text-muted-foreground transition-colors
              hover:bg-muted hover:text-foreground
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        }
      />
    </div>
  );
}
