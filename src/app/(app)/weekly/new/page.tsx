import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayISO, weekRange } from "@/lib/dates";
import { carryWeekly } from "@/lib/autocarry";
import { WeeklyForm } from "@/components/forms/weekly-form";

export default async function NewWeeklyPage() {
  const { week_start, week_end } = weekRange(todayISO());
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("weekly_reports")
    .select("id")
    .eq("week_start", week_start)
    .maybeSingle();
  if (existing) redirect(`/weekly/${existing.id}`);

  const { values, sourceCount } = await carryWeekly(week_start, week_end);

  return (
    <WeeklyForm
      defaultValues={values}
      status="draft"
      carriedFrom={sourceCount}
    />
  );
}
