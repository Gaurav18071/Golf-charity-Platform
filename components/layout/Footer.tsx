"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0B3B24] text-emerald-100 border-t border-emerald-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="18" r="3" fill="white" />
                  <path d="M12 2v13" />
                  <path d="M12 3l6 4-6 4" fill="white" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white leading-none">
                  Golf Charity
                </span>
                <span className="text-[11px] text-emerald-300 font-medium mt-0.5">
                  Play Better. Give Better.
                </span>
              </div>
            </Link>

            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm">
              A subscription-based golf platform that combines the thrill of the game with the joy of giving.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  aria-label={platform}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-200 hover:bg-emerald-700 hover:text-white transition text-xs font-bold"
                >
                  {platform.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Home", href: "/" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Charities", href: "/charities" },
                { label: "Draw Results", href: "/winner" },
                { label: "Contact Us", href: "/support" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-emerald-200/80 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Terms & Conditions", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Refund Policy", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-emerald-200/80 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Subscribe to get updates on draws, winners and charity stories.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2 pt-1"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-emerald-800 bg-[#072B1A] px-3.5 py-2.5 text-xs text-white placeholder-emerald-400/60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-emerald-900/60 text-center text-xs text-emerald-400/70">
          © 2026 Golf Charity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}