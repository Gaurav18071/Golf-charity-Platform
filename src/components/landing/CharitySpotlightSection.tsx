import Link from "next/link";
import {
  HeartHandshake,
  GraduationCap,
  HeartPulse,
  Leaf,
  Users,
  ArrowRight,
} from "lucide-react";

const impactAreas = [
  {
    icon: GraduationCap,
    title: "Education",
    description:
      "Creating opportunities for future generations through learning initiatives.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare",
    description:
      "Supporting programs that improve health and well-being within communities.",
  },
  {
    icon: Leaf,
    title: "Environment",
    description:
      "Encouraging sustainability and protecting natural spaces for future generations.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Building stronger communities through collaboration and shared purpose.",
  },
];

export default function CharitySpotlightSection() {
  return (
    <section className="section bg-gradient-to-b from-emerald-50/40 to-transparent">
      <div className="container">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
            ❤️ Charity Spotlight
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Every Round Creates
            <br />
            Real Impact
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            We believe golf can do more than create champions—it can unite
            communities and support meaningful causes through every competition.
          </p>

        </div>

        {/* Featured Mission */}
        <div className="surface mt-16 overflow-hidden rounded-3xl">

          <div className="grid gap-10 p-10 lg:grid-cols-2 lg:items-center">

            {/* Left */}
            <div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <HeartHandshake size={32} />
              </div>

              <h3 className="mt-6 text-3xl font-bold text-slate-900">
                Playing for a Greater Purpose
              </h3>

              <p className="mt-6 leading-8 text-slate-600">
                Every competition connects the excitement of golf with the
                opportunity to create positive change. Together, players,
                organizers, and communities become part of something much
                bigger than a leaderboard.
              </p>

              <Link
                href="/charities"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-4 font-semibold text-white transition hover:bg-emerald-800"
              >
                Learn About Our Mission
                <ArrowRight size={18} />
              </Link>

            </div>

            {/* Right */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-10 text-white">

              <div className="text-6xl">🌍</div>

              <h4 className="mt-6 text-2xl font-bold">
                Sport Meets Social Impact
              </h4>

              <p className="mt-4 leading-8 text-emerald-50">
                Every golfer who joins the platform contributes toward a mission
                of bringing people together through sport, generosity, and
                community engagement.
              </p>

            </div>

          </div>

        </div>

        {/* Impact Areas */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {impactAreas.map((area) => {
            const Icon = area.icon;

            return (
              <article
                key={area.title}
                className="surface group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-all group-hover:bg-emerald-700 group-hover:text-white">
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {area.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {area.description}
                </p>

              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
}