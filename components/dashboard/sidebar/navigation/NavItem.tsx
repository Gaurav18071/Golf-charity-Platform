"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/constants/dashboard";

interface NavItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export function NavItem({
  title,
  href,
  icon: Icon,
  isActive: propIsActive,
}: NavItemProps) {
  const pathname = usePathname();

  let isActive = propIsActive;

  if (isActive === undefined) {
    // 1. Exact match has highest priority
    const exactMatchExists = DASHBOARD_NAV_ITEMS.some(
      (item) => item.href === pathname
    );

    if (exactMatchExists) {
      isActive = pathname === href;
    } else {
      // 2. Longest prefix match with boundary for sub-pages
      const matchingPrefixItems = DASHBOARD_NAV_ITEMS.filter(
        (item) =>
          item.href !== "/dashboard" && pathname.startsWith(item.href + "/")
      ).sort((a, b) => b.href.length - a.href.length);

      isActive = matchingPrefixItems[0]?.href === href;
    }
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-slate-900 text-white font-semibold shadow-xs dark:bg-slate-100 dark:text-slate-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ].join(" ")}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{title}</span>
    </Link>
  );
}