import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { ClipboardList, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function OrganizerRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [pending, verified, rejected] = await Promise.all([
    prisma.profile.findMany({
      where: { verificationStatus: "PENDING", role: "ORGANIZER" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.count({ where: { verificationStatus: "VERIFIED", role: "ORGANIZER" } }),
    prisma.profile.count({ where: { verificationStatus: "REJECTED", role: "ORGANIZER" } }),
  ]);

  const stats: StatItem[] = [
    { id: "pending", title: "Pending Review", value: pending.length, icon: <ClipboardList className="h-6 w-6" />, variant: "amber" },
    { id: "verified", title: "Approved", value: verified, icon: <CheckCircle2 className="h-6 w-6" />, variant: "emerald" },
    { id: "rejected", title: "Rejected", value: rejected, icon: <XCircle className="h-6 w-6" />, variant: "red" },
  ];

  const STATUS_STYLE: Record<string, string> = {
    PENDING:  "bg-amber-100 text-amber-700",
    VERIFIED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organizer Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Review and approve organizer applications.</p>
      </div>
      <StatsGrid stats={stats} cols={3} />
      <AdminDataTable
        rows={pending}
        rowKey={(r) => r.id}
        emptyMessage="No pending organizer requests."
        emptyIcon={<ClipboardList className="h-10 w-10" />}
        columns={[
          {
            key: "name",
            header: "Organizer",
            render: (r) => (
              <div>
                <p className="text-sm font-semibold text-slate-900">{r.fullName}</p>
                <p className="text-xs text-slate-500 font-mono">{r.id.slice(0, 8)}…</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.verificationStatus]}`}>
                {r.verificationStatus}
              </span>
            ),
          },
          {
            key: "joined",
            header: "Submitted",
            render: (r) => <span className="text-sm text-slate-500">{formatDate(r.createdAt)}</span>,
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
                <button className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" /> Request Changes
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
