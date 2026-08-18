import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckSquare, CheckCircle2, Clock } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { CampaignApprovalButtons } from "@/components/dashboard/admin/CampaignApprovalButtons";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CampaignApprovalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [drafts, active, completed] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      include: {
        organizer: { select: { fullName: true, email: true } },
        organization: { select: { name: true } },
      },
    }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.campaign.count({ where: { status: "COMPLETED" } }),
  ]);

  const stats: StatItem[] = [
    { id: "pending", title: "Pending Approval", value: drafts.length, icon: <Clock className="h-6 w-6" />, variant: "amber" },
    { id: "active", title: "Active Campaigns", value: active, icon: <CheckCircle2 className="h-6 w-6" />, variant: "emerald" },
    { id: "completed", title: "Completed", value: completed, icon: <CheckSquare className="h-6 w-6" />, variant: "blue" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campaign Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Review campaigns submitted for approval.</p>
      </div>
      <StatsGrid stats={stats} cols={3} />
      <AdminDataTable
        rows={drafts}
        rowKey={(r) => r.id}
        emptyMessage="No campaigns pending approval."
        emptyIcon={<CheckSquare className="h-10 w-10 text-slate-400" />}
        columns={[
          {
            key: "campaign",
            header: "Campaign",
            render: (r) => (
              <div className="max-w-[260px]">
                <p className="font-semibold text-slate-900 line-clamp-1">{r.title}</p>
                <p className="text-xs text-slate-500">{r.organization?.name || r.organizer.fullName}</p>
              </div>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (r) => (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {r.category}
              </span>
            ),
          },
          {
            key: "goal",
            header: "Goal",
            render: (r) => <span className="text-sm font-semibold text-slate-900">{formatCurrency(Number(r.goalAmount))}</span>,
          },
          {
            key: "submitted",
            header: "Submitted Date",
            render: (r) => <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>,
          },
          {
            key: "status",
            header: "Status",
            render: () => (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                PENDING APPROVAL
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <CampaignApprovalButtons
                campaignId={r.id}
                campaignSlug={r.slug}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
