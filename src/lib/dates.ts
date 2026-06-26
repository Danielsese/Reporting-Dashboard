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

// ISO week string (Monday start), e.g. "2026-W26" — from BUILD_SPEC §5.
export function isoWeekStr(d: Date = new Date()) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (x.getUTCDay() + 6) % 7; // Mon = 0
  x.setUTCDate(x.getUTCDate() - day + 3); // nearest Thursday
  const firstTh = new Date(Date.UTC(x.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((x.getTime() - firstTh.getTime()) / 86400000 -
        3 +
        ((firstTh.getUTCDay() + 6) % 7)) /
        7,
    );
  return x.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}

// Current period key for a checklist cadence (drives free auto-reset).
export function periodKeyFor(
  checklist: "daily" | "weekly" | "monthly",
  d: Date = new Date(),
) {
  if (checklist === "weekly") return isoWeekStr(d);
  if (checklist === "monthly") return format(d, "yyyy-MM");
  return format(d, "yyyy-MM-dd");
}

export function prettyPeriod(
  checklist: "daily" | "weekly" | "monthly",
  d: Date = new Date(),
) {
  if (checklist === "weekly") {
    const { week_start, week_end } = weekRange(format(d, "yyyy-MM-dd"));
    return prettyWeek(week_start, week_end);
  }
  if (checklist === "monthly") return format(d, "MMMM yyyy");
  return format(d, "EEE, MMM d, yyyy");
}
