"use client";
import { ReactNode } from "react";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: ReactNode;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <h2
          id="recent-activity-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Stay updated with the latest changes on your platform.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-base font-medium text-slate-900">
            <EmptyState
           icon={<Clock3 className="h-7 w-7" />}
           title="No recent activity"
            description="Activities such as donations, campaigns and subscribers will appear here."
/>
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Activities such as new donations, campaigns, and subscribers will
            appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                {activity.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-slate-900">
                  {activity.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {activity.description}
                </p>
              </div>

              <time className="whitespace-nowrap text-xs text-slate-400">
                {activity.time}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}