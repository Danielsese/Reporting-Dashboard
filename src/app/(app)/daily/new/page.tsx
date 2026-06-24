import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayISO } from "@/lib/dates";
import { emptyDaily } from "@/lib/schemas/daily";
import { DailyForm } from "@/components/forms/daily-form";

export default async function NewDailyPage() {
  const today = todayISO();
  const supabase = createAdminClient();

  // If a report for today already exists, edit it instead of duplicating.
  const { data: existing } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", today)
    .maybeSingle();
  if (existing) redirect(`/daily/${existing.id}`);

  return <DailyForm defaultValues={emptyDaily(today)} status="draft" />;
}
