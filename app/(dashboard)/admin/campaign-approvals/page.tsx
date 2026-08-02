import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { CheckSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
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
      include: { organizer: { select: { fullName: true } } },
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
        emptyIcon={<CheckSquare className="h-10 w-10" />}
        columns={[
          {
            key: "campaign",
            header: "Campaign",
            render: (r) => (
              <div className="max-w-[200px]">
                <p className="truncate text-sm font-semibold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.organizer.fullName}</p>
              </div>
            ),
          },
          {
            key: "goal",
            header: "Goal",
            render: (r) => <span className="text-sm text-slate-600">{formatCurrency(Number(r.goalAmount))}</span>,
          },
          {
            key: "status",
            header: "Status",
            render: () => (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                DRAFT
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: () => (
              <div className="flex items-center gap-1">
                <button className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
