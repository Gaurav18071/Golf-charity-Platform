import { redirect } from "next/navigation";
import { requireAuth } from "@/features/organization/utils/organization-guards";
import { getOrganizationByProfileId } from "@/features/organization/services/organization.service";
import { OrganizationDetailsView } from "@/components/dashboard/organizer/OrganizationDetailsView";
import Link from "next/link";
import { Building2, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizationOverviewPage() {
  const { profile } = await requireAuth();

  if (!["ORGANIZER", "PENDING_ORGANIZER", "ADMIN"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const organization = await getOrganizationByProfileId(profile.id, true);

  if (!organization) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto my-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <Building2 className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          No Organization Registered
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          You haven't set up an organization profile yet. Complete onboarding to create your organization.
        </p>
        <div className="mt-6">
          <Link
            href="/organizer/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" />
            Set Up Organization
          </Link>
        </div>
      </div>
    );
  }

  return <OrganizationDetailsView organization={organization as any} />;
}
