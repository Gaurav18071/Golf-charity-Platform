"use client";

import {
  DASHBOARD_NAV_ITEMS,
  NAV_GROUP_ORDER,
  type NavGroup,
} from "@/constants/dashboard";
import { useProfileContext } from "@/context/ProfileContext";
import { NavItem } from "./NavItem";

/**
 * SidebarNav
 *
 * Renders dashboard navigation items grouped by section,
 * filtered by the current user's role.
 *
 * Filtering rules (from constants/dashboard.ts):
 *   roles: []          → visible to ALL authenticated users
 *   roles: ["ADMIN"]   → visible only to ADMIN
 *
 * Groups with no visible items are omitted entirely.
 * While the profile loads, skeleton placeholders prevent layout shift.
 */
export function SidebarNav() {
  const { profile, loading } = useProfileContext();

  // ── Loading — skeleton prevents layout shift ───────────────────────────────
  if (loading) {
    return (
      <nav
        className="flex flex-1 flex-col gap-1"
        aria-label="Dashboard Navigation"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-full animate-pulse rounded-lg bg-muted"
            aria-hidden="true"
          />
        ))}
      </nav>
    );
  }

  // ── Filter items by role ───────────────────────────────────────────────────
  const visibleItems = DASHBOARD_NAV_ITEMS.filter((item) => {
    if (item.roles.length === 0) return true;
    if (!profile) return false;
    return item.roles.includes(profile.role);
  });

  // ── Group visible items ────────────────────────────────────────────────────
  const groupedItems = NAV_GROUP_ORDER.reduce<
    Record<NavGroup, typeof visibleItems>
  >(
    (acc, group) => {
      acc[group] = visibleItems.filter((item) => item.group === group);
      return acc;
    },
    {} as Record<NavGroup, typeof visibleItems>
  );

  return (
    <nav
      className="flex flex-1 flex-col gap-4"
      aria-label="Dashboard Navigation"
    >
      {NAV_GROUP_ORDER.map((group) => {
        const items = groupedItems[group];

        // Skip groups that have no visible items for this role
        if (!items || items.length === 0) return null;

        return (
          <div key={group} className="flex flex-col gap-1">
            {/* Group heading */}
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              {group}
            </p>

            {/* Nav items */}
            {items.map((item) => (
              <NavItem
                key={item.href}
                title={item.title}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
