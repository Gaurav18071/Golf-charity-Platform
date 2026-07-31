"use client";

type DonationStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface DonationRow {
  id: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  status: DonationStatus;
  paymentProvider: string;
  createdAt: string;
  donatedAt: string | null;
}

interface DonationsTableProps {
  donations: DonationRow[];
}

const STATUS_STYLES: Record<DonationStatus, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-600",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DonationsTable({ donations }: DonationsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["Donor", "Campaign", "Amount", "Provider", "Status", "Date"].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {donations.map((d) => (
              <tr
                key={d.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                  {d.donorName}
                </td>
                <td className="max-w-[200px] truncate px-5 py-4 text-sm text-slate-600">
                  {d.campaignTitle}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-600">
                  {formatCurrency(d.amount)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 capitalize">
                  {d.paymentProvider.toLowerCase()}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[d.status]}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {formatDate(d.donatedAt ?? d.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
