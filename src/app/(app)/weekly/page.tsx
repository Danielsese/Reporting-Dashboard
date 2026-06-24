import { createAdminClient } from "@/lib/supabase/admin";
import { prettyWeek } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ReportList, type ReportRow } from "@/components/report-list";
import { ListTabs } from "@/components/list-tabs";
import { ReportActions } from "@/components/report-actions";
import { archiveWeekly, restoreWeekly, deleteWeekly } from "./actions";

export default async function WeeklyListPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const archived = view === "archived";
  const supabase = createAdminClient();

  let query = supabase
    .from("weekly_reports")
    .select("id, week_start, week_end, total_revenue, best_chatter, status")
    .order("week_start", { ascending: false });
  query = archived
    ? query.not("archived_at", "is", null)
    : query.is("archived_at", null);
  const { data } = await query;

  const rows: ReportRow[] = (data ?? []).map((r) => ({
    id: r.id,
    href: `/weekly/${r.id}`,
    primary: prettyWeek(r.week_start, r.week_end),
    secondary: r.best_chatter ? `Best chatter: ${r.best_chatter}` : "—",
    metric:
      r.total_revenue != null ? formatMoney(Number(r.total_revenue)) : undefined,
    status: r.status,
    actions: (
      <ReportActions
        id={r.id}
        archived={archived}
        archiveAction={archiveWeekly}
        restoreAction={restoreWeekly}
        deleteAction={deleteWeekly}
      />
    ),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Weekly reports"
        description="Your weekly manager reports."
        newHref="/weekly/new"
        newLabel="New weekly report"
      />
      <ListTabs basePath="/weekly" active={archived ? "archived" : "active"} />
      <ReportList
        rows={rows}
        emptyHint={
          archived
            ? "No archived weekly reports."
            : "Start a weekly report — it auto-fills revenue and roll-ups from that week's daily reports."
        }
      />
    </div>
  );
}
