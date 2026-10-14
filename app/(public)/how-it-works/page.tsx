import { Users, Heart, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Golf Charity Platform",
  description: "Learn how to support charitable causes through our platform. Browse campaigns, make donations, track impact, and join our community of givers.",
  keywords: ["how it works", "donation process", "charity platform", "golf charity", "fundraising guide"],
  openGraph: {
    title: "How It Works - Golf Charity Platform",
    description: "Simple steps to make a difference: Browse, Donate, Track Impact, Join Community",
    type: "website",
  },
};

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Users,
      title: "Browse Campaigns",
      description:
        "Explore verified fundraising campaigns from trusted charitable organizations. Each campaign is carefully reviewed to ensure transparency and impact.",
      action: "Browse Campaigns",
      href: "/campaigns/browse",
    },
    {
      number: "02",
      icon: Heart,
      title: "Make a Donation",
      description:
        "Choose a cause that resonates with you and make a secure donation. Every contribution, big or small, makes a real difference in someone's life.",
      action: "View Active Campaigns",
      href: "/campaigns/browse",
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Track Your Impact",
      description:
        "Follow campaign progress and see how your donations are making an impact. Receive updates on the causes you support and view your complete giving history.",
      action: "Sign Up to Track",
      href: "/signup?role=DONOR",
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Join the Community",
      description:
        "Become part of a growing community of donors and changemakers. See top contributors on the leaderboard and inspire others to give back.",
      action: "View Leaderboard",
      href: "/leaderboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-700 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            How It Works
          </h1>
          <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
            Four simple steps to make a meaningful impact. Join thousands of donors supporting verified charitable causes.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid gap-12 md:gap-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.number}
                className={`flex flex-col gap-8 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } items-center`}
              >
                {/* Icon + Number */}
                <div className="flex-shrink-0 relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-2xl flex items-center justify-center relative group hover:scale-105 transition-transform duration-300">
                    <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-white" strokeWidth={1.5} />
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-emerald-50">
                      <span className="text-2xl font-extrabold text-emerald-700">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-800 transition-all hover:shadow-xl"
                  >
                    {step.action}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* For Organizations CTA */}
      <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-6">
            <svg
              className="w-8 h-8 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Are You an Organization?
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Register your organization to create fundraising campaigns and reach thousands of potential donors. Our verification process ensures trust and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=PENDING_ORGANIZER"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-emerald-800 transition-all hover:shadow-xl"
            >
              Register as Organization
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}