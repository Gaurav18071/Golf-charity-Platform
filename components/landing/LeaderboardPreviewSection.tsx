import Link from "next/link";
import { ArrowRight, Crown, Medal, Trophy } from "lucide-react";

const podium = [
  {
    position: "2nd",
    title: "Second Position",
    subtitle: "Waiting for a challenger",
    icon: Medal,
    featured: false,
  },
  {
    position: "1st",
    title: "Champion Position",
    subtitle: "Reserved for the next winner",
    icon: Crown,
    featured: true,
  },
  {
    position: "3rd",
    title: "Third Position",
    subtitle: "Your journey starts here",
    icon: Trophy,
    featured: false,
  },
];

const leaderboard = [
  {
    rank: "#4",
    title: "Future Competitor",
  },
  {
    rank: "#5",
    title: "Future Competitor",
  },
  {
    rank: "#6",
    title: "Could Be You",
  },
];

export default function LeaderboardPreviewSection() {
  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            🏆 Live Leaderboard
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Compete.
            <br />
            Climb.
            Celebrate.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Every competition creates a new opportunity to earn recognition
            and inspire others through your achievements.
          </p>

        </div>

        {/* Podium */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-end">

          {podium.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.position}
                className={`surface flex flex-col items-center rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  item.featured
                    ? "border-2 border-amber-400 lg:-translate-y-6"
                    : ""
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    item.featured
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={30} />
                </div>

                <span className="mt-5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                  {item.position}
                </span>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-slate-600">
                  {item.subtitle}
                </p>

              </article>
            );
          })}

        </div>

        {/* Leaderboard Preview */}
        <div className="surface mx-auto mt-14 max-w-3xl rounded-2xl p-6">

          <div className="space-y-4">

            {leaderboard.map((player) => (
              <div
                key={player.rank}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <span className="font-bold text-slate-900">
                  {player.rank}
                </span>

                <span className="text-slate-600">
                  {player.title}
                </span>
              </div>
            ))}

          </div>

        </div>

        {/* CTA Card */}
        <div className="mt-12">

          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-10 text-center text-white">

            <h3 className="text-3xl font-bold">
              Ready to See Your Name Here?
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
              Join your first competition, climb the rankings, and become part
              of a community that plays with purpose.
            </p>

            <Link
              href="/competitions"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-emerald-700 transition hover:bg-slate-100"
            >
              Join Competition
              <ArrowRight size={18} />
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}