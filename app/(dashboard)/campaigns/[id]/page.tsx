import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Globe,
  Pencil,
} from "lucide-react";
import { DonationForm } from "@/features/donation/components/DonationForm";
import { getCampaignDonationStats } from "@/features/donation/services/donation.service";
import { SaveCampaignButton } from "@/components/dashboard/campaigns/SaveCampaignButton";
import { CampaignApprovalButtons } from "@/components/dashboard/admin/CampaignApprovalButtons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateDaysLeft(endDate: Date) {
  const diffTime = new Date(endDate).getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const campaign = await prisma.campaign.findFirst({
    where: isUuid ? { id, deletedAt: null } : { slug: id, deletedAt: null },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          website: true,
          city: true,
          state: true,
          verificationStatus: true,
          logoUrl: true,
        },
      },
      organizer: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!campaign || campaign.deletedAt !== null) {
    notFound();
  }

  const [stats, donorProfile] = await Promise.all([
    getCampaignDonationStats(campaign.id),
    user
      ? prisma.profile.findUnique({
          where: { id: user.id },
          select: { fullName: true, email: true, role: true },
        })
      : null,
  ]);

  const goal = Number(campaign.goalAmount);
  const current = Number(campaign.currentAmount);
  const percent = Math.min(100, Math.round((current / (goal || 1)) * 100));
  const daysLeft = calculateDaysLeft(campaign.endDate);
  const isActive = campaign.status === "ACTIVE" && daysLeft > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <Link
          href="/campaigns/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Link>

        <SaveCampaignButton
          campaignId={campaign.id}
          campaignTitle={campaign.title}
        />
      </div>

      {/* Draft / Pending Approval Alert Banner */}
      {campaign.status === "DRAFT" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-300/40">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Campaign Pending Admin Approval
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                This campaign is currently in review. Donations will automatically open once approved by platform administrators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(user?.id === campaign.organizerId || donorProfile?.role === "ADMIN") && (
              <Link
                href={`/campaigns/${campaign.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100 transition"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            )}

            {donorProfile?.role === "ADMIN" && (
              <CampaignApprovalButtons campaignId={campaign.id} />
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left details, Right donation widget */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header & Banner */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {campaign.category.replace(/_/g, " ")}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
              }`}>
                {isActive ? "ACTIVE CAMPAIGN" : campaign.status}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {campaign.title}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              {campaign.shortDescription}
            </p>

            {/* Cover Image */}
            <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 border border-slate-200 shadow-sm">
              {campaign.coverImageUrl ? (
                <Image
                  src={campaign.coverImageUrl}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center p-8 text-center overflow-hidden">
                  <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl" />
                  <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-500/10 blur-2xl" />

                  <div className="relative z-10 flex flex-col items-center max-w-md">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400 shadow-inner">
                      <Heart className="h-8 w-8 fill-emerald-400 text-emerald-400" />
                    </div>
                    <span className="rounded-full bg-emerald-500/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30 mb-2">
                      {campaign.category.replace(/_/g, " ")}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug drop-shadow-sm">
                      {campaign.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {campaign.shortDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Raised</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(current)}</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Supporters</p>
              <p className="text-lg font-bold text-slate-900">{stats.donorCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Days Remaining</p>
              <p className="text-lg font-bold text-slate-900">{daysLeft} Days</p>
            </div>
          </div>

          {/* Campaign Story */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              About This Campaign
            </h2>
            <div className="prose prose-slate text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {campaign.story || campaign.description}
            </div>
          </div>

          {/* Beneficiary Details */}
          {(campaign.beneficiaryName || campaign.beneficiaryStory) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Beneficiary Information
              </h2>
              {campaign.beneficiaryName && (
                <p className="text-sm font-semibold text-slate-900">
                  Beneficiary: <span className="text-emerald-700">{campaign.beneficiaryName}</span>
                </p>
              )}
              {campaign.beneficiaryStory && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {campaign.beneficiaryStory}
                </p>
              )}
            </div>
          )}

          {/* Organization / NGO Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Organized by
            </h2>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                {campaign.organization.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    {campaign.organization.name}
                  </h3>
                  {campaign.organization.verificationStatus === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Verified NGO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {campaign.organization.city}, {campaign.organization.state} • {campaign.organization.type}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {campaign.organization.description}
                </p>
                {campaign.organization.website && (
                  <a
                    href={campaign.organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline mt-1"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Recent Supporters / Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Recent Supporters ({stats.donationCount})
            </h2>

            {stats.recentDonations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Be the first to donate and support this cause!
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentDonations.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                        {d.donorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{d.donorName}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(d.donatedAt || d.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Donation Form Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <DonationForm
              campaignId={campaign.id}
              campaignTitle={campaign.title}
              organizationName={campaign.organization.name}
              goalAmount={goal}
              currentAmount={current}
              isActive={isActive}
              status={campaign.status}
              donorName={donorProfile?.fullName}
              donorEmail={donorProfile?.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
