"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChecklistId } from "@/lib/checklist-content";

/** Checked item ids for a checklist's current period. */
export async function getChecked(
  checklist: ChecklistId,
  periodKey: string,
): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("checklist_state")
    .select("checked")
    .eq("checklist", checklist)
    .eq("period_key", periodKey)
    .maybeSingle();
  return Array.isArray(data?.checked) ? (data!.checked as string[]) : [];
}

/** Toggle one item on/off and persist the full set. Returns the new set. */
export async function setChecked(
  checklist: ChecklistId,
  periodKey: string,
  itemId: string,
  checked: boolean,
): Promise<{ checked: string[]; error?: string }> {
  const supabase = createAdminClient();
  const current = new Set(await getChecked(checklist, periodKey));
  if (checked) current.add(itemId);
  else current.delete(itemId);
  const next = Array.from(current);

  const { error } = await supabase
    .from("checklist_state")
    .upsert(
      {
        checklist,
        period_key: periodKey,
        checked: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "checklist,period_key" },
    );

  if (error) return { checked: Array.from(current), error: error.message };
  revalidatePath("/checklist");
  return { checked: next };
}

/** Clear the current period for one checklist. */
export async function resetChecklist(
  checklist: ChecklistId,
  periodKey: string,
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("checklist_state")
    .upsert(
      {
        checklist,
        period_key: periodKey,
        checked: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "checklist,period_key" },
    );
  if (error) return { error: error.message };
  revalidatePath("/checklist");
  return {};
}
