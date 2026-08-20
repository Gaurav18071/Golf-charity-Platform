import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ShieldCheck, Search, Shield } from "lucide-react";
import { AdminDataTable } from "@/components/dashboard/admin/AdminDataTable";
import { StatsGrid } from "@/components/dashboard/widgets";
import type { StatItem } from "@/components/dashboard/widgets";
import { UserRoleSelect } from "@/components/dashboard/admin/UserRoleSelect";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function UsersPage({ searchParams }: PageProps) {
  const { q, role } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== "ADMIN") redirect("/dashboard");

  const [users, totalDonors, totalOrganizers, totalPending, totalAdmins] =
    await Promise.all([
      prisma.profile.findMany({
        where: {
          ...(role ? { role: role as UserRole } : {}),
          ...(q
            ? {
                OR: [
                  { fullName: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.profile.count({ where: { role: "DONOR" } }),
      prisma.profile.count({ where: { role: "ORGANIZER" } }),
      prisma.profile.count({ where: { role: "PENDING_ORGANIZER" } }),
      prisma.profile.count({ where: { role: "ADMIN" } }),
    ]);

  const stats: StatItem[] = [
    {
      id: "total",
      title: "Total Platform Users",
      value: totalDonors + totalOrganizers + totalPending + totalAdmins,
      icon: <Users className="h-6 w-6" />,
      variant: "slate",
    },
    {
      id: "donors",
      title: "Donors",
      value: totalDonors,
      icon: <Users className="h-6 w-6" />,
      variant: "blue",
    },
    {
      id: "organizers",
      title: "Verified Organizers",
      value: totalOrganizers,
      icon: <ShieldCheck className="h-6 w-6" />,
      variant: "emerald",
    },
    {
      id: "admins",
      title: "Administrators",
      value: totalAdmins,
      icon: <Shield className="h-6 w-6" />,
      variant: "purple",
    },
  ];

  const ROLE_TABS = [
    { label: "All", value: "" },
    { label: "Donors", value: "DONOR" },
    { label: "Organizers", value: "ORGANIZER" },
    { label: "Pending", value: "PENDING_ORGANIZER" },
    { label: "Admins", value: "ADMIN" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all platform user profiles and administrative roles.
        </p>
      </div>

      <StatsGrid stats={stats} cols={4} />

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="GET" className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {role && <input type="hidden" name="role" value={role} />}
        </form>

        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {ROLE_TABS.map((tab) => (
            <a
              key={tab.value}
              href={`/admin/users?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(tab.value ? { role: tab.value } : {}),
              }).toString()}`}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                (role ?? "") === tab.value
                  ? "bg-emerald-600 text-white shadow-xs"
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
        emptyMessage="No users found matching your filters."
        emptyIcon={<Users className="h-10 w-10 text-slate-400" />}
        columns={[
          {
            key: "name",
            header: "User Details",
            render: (r) => (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                  {r.fullName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {r.fullName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role / Permission",
            render: (r) => (
              <UserRoleSelect
                userId={r.id}
                initialRole={r.role}
                isSelf={r.id === user.id}
              />
            ),
          },
          {
            key: "joined",
            header: "Joined Date",
            render: (r) => (
              <span className="text-xs text-slate-600">
                {formatDate(r.createdAt)}
              </span>
            ),
          },
          {
            key: "id",
            header: "User ID",
            render: (r) => (
              <span className="font-mono text-[11px] text-slate-400">
                {r.id.slice(0, 8)}…{r.id.slice(-4)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
