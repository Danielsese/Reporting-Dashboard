import { createAdminClient } from "@/lib/supabase/admin";
import { prettyMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ReportList, type ReportRow } from "@/components/report-list";

const RATING_LABEL: Record<string, string> = {
  green: "Excellent",
  amber: "Stable",
  red: "Needs improvement",
};

export default async function MonthlyListPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("monthly_reports")
    .select("id, month, actual_revenue, overall_rating, status")
    .order("month", { ascending: false });

  const rows: ReportRow[] = (data ?? []).map((r) => ({
    id: r.id,
    href: `/monthly/${r.id}`,
    primary: prettyMonth(r.month),
    secondary: r.overall_rating
      ? `Rating: ${RATING_LABEL[r.overall_rating] ?? r.overall_rating}`
      : "—",
    metric:
      r.actual_revenue != null ? formatMoney(Number(r.actual_revenue)) : undefined,
    status: r.status,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Monthly reports"
        description="Your monthly manager reports."
        newHref="/monthly/new"
        newLabel="New monthly report"
      />
      <ReportList
        rows={rows}
        emptyHint="Start a monthly report — it auto-fills revenue and roll-ups from that month's weekly reports."
      />
    </div>
  );
}
