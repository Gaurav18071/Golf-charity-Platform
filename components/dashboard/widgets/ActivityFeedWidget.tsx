import type { ReactNode } from "react";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: ReactNode;
}

interface ActivityFeedWidgetProps {
  title?: string;
  items: ActivityItem[];
  emptyMessage?: string;
}

/**
 * ActivityFeedWidget
 *
 * Chronological activity feed. Reused across all role dashboards.
 */
export function ActivityFeedWidget({
  title = "Recent Activity",
  items,
  emptyMessage = "No recent activity yet.",
}: ActivityFeedWidgetProps) {
  return (
    <section
      aria-labelledby="activity-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="activity-heading"
        className="mb-5 text-base font-semibold text-slate-900"
      >
        {title}
      </h2>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <time className="shrink-0 text-xs text-slate-400 whitespace-nowrap">
                {item.time}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
