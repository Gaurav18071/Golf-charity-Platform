"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { updateUserRoleAction } from "@/app/actions/admin.actions";
import { Loader2, Check } from "lucide-react";

interface UserRoleSelectProps {
  userId: string;
  initialRole: UserRole;
  isSelf: boolean;
}

export function UserRoleSelect({
  userId,
  initialRole,
  isSelf,
}: UserRoleSelectProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    if (newRole === role) return;

    if (isSelf && newRole !== "ADMIN") {
      alert("You cannot remove your own administrative rights.");
      return;
    }

    try {
      setLoading(true);
      setToast(null);

      const res = await updateUserRoleAction(userId, newRole);

      if (!res.success) {
        setToast({ type: "error", msg: res.error || "Failed to update role" });
      } else {
        setRole(newRole);
        setToast({ type: "success", msg: `Role changed to ${newRole}` });
      }
    } catch (err) {
      setToast({
        type: "error",
        msg: err instanceof Error ? err.message : "Error updating role",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const ROLE_COLORS: Record<UserRole, string> = {
    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
    ORGANIZER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING_ORGANIZER: "bg-amber-50 text-amber-700 border-amber-200",
    DONOR: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div className="relative inline-block">
        <select
          value={role}
          onChange={handleRoleChange}
          disabled={loading || isSelf}
          title={isSelf ? "Current logged-in administrator" : "Change user role"}
          className={`text-xs font-bold rounded-lg border px-2.5 py-1 appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
            ROLE_COLORS[role] || "bg-slate-100 text-slate-700 border-slate-200"
          } ${loading || isSelf ? "cursor-not-allowed opacity-90" : "hover:border-slate-400"}`}
        >
          <option value="DONOR">DONOR</option>
          <option value="ORGANIZER">ORGANIZER</option>
          <option value="PENDING_ORGANIZER">PENDING_ORGANIZER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
        ) : (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-400">
            ▼
          </span>
        )}
      </div>

      {toast && (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
            toast.type === "success"
              ? "bg-emerald-100 text-emerald-800 animate-in fade-in"
              : "bg-red-100 text-red-800 animate-in fade-in"
          }`}
        >
          {toast.msg}
        </span>
      )}
    </div>
  );
}
