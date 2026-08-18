import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-emerald-800 px-6 py-8 sm:px-10 sm:py-10 shadow-lg text-white">
          {/* Decorative golf background watermark */}
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center pr-10">
            <svg className="h-64 w-64 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 border border-emerald-600/60 text-white shadow-inner">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Ready to Join and Make a Difference?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
                  Subscribe today and be part of a community that plays, wins and gives back.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/signup?role=DONOR"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-900 shadow-md hover:bg-slate-50 transition"
              >
                <span>Subscribe Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}