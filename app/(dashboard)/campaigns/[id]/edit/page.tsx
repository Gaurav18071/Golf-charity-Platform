import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditCampaignForm } from "@/components/dashboard/campaigns/EditCampaignForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const campaign = await prisma.campaign.findFirst({
    where: isUuid ? { id, deletedAt: null } : { slug: id, deletedAt: null },
    include: {
      organizer: { select: { id: true, role: true } },
    },
  });

  if (!campaign) {
    notFound();
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  // Verify ownership or admin
  if (campaign.organizerId !== user.id && profile?.role !== "ADMIN") {
    redirect("/campaigns");
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Campaign</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Update campaign details, story, or target goal.
          </p>
        </div>
      </div>

      <EditCampaignForm
        campaign={{
          id: campaign.id,
          slug: campaign.slug,
          title: campaign.title,
          description: campaign.description,
          category: campaign.category,
          goalAmount: Number(campaign.goalAmount),
          coverImageUrl: campaign.coverImageUrl,
          story: campaign.story,
          location: campaign.location,
          endDate: campaign.endDate ? campaign.endDate.toISOString() : "",
          beneficiaryName: campaign.beneficiaryName,
          beneficiaryStory: campaign.beneficiaryStory,
        }}
      />
    </div>
  );
}
