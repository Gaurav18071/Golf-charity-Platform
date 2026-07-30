import Link from "next/link";

export function SidebarHeader() {
  return (
    <div className="border-b px-6 py-5">
      <Link
        href="/dashboard"
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
          GC
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            Golf Charity
          </span>

          <span className="text-xs text-muted-foreground">
            Admin Dashboard
          </span>
        </div>
      </Link>
    </div>
  );
}