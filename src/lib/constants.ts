// Roster of models reviewed on the Daily "Missed Upsells Board".
// Pulled from the report template — adjust here as the roster changes.
export const MODELS = [
  "Sydney",
  "Figgy",
  "Julia",
  "Eliana",
  "Victoria",
] as const;

export const RAG_OPTIONS = [
  { value: "green", label: "Good", tone: "green" as const },
  { value: "amber", label: "Average", tone: "amber" as const },
  { value: "red", label: "Low", tone: "red" as const },
];

export type ReportKind = "daily" | "weekly" | "monthly";

export const REPORT_META: Record<
  ReportKind,
  { label: string; table: string; href: string }
> = {
  daily: { label: "Daily", table: "daily_reports", href: "/daily" },
  weekly: { label: "Weekly", table: "weekly_reports", href: "/weekly" },
  monthly: { label: "Monthly", table: "monthly_reports", href: "/monthly" },
};
