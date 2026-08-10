import { redirect } from "next/navigation";
import { requireAuth } from "@/features/organization/utils/organization-guards";
import { getOrganizationByProfileId } from "@/features/organization/services/organization.service";
import { OrganizationEditForm } from "@/components/dashboard/organizer/OrganizationEditForm";
import Link from "next/link";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizationEditPage() {
  const { profile } = await requireAuth();

  if (!["ORGANIZER", "PENDING_ORGANIZER", "ADMIN"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const organization = await getOrganizationByProfileId(profile.id, false);

  if (!organization) {
    redirect("/organizer/organization");
  }

  return <OrganizationEditForm organization={organization} />;
}
