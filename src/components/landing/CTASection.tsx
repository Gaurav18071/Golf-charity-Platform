import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const trustPoints = [
  "Free to Join",
  "Fair Competition",
  "Purpose Driven",
];

export default function CTASection() {
  return (
    <section className="section">
      <div className="container">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-16 text-center text-white shadow-2xl sm:px-10 lg:px-20">

          {/* Decorative Glow */}
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">

            {/* Badge */}
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              🚀 Join the Community
            </span>

            {/* Heading */}
            <h2 className="mt-8 text-4xl font-bold leading-tight sm:text-5xl">
              Ready to Make
              <br />
              Every Round Count?
            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-emerald-100">
              Become part of a growing golf community where competition,
              collaboration, and charitable impact come together. Your next
              round could create something bigger than a scorecard.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-700 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100"
              >
                Create Free Account
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/competitions"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                Explore Competitions
              </Link>

            </div>

            {/* Trust Points */}
            <div className="mt-10 flex flex-wrap justify-center gap-6">

              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-100"
                >
                  <CheckCircle2 size={18} />
                  {point}
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}