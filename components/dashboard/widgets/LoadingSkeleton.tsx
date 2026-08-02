/**
 * LoadingSkeleton
 *
 * Reusable animated pulse skeletons for dashboard pages.
 * All variants prevent layout shift by matching the real component dimensions.
 */

/** Single skeleton line */
export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

/** StatsCard skeleton */
export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-8 w-32" />
          <SkeletonLine className="h-3 w-20" />
        </div>
        <SkeletonLine className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

/** StatsGrid skeleton — renders n StatsCardSkeletons */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Generic card skeleton with configurable rows */
export function CardSkeleton({
  rows = 3,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <SkeletonLine className="mb-5 h-5 w-36" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} className={`h-4 ${i % 2 === 0 ? "w-full" : "w-3/4"}`} />
        ))}
      </div>
    </div>
  );
}

/** Full dashboard page skeleton */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner skeleton */}
      <SkeletonLine className="h-28 w-full rounded-3xl" />
      {/* Stats row */}
      <StatsGridSkeleton count={4} />
      {/* Two-column row */}
      <div className="grid gap-6 xl:grid-cols-3">
        <CardSkeleton rows={4} />
        <div className="xl:col-span-2">
          <CardSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}
