import { createAdminClient } from "@/lib/supabase/admin";
import { prettyDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ReportList, type ReportRow } from "@/components/report-list";
import { ListTabs } from "@/components/list-tabs";
import { ReportActions } from "@/components/report-actions";
import { archiveDaily, restoreDaily, deleteDaily } from "./actions";

export default async function DailyListPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const archived = view === "archived";
  const supabase = createAdminClient();

  let query = supabase
    .from("daily_reports")
    .select("id, report_date, revenue, top_chatter, status")
    .order("report_date", { ascending: false });
  query = archived
    ? query.not("archived_at", "is", null)
    : query.is("archived_at", null);
  const { data } = await query;

  const rows: ReportRow[] = (data ?? []).map((r) => ({
    id: r.id,
    href: `/daily/${r.id}`,
    primary: prettyDate(r.report_date),
    secondary: r.top_chatter ? `Top chatter: ${r.top_chatter}` : "—",
    metric: r.revenue != null ? formatMoney(Number(r.revenue)) : undefined,
    status: r.status,
    actions: (
      <ReportActions
        id={r.id}
        archived={archived}
        archiveAction={archiveDaily}
        restoreAction={restoreDaily}
        deleteAction={deleteDaily}
      />
    ),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Daily reports"
        description="Your daily manager reports."
        newHref="/daily/new"
        newLabel="New daily report"
      />
      <ListTabs basePath="/daily" active={archived ? "archived" : "active"} />
      <ReportList
        rows={rows}
        emptyHint={
          archived
            ? "No archived daily reports."
            : "Start a new daily report to capture KPIs, whale CRM, chat quality and your end-of-day summary."
        }
      />
    </div>
  );
}
