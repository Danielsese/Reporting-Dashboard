import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { weeklySchema, emptyWeekly } from "@/lib/schemas/weekly";
import { WeeklyForm } from "@/components/forms/weekly-form";

export default async function WeeklyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("weekly_reports")
    .select("id, week_start, week_end, status, data, archived_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const merged = {
    ...emptyWeekly(data.week_start, data.week_end),
    ...(data.data ?? {}),
    week_start: data.week_start,
    week_end: data.week_end,
  };
  const values = weeklySchema.parse(merged);

  return (
    <WeeklyForm
      defaultValues={values}
      id={data.id}
      status={data.status}
      archived={!!data.archived_at}
      readOnly
    />
  );
}
