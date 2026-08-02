"use client";

interface SortSelectProps {
  defaultValue: string;
  q?: string;
  status?: string;
}

const SORT_OPTIONS = [
  { label: "Newest",      value: "newest" },
  { label: "Most Raised", value: "raised" },
  { label: "Oldest",      value: "oldest" },
];

/**
 * SortSelect
 *
 * Client component — auto-submits its parent form when the sort value changes.
 * Extracted from Browse Campaigns page (Server Component) so we can use onChange.
 */
export default function SortSelect({ defaultValue, q, status }: SortSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("sort", e.target.value);
    window.location.href = `/campaigns/browse?${params.toString()}`;
  };

  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      onChange={handleChange}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
