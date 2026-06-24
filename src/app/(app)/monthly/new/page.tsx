import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayISO, monthRange } from "@/lib/dates";
import { carryMonthly } from "@/lib/autocarry";
import { MonthlyForm } from "@/components/forms/monthly-form";

export default async function NewMonthlyPage() {
  const { month_start, month_end } = monthRange(todayISO());
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("monthly_reports")
    .select("id")
    .eq("month", month_start)
    .maybeSingle();
  if (existing) redirect(`/monthly/${existing.id}`);

  const { values, sourceCount } = await carryMonthly(month_start, month_end);

  return (
    <MonthlyForm
      defaultValues={values}
      status="draft"
      carriedFrom={sourceCount}
    />
  );
}
