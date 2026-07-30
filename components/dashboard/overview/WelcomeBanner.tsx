"use client";

interface WelcomeBannerProps {
  userName: string;
  onCreateCampaign?: () => void;
  onViewReports?: () => void;
}

export default function WelcomeBanner({
  userName,
  onCreateCampaign,
  onViewReports,
}: WelcomeBannerProps) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  return (
    <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {userName} 👋
          </h1>

          <p className="mt-3 text-sm leading-6 text-emerald-50 sm:text-base">
            Welcome back! Manage your campaigns, donations, subscribers, and
            reports from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreateCampaign}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-700"
          >
            + New Campaign
          </button>

          <button
            type="button"
            onClick={onViewReports}
            className="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
          >
            View Reports
          </button>
        </div>
      </div>
    </section>
  );
}