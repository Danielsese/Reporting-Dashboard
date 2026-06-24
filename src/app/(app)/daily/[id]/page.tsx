import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { dailySchema, emptyDaily } from "@/lib/schemas/daily";
import { DailyForm } from "@/components/forms/daily-form";

export default async function DailyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("daily_reports")
    .select("id, report_date, status, data")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const merged = {
    ...emptyDaily(data.report_date),
    ...(data.data ?? {}),
    report_date: data.report_date,
  };
  const values = dailySchema.parse(merged);

  return <DailyForm defaultValues={values} id={data.id} status={data.status} />;
}
