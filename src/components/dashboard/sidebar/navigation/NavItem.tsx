"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
}

export function NavItem({
  title,
  href,
  icon: Icon,
}: NavItemProps) {
  const pathname = usePathname();

  const isActive =
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-emerald-700 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ].join(" ")}
    >
      <Icon className="h-5 w-5 shrink-0" />

      <span>{title}</span>
    </Link>
  );
}