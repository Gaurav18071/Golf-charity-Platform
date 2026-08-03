"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { LogOut, AlertTriangle } from "lucide-react";
import { signOut } from "@/src/lib/auth";
import { cn } from "@/src/lib/utils";

interface LogoutConfirmDialogProps {
  /**
   * Controlled mode — pass open + onOpenChange (e.g. from UserMenu dropdown).
   * If not provided, the dialog manages its own open state (uncontrolled).
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Uncontrolled mode — pass a trigger element that opens the dialog on click.
   * Used by SidebarFooter.
   */
  trigger?: React.ReactNode;
}

/**
 * LogoutConfirmDialog
 *
 * Reusable logout confirmation modal.
 * Supports two usage modes:
 *
 * 1. Controlled (UserMenu):
 *    <LogoutConfirmDialog open={open} onOpenChange={setOpen} />
 *
 * 2. Uncontrolled with trigger (SidebarFooter):
 *    <LogoutConfirmDialog trigger={<button>Logout</button>} />
 */
export function LogoutConfirmDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: LogoutConfirmDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use controlled state if provided, otherwise internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await signOut();
      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {/* Trigger — only rendered in uncontrolled mode */}
      {trigger && (
        <Dialog.Trigger
          className="contents"
          render={<span />}
        >
          <span className="contents">{trigger}</span>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "transition-opacity duration-200",
            "data-starting-style:opacity-0 data-ending-style:opacity-0"
          )}
        />

        {/* Modal panel */}
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-sm",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-slate-200 bg-white p-6 shadow-xl",
            "transition-all duration-200",
            "data-starting-style:opacity-0 data-starting-style:scale-95",
            "data-ending-style:opacity-0 data-ending-style:scale-95"
          )}
        >
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          {/* Title */}
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            Sign out of Golf Charity?
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-slate-500">
            You&apos;ll need to sign in again to access your dashboard, manage
            campaigns, and view your donations.
          </Dialog.Description>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {/* Cancel */}
            <Dialog.Close
              disabled={loading}
              className={cn(
                "inline-flex items-center justify-center rounded-xl",
                "border border-slate-200 bg-white px-4 py-2.5",
                "text-sm font-semibold text-slate-700",
                "transition hover:bg-slate-50",
                "focus:outline-none focus:ring-2 focus:ring-slate-300",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              Cancel
            </Dialog.Close>

            {/* Confirm */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl",
                "bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm",
                "transition hover:bg-red-700",
                "focus:outline-none focus:ring-2 focus:ring-red-500",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Signing out…" : "Yes, sign out"}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
