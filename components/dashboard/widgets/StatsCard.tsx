import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";
type ColorVariant = "emerald" | "blue" | "amber" | "red" | "purple" | "slate";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;    // percentage e.g. 12 = +12%
    direction: TrendDirection;
    label?: string;   // e.g. "vs last month"
  };
  variant?: ColorVariant;
}

const VARIANT_STYLES: Record<ColorVariant, { icon: string; trend: string }> = {
  emerald: { icon: "bg-emerald-100 text-emerald-600", trend: "text-emerald-600" },
  blue:    { icon: "bg-blue-100 text-blue-600",       trend: "text-blue-600"    },
  amber:   { icon: "bg-amber-100 text-amber-600",     trend: "text-amber-600"   },
  red:     { icon: "bg-red-100 text-red-600",         trend: "text-red-600"     },
  purple:  { icon: "bg-purple-100 text-purple-600",   trend: "text-purple-600"  },
  slate:   { icon: "bg-slate-100 text-slate-600",     trend: "text-slate-600"   },
};

/**
 * StatsCard
 *
 * Universal stat card used across all role dashboards.
 * Supports trend indicator, icon, and colour variant.
 */
export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = "emerald",
}: StatsCardProps) {
  const styles = VARIANT_STYLES[variant];

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600"
      : trend?.direction === "down"
        ? "text-red-500"
        : "text-slate-400";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5 shrink-0" />
              <span>
                {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ""}
              </span>
            </div>
          )}

          {!trend && description && (
            <p className="mt-2 text-xs text-slate-500 truncate">{description}</p>
          )}
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}
