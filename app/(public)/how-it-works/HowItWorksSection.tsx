import Link from "next/link";
import {
  UserPlus,
  Flag,
  Goal,
  Heart,
  Trophy,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in minutes and become part of a growing golf community with a purpose.",
  },
  {
    number: "02",
    icon: Flag,
    title: "Join a Competition",
    description:
      "Browse active competitions and register for the event that suits you best.",
  },
  {
    number: "03",
    icon: Goal,
    title: "Play Your Round",
    description:
      "Enjoy your game and submit your score through the platform after completing your round.",
  },
  {
    number: "04",
    icon: Heart,
    title: "Support a Charity",
    description:
      "Every participation contributes toward meaningful charitable initiatives and community impact.",
  },
  {
    number: "05",
    icon: Trophy,
    title: "Celebrate Success",
    description:
      "Track the leaderboard, recognize winners, and celebrate the impact created together.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">

          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 How It Works
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From Registration
            <br />
            to Real Impact
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Join competitions, enjoy the game you love, support meaningful
            causes, and celebrate every achievement along the way.
          </p>

        </div>

        {/* Steps */}
        <div className="relative">

          {/* Desktop Timeline */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-slate-200 lg:block" />

          <div className="grid gap-8 lg:grid-cols-5">

            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step Number */}
                  <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Icon size={26} />
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>

                </article>
              );
            })}

          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">

          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-4 font-semibold text-white transition hover:bg-emerald-800"
          >
            Explore Competitions
            <ArrowRight size={18} />
          </Link>

        </div>

      </div>
    </section>
  );
}