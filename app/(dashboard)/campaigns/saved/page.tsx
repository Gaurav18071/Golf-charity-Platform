import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SavedCampaignsList } from "@/components/dashboard/campaigns/SavedCampaignsList";

export const dynamic = "force-dynamic";

export default async function SavedCampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const campaigns = await prisma.campaign.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      category: true,
      goalAmount: true,
      currentAmount: true,
      coverImageUrl: true,
      status: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  const formattedCampaigns = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    shortDescription: c.shortDescription,
    category: c.category,
    goalAmount: Number(c.goalAmount),
    currentAmount: Number(c.currentAmount),
    coverImageUrl: c.coverImageUrl,
    status: c.status,
    organization: c.organization,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Campaigns</h1>
        <p className="mt-1 text-sm text-slate-500">
          Campaigns you've bookmarked for later.
        </p>
      </div>

      <SavedCampaignsList allCampaigns={formattedCampaigns} />
    </div>
  );
}
