"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Charities", href: "/charities" },
  { label: "Draw Results", href: "/winner" },
  { label: "Contact", href: "/support" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <nav
        className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main Navigation"
      >
        {/* Brand Logo with golf icon & subtitle */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs group-hover:bg-emerald-800 transition">
            <svg
              className="h-6 w-6"
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
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              Golf Charity
            </span>
            <span className="text-[11px] font-medium text-emerald-700 tracking-wide mt-0.5">
              Play Better. Give Better.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-700 transition hover:text-emerald-700 hover:font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
          >
            Login
          </Link>

          <Link
            href="/signup?role=DONOR"
            className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="flex flex-col px-4 py-4 space-y-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800"
              >
                Login
              </Link>

              <Link
                href="/signup?role=DONOR"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-emerald-800"
              >
                Sign Up as Donor
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}