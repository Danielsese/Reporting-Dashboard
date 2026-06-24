import { createAdminClient } from "@/lib/supabase/admin";
import { prettyDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ReportList, type ReportRow } from "@/components/report-list";

export default async function DailyListPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("daily_reports")
    .select("id, report_date, revenue, top_chatter, status")
    .order("report_date", { ascending: false });

  const rows: ReportRow[] = (data ?? []).map((r) => ({
    id: r.id,
    href: `/daily/${r.id}`,
    primary: prettyDate(r.report_date),
    secondary: r.top_chatter ? `Top chatter: ${r.top_chatter}` : "—",
    metric: r.revenue != null ? formatMoney(Number(r.revenue)) : undefined,
    status: r.status,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Daily reports"
        description="Your daily manager reports."
        newHref="/daily/new"
        newLabel="New daily report"
      />
      <ReportList
        rows={rows}
        emptyHint="Start a new daily report to capture KPIs, whale CRM, chat quality and your end-of-day summary."
      />
    </div>
  );
}
