import Link from "next/link";
import Image from "next/image";
import { Trophy, ArrowRight, Heart, Users } from "lucide-react";

interface CampaignData {
  id: string;
  slug?: string;
  title: string;
  shortDescription: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  coverImageUrl?: string | null;
  organizationName?: string;
}

interface LiveShowcaseProps {
  featuredCampaign?: CampaignData | null;
  recentCampaigns?: CampaignData[];
}

const LEADERBOARD_ROWS = [
  { rank: "🥇", name: "Arjun Mehta", score: 45, date: "May 14, 2026", avatar: "AM" },
  { rank: "🥈", name: "Rahul Sharma", score: 43, date: "May 13, 2026", avatar: "RS" },
  { rank: "🥉", name: "Vikram Singh", score: 42, date: "May 12, 2026", avatar: "VS" },
  { rank: "4", name: "Neeraj Kapoor", score: 41, date: "May 12, 2026", avatar: "NK" },
  { rank: "5", name: "Siddharth Rao", score: 40, date: "May 11, 2026", avatar: "SR" },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function LiveShowcaseSection({
  featuredCampaign,
  recentCampaigns = [],
}: LiveShowcaseProps) {
  const feat = featuredCampaign || {
    id: "featured-default",
    slug: "education-for-all",
    title: "Education for All",
    shortDescription: "Providing quality education and learning resources to underprivileged children.",
    category: "EDUCATION",
    goalAmount: 250000,
    currentAmount: 125000,
    coverImageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
    organizationName: "Vidya Jyoti Foundation",
  };

  const featGoal = Number(feat.goalAmount) || 250000;
  const featCurrent = Number(feat.currentAmount) || 125000;
  const featPercent = Math.min(100, Math.round((featCurrent / featGoal) * 100));

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2-Column Grid: Leaderboard & Featured Charity */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Latest Leaderboard Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Latest Leaderboard
                </h3>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                >
                  <span>View Full Leaderboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-100">
                      <th className="pb-3 pl-1">Rank</th>
                      <th className="pb-3">Player</th>
                      <th className="pb-3 text-center">Score</th>
                      <th className="pb-3 text-right pr-1">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {LEADERBOARD_ROWS.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 pl-1 font-bold text-slate-800 text-sm">
                          {row.rank}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              {row.avatar}
                            </div>
                            <span className="font-semibold text-slate-900">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center font-bold text-emerald-700 text-sm">
                          {row.score}
                        </td>
                        <td className="py-3 text-right pr-1 text-slate-500">
                          {row.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/leaderboard"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
              >
                Go to Leaderboard
              </Link>
            </div>
          </div>

          {/* Right: Featured Charity Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                  Featured Charity
                </h3>
                <Link
                  href="/charities"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                >
                  <span>View All Charities</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 mt-4 border border-slate-100 shadow-2xs">
                <Image
                  src={feat.coverImageUrl || "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80"}
                  alt={feat.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="self-start rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-slate-900 uppercase tracking-wider shadow-xs mb-1">
                    {feat.category}
                  </span>
                  <h4 className="text-lg font-extrabold text-white leading-tight">
                    {feat.title}
                  </h4>
                </div>
              </div>

              {/* Description & Progress */}
              <p className="mt-3.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {feat.shortDescription}
              </p>

              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700">{formatCurrency(featCurrent)} raised</span>
                  <span className="text-slate-500">{formatCurrency(featGoal)} goal</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${featPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href={`/campaigns/${feat.slug || feat.id}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
              >
                <span>Support This Cause / Donate</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Active Campaigns Showcase */}
        {recentCampaigns.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Explore Active Causes
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Browse verified charitable campaigns and contribute as a donor today.
                </p>
              </div>
              <Link
                href="/campaigns/browse"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>View All {recentCampaigns.length} Campaigns</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentCampaigns.map((camp) => {
                const goal = Number(camp.goalAmount) || 100000;
                const current = Number(camp.currentAmount) || 0;
                const percent = Math.min(100, Math.round((current / goal) * 100));

                return (
                  <div
                    key={camp.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        {camp.coverImageUrl ? (
                          <Image
                            src={camp.coverImageUrl}
                            alt={camp.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900 to-teal-950 text-emerald-300">
                            <Heart className="h-10 w-10 opacity-40" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-slate-900 uppercase tracking-wider shadow-xs">
                          {camp.category.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                          <Link href={`/campaigns/${camp.slug || camp.id}`}>
                            {camp.title}
                          </Link>
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {camp.shortDescription}
                        </p>

                        <div className="pt-2 space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-emerald-700">{formatCurrency(current)}</span>
                            <span className="text-slate-500">{formatCurrency(goal)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card CTA */}
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                      <Link
                        href={`/campaigns/${camp.slug || camp.id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
                      >
                        <span>Support Cause / Donate</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
