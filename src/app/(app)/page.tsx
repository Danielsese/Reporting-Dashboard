import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseNum } from "@/lib/parse";
import { formatMoney } from "@/lib/utils";
import { todayISO, monthRange, prettyDate } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RevenueTrend, type TrendPoint } from "@/components/charts/revenue-trend";
import {
  CalendarDays,
  CalendarRange,
  CalendarClock,
  DollarSign,
  Fish,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const today = todayISO();
  const { month_start, month_end } = monthRange(today);
  const since = format(subDays(parseISO(today), 29), "yyyy-MM-dd");

  const { data: dailyData } = await supabase
    .from("daily_reports")
    .select("report_date, revenue, data, status")
    .is("archived_at", null)
    .gte("report_date", since)
    .order("report_date", { ascending: true });

  const dailies = dailyData ?? [];

  const trend: TrendPoint[] = dailies.map((d) => ({
    label: format(parseISO(d.report_date), "MMM d"),
    revenue: parseNum(d.revenue) ?? 0,
  }));

  const monthRevenue = dailies
    .filter((d) => d.report_date >= month_start && d.report_date <= month_end)
    .reduce((s, d) => s + (parseNum(d.revenue) ?? 0), 0);

  const latestWithWhales = [...dailies]
    .reverse()
    .find((d) => d.data?.whaleCrm?.active_whales);
  const activeWhales = latestWithWhales?.data?.whaleCrm?.active_whales ?? "—";

  const submittedThisMonth = dailies.filter(
    (d) =>
      d.status === "submitted" &&
      d.report_date >= month_start &&
      d.report_date <= month_end,
  ).length;

  const quickLinks = [
    { href: "/daily/new", label: "Daily report", icon: CalendarDays },
    { href: "/weekly/new", label: "Weekly report", icon: CalendarRange },
    { href: "/monthly/new", label: "Monthly report", icon: CalendarClock },
  ];

  const recent = [...dailies]
    .reverse()
    .slice(0, 5)
    .map((d) => ({
      date: d.report_date,
      revenue: d.revenue != null ? formatMoney(Number(d.revenue)) : "—",
    }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">{prettyDate(today)}</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Revenue this month"
          value={formatMoney(monthRevenue)}
          icon={DollarSign}
        />
        <StatCard
          label="Active whales (latest)"
          value={String(activeWhales)}
          icon={Fish}
        />
        <StatCard
          label="Dailies submitted (month)"
          value={String(submittedThisMonth)}
          icon={CheckCircle2}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueTrend data={trend} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Start a report</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickLinks.map((q) => {
              const Icon = q.icon;
              return (
                <Link key={q.href} href={q.href}>
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface-muted">
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <Icon className="h-4.5 w-4.5 text-brand" />
                      {q.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent daily reports</CardTitle>
            <Link href="/daily">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No reports yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((r) => (
                  <li
                    key={r.date}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span>{prettyDate(r.date)}</span>
                    <span className="font-medium">{r.revenue}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
