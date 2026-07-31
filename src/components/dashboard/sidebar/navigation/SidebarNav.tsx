"use client";

import { DASHBOARD_NAV_ITEMS } from "@/src/constants/dashboard";
import { NavItem } from "./NavItem";

export function SidebarNav() {
  return (
    <nav
      className="flex flex-1 flex-col gap-2"
      aria-label="Dashboard Navigation"
    >
      {DASHBOARD_NAV_ITEMS.map((item) => (
        <NavItem
          key={item.href}
          title={item.title}
          href={item.href}
          icon={item.icon}
        />
      ))}
    </nav>
  );
}
