import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateCampaignForm from "@/components/dashboard/campaigns/CreateCampaignForm";

export const dynamic = "force-dynamic";

export default async function CreateCampaignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/campaigns"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Campaign</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Fill in the details below. Campaigns require admin approval before going live.
          </p>
        </div>
      </div>

      <CreateCampaignForm />
    </div>
  );
}
