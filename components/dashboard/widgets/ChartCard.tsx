import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * ChartCard
 *
 * Generic container for any chart or data visualisation.
 * Provides a consistent header + padding + shadow for chart slots.
 * Pass the actual chart as children.
 */
export function ChartCard({
  title,
  description,
  action,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Chart slot */}
      {children}
    </div>
  );
}
