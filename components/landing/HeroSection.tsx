import Link from "next/link";
import Image from "next/image";
import { Users, Trophy, Heart, Play, UserPlus } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-6 space-y-7 z-10">
            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              Play Golf.
              <br />
              Win Prizes.
              <br />
              Support{" "}
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
                Charities.              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A monthly draw-based platform where every subscription gives you a
              chance to win amazing prizes while supporting charitable causes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/signup?role=DONOR"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-md"
              >
                <UserPlus className="h-4 w-4" />
                <span>Join Now</span>
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 hover:border-slate-400"
              >
                <Play className="h-4 w-4 fill-slate-800 text-slate-800" />
                <span>How It Works</span>
              </Link>
            </div>

            {/* 3 Trust Metric Counters */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-none">2,500+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Active Subscribers</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-none">25+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Prizes Won</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800">
                  <Heart className="h-5 w-5 fill-emerald-800" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-none">15+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Charities Supported</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Image (6 cols) */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[360px] sm:h-[460px] w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80"
                alt="Golf ball near hole on green fairway"
                fill
                priority
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Floating Golf Ball & Hole Highlight Badge */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 backdrop-blur-md p-3.5 border border-white/40 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-sm shadow-xs">
                    ⛳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Monthly Charity Draw #42</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Grand Prize: ₹5,00,000 + Charity Grant</p>
                  </div>
                </div>
                <Link
                  href="/signup?role=DONOR"
                  className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800 transition"
                >
                  Enter Draw
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}