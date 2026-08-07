import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { getOrganizationsPendingReviewAction } from "@/features/organization";

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

  // Get organizations by verification status
  const [pendingOrgs, approvedCount, rejectedCount] = await Promise.all([
    prisma.organization.findMany({
      where: { 
        verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
        deletedAt: null,
      },
      include: {
        profile: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.organization.count({ 
      where: { verificationStatus: "APPROVED", deletedAt: null },
    }),
    prisma.organization.count({ 
      where: { verificationStatus: "REJECTED", deletedAt: null },
    }),
  ]);

  const stats: StatItem[] = [
    { 
      id: "pending", 
      title: "Pending Review", 
      value: pendingOrgs.length, 
      icon: <ClipboardList className="h-6 w-6" />, 
      variant: "amber" 
    },
    { 
      id: "approved", 
      title: "Approved", 
      value: approvedCount, 
      icon: <CheckCircle2 className="h-6 w-6" />, 
      variant: "emerald" 
    },
    { 
      id: "rejected", 
      title: "Rejected", 
      value: rejectedCount, 
      icon: <XCircle className="h-6 w-6" />, 
      variant: "red" 
    },
  ];

  const STATUS_STYLE: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING:  "bg-amber-100 text-amber-700",
    UNDER_REVIEW: "bg-blue-100 text-blue-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Verification</h1>
        <p className="mt-1 text-sm text-slate-500">Review and approve organization applications.</p>
      </div>
      <StatsGrid stats={stats} cols={3} />
      <AdminDataTable
        rows={pendingOrgs}
        rowKey={(r) => r.id}
        emptyMessage="No pending organization requests."
        emptyIcon={<ClipboardList className="h-10 w-10" />}
        columns={[
          {
            key: "name",
            header: "Organization",
            render: (r) => (
              <div>
                <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">{r.profile.fullName} • {r.profile.email}</p>
              </div>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (r) => (
              <span className="text-sm text-slate-600">{r.type}</span>
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
            key: "submitted",
            header: "Submitted",
            render: (r) => (
              <span className="text-sm text-slate-500">
                {r.submittedAt ? formatDate(r.submittedAt) : "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex items-center gap-1">
                <button className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                  View Details
                </button>
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
