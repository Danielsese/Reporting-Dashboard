import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";

// Reports use Monday-started weeks.
export const WEEK_OPTS = { weekStartsOn: 1 as const };

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function isoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function weekRange(dateISO: string) {
  const d = parseISO(dateISO);
  return {
    week_start: isoDate(startOfWeek(d, WEEK_OPTS)),
    week_end: isoDate(endOfWeek(d, WEEK_OPTS)),
  };
}

export function monthRange(dateISO: string) {
  const d = parseISO(dateISO);
  return {
    month_start: isoDate(startOfMonth(d)),
    month_end: isoDate(endOfMonth(d)),
  };
}

export function prettyDate(dateISO: string) {
  return format(parseISO(dateISO), "EEE, MMM d, yyyy");
}

export function prettyWeek(week_start: string, week_end: string) {
  return `${format(parseISO(week_start), "MMM d")} – ${format(
    parseISO(week_end),
    "MMM d, yyyy",
  )}`;
}

export function prettyMonth(monthISO: string) {
  return format(parseISO(monthISO), "MMMM yyyy");
}
