"use client";

import { Users, Megaphone } from "lucide-react";

/**
 * SelectableRole
 *
 * The two roles a user can choose at signup.
 * ADMIN is not selectable — assigned manually.
 * PENDING_ORGANIZER is the initial state when Organizer is chosen.
 */
export type SelectableRole = "DONOR" | "PENDING_ORGANIZER";

interface RoleOption {
  value: SelectableRole;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "DONOR",
    title: "Donor",
    description: "Browse campaigns and donate to causes you care about.",
    icon: <Users className="h-6 w-6" />,
  },
  {
    value: "PENDING_ORGANIZER",
    title: "Organizer",
    description: "Create and manage fundraising campaigns for your cause.",
    icon: <Megaphone className="h-6 w-6" />,
  },
];

interface RoleSelectorProps {
  /** Currently selected role */
  value: SelectableRole;
  /** Called when user selects a different role */
  onChange: (role: SelectableRole) => void;
  /** Disable interaction while parent form is submitting */
  disabled?: boolean;
}

/**
 * RoleSelector
 *
 * Reusable card-style role picker for the signup flow.
 * Fully controlled — no internal state.
 * No business logic — purely presentational.
 *
 * Usage:
 *   <RoleSelector value={role} onChange={setRole} />
 */
export default function RoleSelector({
  value,
  onChange,
  disabled = false,
}: RoleSelectorProps) {
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-medium text-slate-700">
        I want to join as
      </legend>

      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={[
                "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-emerald-600 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {/* Icon */}
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {option.icon}
              </div>

              {/* Text */}
              <div>
                <p
                  className={[
                    "text-sm font-semibold",
                    isSelected ? "text-emerald-700" : "text-slate-900",
                  ].join(" ")}
                >
                  {option.title}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">
                  {option.description}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <span className="ml-auto mt-auto flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="h-2.5 w-2.5 text-white"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
