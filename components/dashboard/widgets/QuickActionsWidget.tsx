import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: "default" | "primary";
}

interface QuickActionsWidgetProps {
  title?: string;
  description?: string;
  actions: QuickAction[];
}

/**
 * QuickActionsWidget
 *
 * Card grid of shortcut links. Reused across all role dashboards.
 */
export function QuickActionsWidget({
  title = "Quick Actions",
  description = "Frequently used shortcuts.",
  actions,
}: QuickActionsWidgetProps) {
  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <h2
          id="quick-actions-heading"
          className="text-base font-semibold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.variant === "primary";

          return (
            <Link
              key={action.id}
              href={action.href}
              className={[
                "flex items-start gap-3 rounded-xl border p-4 transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                isPrimary
                  ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                  : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isPrimary
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {action.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
