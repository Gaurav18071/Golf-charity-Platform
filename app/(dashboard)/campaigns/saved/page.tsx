import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bookmark, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Saved campaigns are not yet persisted in DB (no saved_campaigns table).
// This page renders an empty state with CTA to browse campaigns.
// Implementation with DB persistence is planned for a future sprint.

export default async function SavedCampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Campaigns</h1>
        <p className="mt-1 text-sm text-slate-500">
          Campaigns you've bookmarked for later.
        </p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Bookmark className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No saved campaigns yet</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Browse campaigns and click the bookmark icon to save them here for easy access later.
        </p>
        <Link
          href="/campaigns/browse"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <BookOpen className="h-4 w-4" />
          Browse Campaigns
        </Link>
      </div>
    </div>
  );
}
