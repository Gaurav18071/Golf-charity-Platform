"use client";

import { usePathname } from "next/navigation";
import { PAGE_TITLES } from "@/constants/routes";

export function PageTitle() {
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <div className="min-w-0">
      <h1 className="truncate text-xl font-semibold tracking-tight">
        {title}
      </h1>
    </div>
  );
}