import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import OrganizerProfileForm from "@/components/dashboard/organizer/OrganizerProfileForm";
import { getOrganizationByProfileId } from "@/features/organization/services/organization.service";
import { OrganizationDetailsView } from "@/components/dashboard/organizer/OrganizationDetailsView";

export const dynamic = "force-dynamic";

export default async function OrganizerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await import("@/lib/prisma").then(({ prisma }) =>
    prisma.profile.findUnique({ where: { id: user.id } })
  );

  const role = profile?.role ?? (user.user_metadata?.role as string) ?? "DONOR";

  if (!["ORGANIZER", "PENDING_ORGANIZER", "ADMIN"].includes(role)) {
    redirect("/dashboard");
  }

  const organization = await getOrganizationByProfileId(user.id, true);

  if (organization) {
    return <OrganizationDetailsView organization={organization as any} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete your organization details to speed up the verification process.
          </p>
        </div>
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            role === "ORGANIZER"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          ].join(" ")}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {role === "ORGANIZER" ? "Verified Organizer" : "Pending Verification"}
        </span>
      </div>

      <OrganizerProfileForm
        userId={user.id}
        initialData={{
          fullName: profile?.fullName ?? user.user_metadata?.full_name ?? "",
          avatarUrl: profile?.avatarUrl ?? null,
        }}
      />
    </div>
  );
}
