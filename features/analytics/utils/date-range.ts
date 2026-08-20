export type DateRangePreset = "7d" | "30d" | "90d" | "this_month" | "last_month" | "all";

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate?: Date;
  endDate?: Date;
}

export function parseDateRange(preset?: string, from?: string, to?: string): DateRangeFilter {
  const now = new Date();

  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      return { preset: "all", startDate: start, endDate: end };
    }
  }

  switch (preset) {
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { preset: "7d", startDate: start, endDate: now };
    }
    case "30d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { preset: "30d", startDate: start, endDate: now };
    }
    case "90d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { preset: "90d", startDate: start, endDate: now };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { preset: "this_month", startDate: start, endDate: now };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { preset: "last_month", startDate: start, endDate: end };
    }
    case "all":
    default:
      return { preset: "all" };
  }
}
