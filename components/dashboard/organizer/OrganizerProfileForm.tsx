"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface OrganizerProfileFormProps {
  userId: string;
  initialData: {
    fullName: string;
    avatarUrl: string | null;
  };
}

export default function OrganizerProfileForm({
  userId,
  initialData,
}: OrganizerProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Organization-specific fields (stored locally for now — DB extension in future sprint)
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [pan, setPan] = useState("");
  const [gst, setGst] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Update display name via profile API
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: orgName || initialData.fullName }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const SECTIONS = [
    {
      title: "Organization Details",
      fields: (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="Your organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="orgDescription">Description</Label>
            <textarea
              id="orgDescription"
              rows={3}
              placeholder="Describe your organization's mission and activities…"
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourorg.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Legal & Registration",
      fields: (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="regNumber">Registration Number</Label>
            <Input
              id="regNumber"
              placeholder="e.g. U80904MH2020NPL123456"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              placeholder="e.g. AAAPL1234C"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gst">GST Number <span className="text-slate-400">(optional)</span></Label>
            <Input
              id="gst"
              placeholder="e.g. 27AAAPL1234C1Z5"
              value={gst}
              onChange={(e) => setGst(e.target.value.toUpperCase())}
              maxLength={15}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Bank Details",
      description: "Required for fund withdrawals. All information is encrypted.",
      fields: (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="e.g. State Bank of India"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="password"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              placeholder="e.g. SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              maxLength={11}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {SECTIONS.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
            {section.description && (
              <p className="mt-0.5 text-sm text-slate-500">{section.description}</p>
            )}
          </div>
          {section.fields}
        </section>
      ))}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile saved successfully.
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Organization Profile"}
        </Button>
      </div>
    </form>
  );
}
