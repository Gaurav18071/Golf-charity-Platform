"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Charities", href: "/charities" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main Navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Golf Charity
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-green-700"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container flex flex-col py-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 px-4 py-3 text-center font-medium"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-green-700 px-4 py-3 text-center font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}