"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseNum } from "@/lib/parse";
import { dailySchema, type DailyValues } from "@/lib/schemas/daily";

export async function saveDaily(
  values: DailyValues,
  reportStatus: "draft" | "submitted",
): Promise<{ id?: string; error?: string }> {
  const parsed = dailySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form data" };
  const v = parsed.data;

  const supabase = createAdminClient();

  const row = {
    report_date: v.report_date,
    revenue: parseNum(v.kpi.revenue),
    top_model: v.kpi.top_model || null,
    top_chatter: v.kpi.top_chatter || null,
    status: reportStatus,
    data: v,
  };

  const { data, error } = await supabase
    .from("daily_reports")
    .upsert(row, { onConflict: "report_date" })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/daily");
  revalidatePath("/");
  return { id: data.id };
}

export async function deleteDaily(id: string) {
  const supabase = createAdminClient();
  await supabase.from("daily_reports").delete().eq("id", id);
  revalidatePath("/daily");
}
