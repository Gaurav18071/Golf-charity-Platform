"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "All", value: undefined },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

interface DonationStatusFilterProps {
  activeStatus?: string;
}

export default function DonationStatusFilter({
  activeStatus,
}: DonationStatusFilterProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const isActive = tab.value === activeStatus;
        const href = tab.value ? `${pathname}?status=${tab.value}` : pathname;

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
