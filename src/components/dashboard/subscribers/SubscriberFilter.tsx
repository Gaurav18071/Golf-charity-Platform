"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "All", value: undefined },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
];

interface SubscriberFilterProps {
  activeFilter?: string;
}

export default function SubscriberFilter({ activeFilter }: SubscriberFilterProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const isActive = tab.value === activeFilter;
        const href = tab.value ? `${pathname}?verified=${tab.value}` : pathname;

        return (
          <Link
            key={tab.label}
            href={href}
            className={[
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
