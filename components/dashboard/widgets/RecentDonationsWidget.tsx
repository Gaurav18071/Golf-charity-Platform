import Link from "next/link";

type DonationStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface RecentDonationItem {
  id: string;
  campaignTitle: string;
  amount: number;
  status: DonationStatus;
  date: string;
}

interface RecentDonationsWidgetProps {
  donations: RecentDonationItem[];
  viewAllHref?: string;
  title?: string;
}

const STATUS_STYLES: Record<DonationStatus, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100 text-amber-700",
  FAILED:    "bg-red-100 text-red-700",
  REFUNDED:  "bg-slate-100 text-slate-600",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * RecentDonationsWidget
 *
 * Compact donations list used in donor + organizer dashboards.
 */
export function RecentDonationsWidget({
  donations,
  viewAllHref = "/donations",
  title = "Recent Donations",
}: RecentDonationsWidgetProps) {
  return (
    <section
      aria-labelledby="recent-donations-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          id="recent-donations-heading"
          className="text-base font-semibold text-slate-900"
        >
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      {donations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">No donations yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {donations.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {d.campaignTitle}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{d.date}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[d.status]}`}>
                  {d.status}
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(d.amount)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
