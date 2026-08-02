"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileFormProps {
  initialData: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.fullName);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Update failed");
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Personal Information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              readOnly
              className="cursor-not-allowed bg-slate-50 opacity-70"
            />
            <p className="text-xs text-slate-400">Email cannot be changed here.</p>
          </div>
        </div>
      </section>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="flex justify-end rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
