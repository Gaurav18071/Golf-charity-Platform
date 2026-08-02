import type { ReactNode } from "react";

interface WelcomeBannerWidgetProps {
  userName: string;
  role: string;
  subtitle?: string;
  actions?: ReactNode;
}

const ROLE_GRADIENT: Record<string, string> = {
  ADMIN:             "from-slate-800 to-slate-900",
  ORGANIZER:         "from-emerald-700 to-emerald-900",
  PENDING_ORGANIZER: "from-amber-600 to-amber-800",
  DONOR:             "from-emerald-600 to-emerald-800",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN:             "Platform Administrator",
  ORGANIZER:         "Campaign Organizer",
  PENDING_ORGANIZER: "Organizer (Pending Verification)",
  DONOR:             "Donor",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * WelcomeBannerWidget
 *
 * Top-of-dashboard welcome section with role-aware gradient and label.
 * Server-safe: greeting is computed server-side to avoid hydration mismatch.
 */
export function WelcomeBannerWidget({
  userName,
  role,
  subtitle,
  actions,
}: WelcomeBannerWidgetProps) {
  const gradient = ROLE_GRADIENT[role] ?? ROLE_GRADIENT.DONOR;
  const roleLabel = ROLE_LABEL[role] ?? role;
  const greeting = getGreeting();

  return (
    <section
      className={`rounded-3xl bg-gradient-to-r ${gradient} p-6 text-white shadow-lg sm:p-8`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {roleLabel}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {greeting}, {userName} 👋
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">
            {subtitle ?? "Welcome back to your Golf Charity dashboard."}
          </p>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
