"use client";

import React from "react";
import StatsCard from "./StatsCard";

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section
      aria-label="Dashboard statistics"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <StatsCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
        />
      ))}
    </section>
  );
}