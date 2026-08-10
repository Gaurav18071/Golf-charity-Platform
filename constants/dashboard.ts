import {
  LayoutDashboard,
  Megaphone,
  BookOpen,
  HandCoins,
  History,
  Bookmark,
  FolderKanban,
  PlusCircle,
  BarChart2,
  Building2,
  FileText,
  BadgeCheck,
  ClipboardList,
  CheckSquare,
  Users,
  CreditCard,
  BarChart3,
  SlidersHorizontal,
  User,
  Settings,
  Bell,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * NavGroup
 *
 * Logical section label shown as a heading in the sidebar.
 * Null means the item belongs to no group (rendered without a heading).
 */
export type NavGroup =
  | "General"
  | "Campaigns"
  | "Organizer"
  | "Admin"
  | "Account";

/**
 * NavItem definition
 *
 * roles: []  → visible to ALL authenticated users
 * roles: [...] → visible only to those specific roles
 */
export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  group: NavGroup;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  // ── General ────────────────────────────────────────────────────────────────
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [],
    group: "General",
  },
  {
    title: "Browse Campaigns",
    href: "/campaigns/browse",
    icon: BookOpen,
    roles: [],
    group: "General",
  },
  {
    title: "My Donations",
    href: "/donations",
    icon: HandCoins,
    roles: [],
    group: "General",
  },
  {
    title: "Donation History",
    href: "/donations/history",
    icon: History,
    roles: [],
    group: "General",
  },
  {
    title: "Saved Campaigns",
    href: "/campaigns/saved",
    icon: Bookmark,
    roles: [],
    group: "General",
  },

  // ── Campaigns (Organizer + Admin only) ─────────────────────────────────────
  {
    title: "My Campaigns",
    href: "/campaigns",
    icon: FolderKanban,
    roles: ["ORGANIZER", "ADMIN"],
    group: "Campaigns",
  },
  {
    title: "Create Campaign",
    href: "/campaigns/new",
    icon: PlusCircle,
    roles: ["ORGANIZER", "ADMIN"],
    group: "Campaigns",
  },
  {
    title: "Campaign Analytics",
    href: "/analytics",
    icon: BarChart2,
    roles: ["ORGANIZER", "ADMIN"],
    group: "Campaigns",
  },

  // ── Organizer (Pending + Verified + Admin) ─────────────────────────────────
  {
    title: "Organization Profile",
    href: "/organizer/profile",
    icon: Building2,
    roles: ["PENDING_ORGANIZER", "ORGANIZER", "ADMIN"],
    group: "Organizer",
  },
  {
    title: "Organization Documents",
    href: "/organizer/documents",
    icon: FileText,
    roles: ["PENDING_ORGANIZER", "ORGANIZER", "ADMIN"],
    group: "Organizer",
  },
  {
    title: "Verification Status",
    href: "/organizer/verification",
    icon: BadgeCheck,
    roles: ["PENDING_ORGANIZER", "ADMIN"],
    group: "Organizer",
  },

  // ── Admin only ─────────────────────────────────────────────────────────────
  {
    title: "Organizer Requests",
    href: "/admin/organizer-requests",
    icon: ClipboardList,
    roles: ["ADMIN"],
    group: "Admin",
  },
  {
    title: "Campaign Approvals",
    href: "/admin/campaign-approvals",
    icon: CheckSquare,
    roles: ["ADMIN"],
    group: "Admin",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
    group: "Admin",
  },
  {
    title: "Payment Management",
    href: "/admin/payments",
    icon: CreditCard,
    roles: ["ADMIN"],
    group: "Admin",
  },
  {
    title: "Reports & Analytics",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["ADMIN"],
    group: "Admin",
  },
  {
    title: "Platform Settings",
    href: "/admin/settings",
    icon: SlidersHorizontal,
    roles: ["ADMIN"],
    group: "Admin",
  },

  // ── Account (all roles) ────────────────────────────────────────────────────
  {
    title: "My Profile",
    href: "/profile",
    icon: User,
    roles: [],
    group: "Account",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: [],
    group: "Account",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: [],
    group: "Account",
  },
  {
    title: "Help & Support",
    href: "/support",
    icon: HelpCircle,
    roles: [],
    group: "Account",
  },
];

export const NAV_GROUP_ORDER: NavGroup[] = [
  "General",
  "Campaigns",
  "Organizer",
  "Admin",
  "Account",
];
