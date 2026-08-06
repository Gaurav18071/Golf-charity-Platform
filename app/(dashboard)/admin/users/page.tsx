import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ShieldCheck, Eye, Ban, Trash2, Search } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const ROLE_STYLE: Record<string, string> = {
  ADMIN:     "bg-purple-100 text-purple-700",
  ORGANIZER: "bg-emerald-100 text-emerald-700",
  DONOR:     "bg-blue-100 text-blue-700",
};

export default async function UsersPage({ searchParams }: PageProps) {
  const { q, role } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [users, totalDonors, totalOrganizers, totalAdmins] = await Promise.all([
    prisma.profile.findMany({
      where: {
        ...(role ? { role: role as "ADMIN" | "ORGANIZER" | "DONOR" } : {}),
        ...(q ? { fullName: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.profile.count({ where: { role: "DONOR" } }),
    prisma.profile.count({ where: { role: "ORGANIZER" } }),
    prisma.profile.count({ where: { role: "ADMIN" } }),
  ]);

  const stats: StatItem[] = [
    { id: "total", title: "Total Users", value: totalDonors + totalOrganizers + totalAdmins, icon: <Users className="h-6 w-6" />, variant: "slate" },
    { id: "donors", title: "Donors", value: totalDonors, icon: <Users className="h-6 w-6" />, variant: "blue" },
    { id: "organizers", title: "Organizers", value: totalOrganizers, icon: <ShieldCheck className="h-6 w-6" />, variant: "emerald" },
  ];

  const ROLE_TABS = [
    { label: "All", value: "" },
    { label: "Donors", value: "DONOR" },
    { label: "Organizers", value: "ORGANIZER" },
    { label: "Admins", value: "ADMIN" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage all platform users.</p>
      </div>

      <StatsGrid stats={stats} cols={3} />

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form method="GET" className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search users…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {role && <input type="hidden" name="role" value={role} />}
        </form>

        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {ROLE_TABS.map((tab) => (
            <a
              key={tab.value}
              href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), ...(tab.value ? { role: tab.value } : {}) }).toString()}`}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                (role ?? "") === tab.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <AdminDataTable
        rows={users}
        rowKey={(r) => r.id}
        emptyMessage="No users found."
        emptyIcon={<Users className="h-10 w-10" />}
        columns={[
          {
            key: "name",
            header: "User",
            render: (r) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {r.fullName.slice(0, 1).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-slate-900">{r.fullName}</p>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (r) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[r.role] ?? "bg-slate-100 text-slate-600"}`}>
                {r.role}
              </span>
            ),
          },
          {
            key: "status",
            header: "Verification",
            render: (r) => (
              <span className={`text-xs font-medium ${r.verificationStatus === "VERIFIED" ? "text-emerald-600" : r.verificationStatus === "REJECTED" ? "text-red-600" : "text-amber-600"}`}>
                {r.verificationStatus}
              </span>
            ),
          },
          {
            key: "joined",
            header: "Joined",
            render: (r) => <span className="text-sm text-slate-500">{formatDate(r.createdAt)}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            render: () => (
              <div className="flex items-center gap-1">
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="View">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-100 hover:text-amber-700 transition-colors" title="Suspend">
                  <Ban className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-700 transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
