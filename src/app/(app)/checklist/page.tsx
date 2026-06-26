import { ChecklistView } from "@/components/checklist/checklist-view";
import { CHECKLIST_TABS, type ChecklistId } from "@/lib/checklist-content";
import { periodKeyFor, prettyPeriod } from "@/lib/dates";
import { getChecked } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const ids = CHECKLIST_TABS.map((t) => t.id);

  const periodKeys = {} as Record<ChecklistId, string>;
  const periodLabels = {} as Record<ChecklistId, string>;
  const initialChecked = {} as Record<ChecklistId, string[]>;

  for (const id of ids) {
    const key = periodKeyFor(id);
    periodKeys[id] = key;
    periodLabels[id] = prettyPeriod(id);
    initialChecked[id] = await getChecked(id, key);
  }

  return (
    <ChecklistView
      periodKeys={periodKeys}
      periodLabels={periodLabels}
      initialChecked={initialChecked}
    />
  );
}
