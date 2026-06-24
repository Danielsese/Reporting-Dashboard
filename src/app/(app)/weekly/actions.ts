"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseNum } from "@/lib/parse";
import { weeklySchema, type WeeklyValues } from "@/lib/schemas/weekly";

export async function saveWeekly(
  values: WeeklyValues,
  reportStatus: "draft" | "submitted",
): Promise<{ id?: string; error?: string }> {
  const parsed = weeklySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form data" };
  const v = parsed.data;

  const supabase = createAdminClient();

  const row = {
    week_start: v.week_start,
    week_end: v.week_end,
    total_revenue: parseNum(v.performance.total_revenue),
    best_model: v.performance.best_model || null,
    best_chatter: v.performance.best_chatter || null,
    status: reportStatus,
    data: v,
  };

  const { data, error } = await supabase
    .from("weekly_reports")
    .upsert(row, { onConflict: "week_start" })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/weekly");
  revalidatePath("/");
  return { id: data.id };
}

export async function deleteWeekly(id: string) {
  const supabase = createAdminClient();
  await supabase.from("weekly_reports").delete().eq("id", id);
  revalidatePath("/weekly");
}
