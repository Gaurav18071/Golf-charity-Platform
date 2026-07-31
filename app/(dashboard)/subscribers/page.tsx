import { Users, UserCheck, Clock, ShieldCheck } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { VerificationStatus } from "@prisma/client";
import { EmptyState } from "@/src/components/dashboard/shared";
import SubscribersTable from "@/src/components/dashboard/subscribers/SubscribersTable";
import SubscriberFilter from "@/src/components/dashboard/subscribers/SubscriberFilter";

interface PageProps {
  searchParams: Promise<{ verified?: string }>;
}

export default async function SubscribersPage({ searchParams }: PageProps) {
  const { verified } = await searchParams;

  const verifiedFilter: VerificationStatus | undefined =
    verified === "verified"
      ? VerificationStatus.VERIFIED
      : verified === "pending"
        ? VerificationStatus.PENDING
        : undefined;

  const [subscribers, stats] = await Promise.all([
    prisma.profile.findMany({
      where: {
        role: "DONOR",
        ...(verifiedFilter ? { verificationStatus: verifiedFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { donations: true } },
      },
    }),
    prisma.profile.groupBy({
      by: ["verificationStatus"],
      where: { role: "DONOR" },
      _count: { id: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    stats.map((s) => [s.verificationStatus, s._count.id])
  );
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);

  const summaryCards = [
    {
      label: "Total",
      value: total,
      icon: <Users className="h-5 w-5" />,
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "Verified",
      value: countMap["VERIFIED"] ?? 0,
      icon: <ShieldCheck className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Pending",
      value: countMap["PENDING"] ?? 0,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Rejected",
      value: countMap["REJECTED"] ?? 0,
      icon: <UserCheck className="h-5 w-5" />,
      color: "bg-red-100 text-red-600",
    },
  ];

  const rows = subscribers.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    avatarUrl: s.avatarUrl,
    verificationStatus: s.verificationStatus,
    donationCount: s._count.donations,
    joinedAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscribers</h1>
        <p className="mt-1 text-sm text-slate-500">
          All registered donors on your platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <SubscriberFilter activeFilter={verified} />

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No subscribers yet"
          description="Donors who sign up will appear here. Share your campaigns to attract donors."
        />
      ) : (
        <SubscribersTable subscribers={rows} />
      )}
    </div>
  );
}
