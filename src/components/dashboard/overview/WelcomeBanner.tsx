"use client";

import { useState, useEffect } from "react";

interface WelcomeBannerProps {
  userName: string;
  onCreateCampaign?: () => void;
  onViewReports?: () => void;
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function WelcomeBanner({
  userName,
  onCreateCampaign,
  onViewReports,
}: WelcomeBannerProps) {
  // Start with a stable server-safe default, update after hydration
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 sm:p-8 text-white shadow-lg">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {greeting}, {userName} 👋
          </h1>

          <p className="mt-3 text-sm leading-6 text-emerald-100 sm:text-base">
            Welcome back! Manage your campaigns, donations, subscribers, and
            reports from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCreateCampaign}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-700 cursor-pointer"
          >
            + New Campaign
          </button>

          <button
            type="button"
            onClick={onViewReports}
            className="rounded-xl border border-emerald-300/60 bg-emerald-700/40 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          >
            View Reports
          </button>
        </div>
      </div>
    </section>
  );
}