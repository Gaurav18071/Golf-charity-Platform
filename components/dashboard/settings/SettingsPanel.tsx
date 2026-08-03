"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ActiveTab = "profile" | "password" | "notifications";

interface SettingsPanelProps {
  initialName: string;
  email: string;
}

export default function SettingsPanel({ initialName, email }: SettingsPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<ActiveTab>("profile");

  // Profile state
  const [fullName, setFullName] = useState(initialName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // Notification state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [donationAlerts, setDonationAlerts] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setProfileSuccess(true);
      router.refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      {/* Sidebar tabs */}
      <nav className="xl:col-span-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                "w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="xl:col-span-3">
        {/* Profile tab */}
        {tab === "profile" && (
          <form onSubmit={handleProfileSave} className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-900">Profile Settings</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} suppressHydrationWarning />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={email} readOnly className="cursor-not-allowed bg-slate-50 opacity-70" suppressHydrationWarning />
                  <p className="text-xs text-slate-400">Email changes require contacting support.</p>
                </div>
              </div>
            </section>
            {profileSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Profile updated.
              </div>
            )}
            {profileError && <Alert variant="destructive"><AlertDescription>{profileError}</AlertDescription></Alert>}
            <div className="flex justify-end rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Button type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save Profile"}</Button>
            </div>
          </form>
        )}

        {/* Password tab */}
        {tab === "password" && (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-slate-900">Change Password</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </section>
            {pwSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Password changed successfully.
              </div>
            )}
            {pwError && <Alert variant="destructive"><AlertDescription>{pwError}</AlertDescription></Alert>}
            <div className="flex justify-end rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Button type="submit" disabled={pwSaving}>{pwSaving ? "Updating…" : "Update Password"}</Button>
            </div>
          </form>
        )}

        {/* Notifications tab */}
        {tab === "notifications" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900">Notification Preferences</h2>
            {[
              { id: "email", label: "Email Notifications", desc: "Receive updates via email", value: emailNotifs, set: setEmailNotifs },
              { id: "donation", label: "Donation Alerts", desc: "Notify me when a donation is made", value: donationAlerts, set: setDonationAlerts },
              { id: "campaign", label: "Campaign Updates", desc: "Notify me of campaign status changes", value: campaignUpdates, set: setCampaignUpdates },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => item.set(!item.value)}
                  className={[
                    "relative h-6 w-11 rounded-full transition-colors focus:outline-none",
                    item.value ? "bg-emerald-600" : "bg-slate-200",
                  ].join(" ")}
                  aria-pressed={item.value}
                >
                  <span className={[
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    item.value ? "translate-x-5" : "translate-x-0.5",
                  ].join(" ")} />
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
