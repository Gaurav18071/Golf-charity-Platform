import type { ReactNode } from "react";
import { StatsCard } from "./StatsCard";

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  variant?: "emerald" | "blue" | "amber" | "red" | "purple" | "slate";
}

interface StatsGridProps {
  stats: StatItem[];
  /** Number of columns at large breakpoint — default 4 */
  cols?: 2 | 3 | 4;
}

const COL_CLASSES: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

/**
 * StatsGrid
 *
 * Responsive grid of StatsCards. Used at the top of every role dashboard.
 */
export function StatsGrid({ stats, cols = 4 }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${COL_CLASSES[cols]}`}>
      {stats.map((stat) => (
        <StatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
