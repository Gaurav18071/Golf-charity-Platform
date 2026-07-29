import {
  LayoutDashboard,
  Megaphone,
  Users,
  HandCoins,
  ChartColumn,
  Settings,
  LogOut,
} from "lucide-react";

export const DASHBOARD_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: Megaphone,
  },
  {
    title: "Subscribers",
    href: "/subscribers",
    icon: Users,
  },
  {
    title: "Donations",
    href: "/donations",
    icon: HandCoins,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: ChartColumn,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const SIDEBAR_FOOTER_ITEMS = [
  {
    title: "Logout",
    icon: LogOut,
  },
];