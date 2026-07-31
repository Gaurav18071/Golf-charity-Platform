import Link from "next/link";
import {
  Trophy,
  HeartHandshake,
  Medal,
  Users,
  ShieldCheck,
  Flag,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Flag,
    title: "Golf Competitions",
    description:
      "Join exciting competitions designed for golfers of all skill levels and compete in a fair environment.",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description:
      "Track rankings in real time and celebrate achievements throughout every competition.",
  },
  {
    icon: HeartHandshake,
    title: "Charity Support",
    description:
      "Every competition contributes toward meaningful charitable initiatives and community impact.",
  },
  {
    icon: Medal,
    title: "Rewards & Recognition",
    description:
      "Earn recognition for your participation and celebrate your accomplishments with the community.",
  },
  {
    icon: Users,
    title: "Growing Community",
    description:
      "Connect with passionate golfers who share your competitive spirit and commitment to giving back.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    description:
      "Built with transparency, fairness, and secure account management for every participant.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">

          <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            ⭐ Platform Features
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need
            <br />
            in One Platform
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Experience a platform built for golfers, communities, and charities
            with everything you need to participate, compete, and make a
            meaningful impact.
          </p>

        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="surface group flex h-full flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-violet-300 hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-4 flex-grow leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}

        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex justify-center">

          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-4 font-semibold text-white transition hover:bg-violet-800"
          >
            Explore All Features
            <ArrowRight size={18} />
          </Link>

        </div>

      </div>
    </section>
  );
}