"use client";

import React from "react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: ActionItem[];
}

export default function QuickActions({
  actions,
}: QuickActionsProps) {
  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <h2
          id="quick-actions-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Frequently used shortcuts to manage your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="flex items-start gap-4 rounded-xl border border-slate-200 p-4 text-left transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              {action.icon}
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-slate-900">
                {action.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}