"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

interface SettingsFormProps {
  initialData: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    verificationStatus: string;
  };
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.fullName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Update Supabase auth metadata
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      // Update profile via API route
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });

      if (!res.ok) {
        const { error: apiError } = await res.json() as { error: string };
        throw new Error(apiError ?? "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
    >
      <h2 className="text-base font-semibold text-slate-900">Profile Settings</h2>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-slate-700"
        >
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          placeholder="Your full name"
        />
      </div>

      {/* Email — read-only */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={initialData.email}
          readOnly
          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400">
          Email cannot be changed here. Contact support if needed.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
