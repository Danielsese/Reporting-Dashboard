import { createAdminClient } from "@/lib/supabase/admin";
import { parseNum } from "@/lib/parse";
import { emptyWeekly, type WeeklyValues } from "@/lib/schemas/weekly";
import { emptyMonthly, type MonthlyValues } from "@/lib/schemas/monthly";
import { formatMoney } from "@/lib/utils";

const OFFENSE_LABELS: Record<string, string> = {
  no_follow_ups: "No follow-ups",
  poor_aftercare: "Poor aftercare",
  slow_response: "Slow response times",
  weak_setup: "Weak setup",
  low_engagement: "Low engagement",
};

function mode(values: (string | null | undefined)[]): string {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = "";
  let bestN = 0;
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

function uniqueLines(values: (string | null | undefined)[]): string {
  return Array.from(
    new Set(values.map((v) => (v ?? "").trim()).filter(Boolean)),
  ).join("\n");
}

/** Build a weekly report prefilled from this author's daily reports in the week. */
export async function carryWeekly(
  week_start: string,
  week_end: string,
): Promise<{ values: WeeklyValues; sourceCount: number }> {
  const base = emptyWeekly(week_start, week_end);
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("daily_reports")
    .select("revenue, top_model, top_chatter, data")
    .gte("report_date", week_start)
    .lte("report_date", week_end);

  const dailies = data ?? [];
  if (dailies.length === 0) return { values: base, sourceCount: 0 };

  const totalRevenue = dailies.reduce(
    (sum, d) => sum + (parseNum(d.revenue) ?? 0),
    0,
  );

  // Tally chat-quality offenses across the week.
  const offenseCounts = new Map<string, number>();
  const attentionLines: string[] = [];
  for (const d of dailies) {
    const issues = d.data?.chatQuality?.issues ?? {};
    for (const key of Object.keys(OFFENSE_LABELS)) {
      if (issues[key]) {
        offenseCounts.set(key, (offenseCounts.get(key) ?? 0) + 1);
      }
    }
    if (d.data?.summary?.members_attention) {
      attentionLines.push(d.data.summary.members_attention);
    }
  }
  const topOffenses = Array.from(offenseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => OFFENSE_LABELS[k]);

  base.performance.total_revenue = totalRevenue ? formatMoney(totalRevenue) : "";
  base.performance.best_model = mode(dailies.map((d) => d.top_model));
  base.performance.best_chatter = mode(dailies.map((d) => d.top_chatter));
  base.qc.common_offenses = [
    topOffenses[0] ?? "",
    topOffenses[1] ?? "",
    topOffenses[2] ?? "",
  ];
  base.coaching.needing_support = uniqueLines(attentionLines);

  return { values: base, sourceCount: dailies.length };
}

/** Build a monthly report prefilled from this author's weekly reports in the month. */
export async function carryMonthly(
  month: string, // yyyy-MM-01
  month_end: string,
): Promise<{ values: MonthlyValues; sourceCount: number }> {
  const base = emptyMonthly(month);
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("weekly_reports")
    .select("total_revenue, best_model, best_chatter, data")
    .gte("week_start", month)
    .lte("week_start", month_end);

  const weeklies = data ?? [];
  if (weeklies.length === 0) return { values: base, sourceCount: 0 };

  const actual = weeklies.reduce(
    (sum, w) => sum + (parseNum(w.total_revenue) ?? 0),
    0,
  );
  const topPerformers = uniqueLines(
    weeklies.map((w) => w.data?.coaching?.top_performers),
  );
  const support = uniqueLines(
    weeklies.map((w) => w.data?.coaching?.needing_support),
  );

  base.revenue.actual = actual ? formatMoney(actual) : "";
  base.call.overall_revenue = actual ? formatMoney(actual) : "";
  base.team.top_performers = topPerformers;
  base.team.needing_support = support;

  return { values: base, sourceCount: weeklies.length };
}
