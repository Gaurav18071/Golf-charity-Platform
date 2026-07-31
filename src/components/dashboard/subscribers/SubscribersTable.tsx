"use client";

type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface SubscriberRow {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  verificationStatus: VerificationStatus;
  donationCount: number;
  joinedAt: string;
}

interface SubscribersTableProps {
  subscribers: SubscriberRow[];
}

const STATUS_STYLES: Record<VerificationStatus, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function SubscribersTable({ subscribers }: SubscribersTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["Subscriber", "Status", "Donations", "Joined"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-slate-50">
                {/* Name + avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {s.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.avatarUrl}
                          alt={s.fullName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(s.fullName)
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {s.fullName}
                    </span>
                  </div>
                </td>
                {/* Status */}
                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.verificationStatus]}`}
                  >
                    {s.verificationStatus}
                  </span>
                </td>
                {/* Donation count */}
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {s.donationCount}
                </td>
                {/* Joined */}
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {formatDate(s.joinedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
