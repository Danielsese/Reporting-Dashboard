import { createAdminClient } from "@/lib/supabase/admin";
import { prettyWeek } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ReportList, type ReportRow } from "@/components/report-list";

export default async function WeeklyListPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("weekly_reports")
    .select("id, week_start, week_end, total_revenue, best_chatter, status")
    .order("week_start", { ascending: false });

  const rows: ReportRow[] = (data ?? []).map((r) => ({
    id: r.id,
    href: `/weekly/${r.id}`,
    primary: prettyWeek(r.week_start, r.week_end),
    secondary: r.best_chatter ? `Best chatter: ${r.best_chatter}` : "—",
    metric:
      r.total_revenue != null ? formatMoney(Number(r.total_revenue)) : undefined,
    status: r.status,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Weekly reports"
        description="Your weekly manager reports."
        newHref="/weekly/new"
        newLabel="New weekly report"
      />
      <ReportList
        rows={rows}
        emptyHint="Start a weekly report — it auto-fills revenue and roll-ups from that week's daily reports."
      />
    </div>
  );
}
