"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseNum } from "@/lib/parse";
import { monthlySchema, type MonthlyValues } from "@/lib/schemas/monthly";

export async function saveMonthly(
  values: MonthlyValues,
  reportStatus: "draft" | "submitted",
): Promise<{ id?: string; error?: string }> {
  const parsed = monthlySchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid form data" };
  const v = parsed.data;

  const supabase = createAdminClient();

  const row = {
    month: v.month,
    target_revenue: parseNum(v.revenue.target),
    actual_revenue: parseNum(v.revenue.actual),
    overall_rating: v.exec.overall_rating || null,
    status: reportStatus,
    data: v,
  };

  const { data, error } = await supabase
    .from("monthly_reports")
    .upsert(row, { onConflict: "month" })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/monthly");
  revalidatePath("/");
  return { id: data.id };
}

export async function deleteMonthly(id: string) {
  const supabase = createAdminClient();
  await supabase.from("monthly_reports").delete().eq("id", id);
  revalidatePath("/monthly");
}
