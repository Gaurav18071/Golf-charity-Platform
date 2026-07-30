export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Banner */}
      <div className="h-44 rounded-3xl bg-slate-200" />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="h-72 rounded-2xl bg-slate-200" />

        <div className="xl:col-span-2 h-72 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}