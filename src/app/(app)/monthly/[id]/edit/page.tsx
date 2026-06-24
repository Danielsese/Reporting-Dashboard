import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { monthlySchema, emptyMonthly } from "@/lib/schemas/monthly";
import { MonthlyForm } from "@/components/forms/monthly-form";

export default async function MonthlyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("monthly_reports")
    .select("id, month, status, data, archived_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const merged = {
    ...emptyMonthly(data.month),
    ...(data.data ?? {}),
    month: data.month,
  };
  const values = monthlySchema.parse(merged);

  return (
    <MonthlyForm
      defaultValues={values}
      id={data.id}
      status={data.status}
      archived={!!data.archived_at}
    />
  );
}
