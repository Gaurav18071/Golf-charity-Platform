"use client";

type StatusRow = {
  status: string;
  count: number;
  amount: number;
};

interface DonationsByStatusChartProps {
  data: StatusRow[];
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-500",
  PENDING: "bg-amber-400",
  FAILED: "bg-red-400",
  REFUNDED: "bg-slate-400",
};

const STATUS_BG: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-600",
};

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function DonationsByStatusChart({
  data,
}: DonationsByStatusChartProps) {
  const total = data.reduce((a, b) => a + b.count, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-slate-900">
        Donations by Status
      </h2>

      {total === 0 ? (
        <p className="text-sm text-slate-500">No donation data yet.</p>
      ) : (
        <div className="space-y-5">
          {/* Stacked bar */}
          <div className="flex h-4 w-full overflow-hidden rounded-full">
            {data.map((d) => {
              const pct = (d.count / total) * 100;
              return (
                <div
                  key={d.status}
                  className={`${STATUS_COLORS[d.status] ?? "bg-slate-300"} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${d.status}: ${d.count}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <ul className="space-y-3">
            {data.map((d) => {
              const pct = Math.round((d.count / total) * 100);
              return (
                <li
                  key={d.status}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BG[d.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-slate-900">
                      {d.count} ({pct}%)
                    </span>
                    {d.amount > 0 && (
                      <span className="ml-2 text-xs text-slate-500">
                        {formatCurrency(d.amount)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-slate-400">Total: {total} donations</p>
        </div>
      )}
    </div>
  );
}
