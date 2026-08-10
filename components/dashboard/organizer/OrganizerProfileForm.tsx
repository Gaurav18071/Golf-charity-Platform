"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { createOrganizationDraftAction } from "@/features/organization/actions/organization.actions";
import { OrganizationType } from "@prisma/client";

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

  const [orgName, setOrgName] = useState(initialData.fullName || "");
  const [type, setType] = useState<OrganizationType>("NGO");
  const [orgDescription, setOrgDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [pan, setPan] = useState("");
  const [gst, setGst] = useState("");
  const [taxExemptionNo, setTaxExemptionNo] = useState("");

  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branchName, setBranchName] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await createOrganizationDraftAction({
        name: orgName,
        type,
        description: orgDescription,
        email: email || undefined,
        phone: phone || undefined,
        website: website || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || "India",
        postalCode: postalCode || undefined,
        registrationNo: registrationNumber || undefined,
        panNumber: pan || undefined,
        gstNumber: gst || undefined,
        taxExemptionNo: taxExemptionNo || undefined,
        accountHolder: accountHolder || orgName || undefined,
        accountNumber: accountNumber || undefined,
        bankName: bankName || undefined,
        ifscCode: ifscCode || undefined,
        branchName: branchName || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to create organization profile.");
        return;
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
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Basic Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">Organization Details</h2>
          <p className="mt-0.5 text-sm text-slate-500">Provide basic information about your non-profit or golf association.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="orgName">Organization Name *</Label>
            <Input
              id="orgName"
              required
              placeholder="e.g. Hope Golf Foundation"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Organization Type *</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as OrganizationType)}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="NGO">NGO</option>
              <option value="TRUST">Trust</option>
              <option value="SECTION_8">Section 8 Company</option>
              <option value="CLUB">Golf Club / Association</option>
              <option value="OTHER">Other Charity</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="org@example.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              required
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website <span className="text-slate-400">(optional)</span></Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourorg.org"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="orgDescription">Description *</Label>
            <textarea
              id="orgDescription"
              rows={3}
              required
              placeholder="Describe your organization's mission and charity golf events…"
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
          </div>
        </div>
      </section>

      {/* 2. Address Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">Address Details</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              required
              placeholder="123 Main Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              required
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              required
              placeholder="Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              required
              placeholder="400001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 3. Legal & Registration */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">Legal & Registration</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="regNumber">Registration Number *</Label>
            <Input
              id="regNumber"
              required
              placeholder="e.g. REG-123456"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pan">PAN Number *</Label>
            <Input
              id="pan"
              required
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
          <div className="space-y-1.5">
            <Label htmlFor="taxExemptionNo">80G Tax Exemption No. <span className="text-slate-400">(optional)</span></Label>
            <Input
              id="taxExemptionNo"
              placeholder="e.g. 80G/2024/001"
              value={taxExemptionNo}
              onChange={(e) => setTaxExemptionNo(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 4. Bank Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">Bank Details</h2>
          <p className="mt-0.5 text-sm text-slate-500">Required for receiving campaign payout disbursements.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="accountHolder">Account Holder Name *</Label>
            <Input
              id="accountHolder"
              required
              placeholder="Account holder name"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              required
              placeholder="e.g. State Bank of India"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              required
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifscCode">IFSC Code *</Label>
            <Input
              id="ifscCode"
              required
              placeholder="e.g. SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              maxLength={11}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="branchName">Branch Name *</Label>
            <Input
              id="branchName"
              required
              placeholder="e.g. Main Branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
        </div>
      </section>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Organization profile created successfully!
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
          {saving ? "Saving Organization Profile…" : "Save Organization Profile"}
        </Button>
      </div>
    </form>
  );
}
