import Link from "next/link";
import {
  Globe,
  Mail,
  Heart,
  Users,
} from "lucide-react";

const platformLinks = [
  { label: "Competitions", href: "/competitions" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Charities", href: "/charities" },
  { label: "Community", href: "/community" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "FAQ", href: "/faq" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
];

const socialLinks = [
  {
    icon: Globe,
    href: "https://github.com",
    label: "GitHub",
  },
  {
    icon: Users,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: Mail,
    href: "mailto:hello@golfcharity.com",
    label: "Email",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="container py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>

            <Link
              href="/"
              className="text-2xl font-bold text-white"
            >
              ⛳ Golf Charity
            </Link>

            <p className="mt-5 leading-7 text-slate-400">
              Bringing golfers, communities, and charities together
              through meaningful competition and lasting impact.
            </p>

            <div className="mt-8 flex gap-4">

              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="rounded-xl border border-slate-700 p-3 transition hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}

            </div>

          </div>

          {/* Platform */}
          <div>

            <h3 className="text-lg font-semibold text-white">
              Platform
            </h3>

            <ul className="mt-6 space-y-4">

              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Company */}
          <div>

            <h3 className="text-lg font-semibold text-white">
              Company
            </h3>

            <ul className="mt-6 space-y-4">

              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Legal */}
          <div>

            <h3 className="text-lg font-semibold text-white">
              Legal
            </h3>

            <ul className="mt-6 space-y-4">

              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

        </div>

        {/* Bottom Bar */}

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm text-slate-500 md:flex-row">

          <p>
            © {new Date().getFullYear()} Golf Charity. All rights reserved.
          </p>

          <p className="flex items-center gap-2">
            Made with
            <Heart
              size={16}
              className="fill-red-500 text-red-500"
            />
            for golfers and communities.
          </p>

        </div>

      </div>
    </footer>
  );
}