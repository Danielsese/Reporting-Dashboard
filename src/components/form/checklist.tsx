"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/form/fields";
import { Badge } from "@/components/ui/badge";

export interface ChecklistItem {
  key: string;
  label: string;
}

/** Tick-box run-through checklist with a live "x/y done" progress badge. */
export function ManagerChecklist({
  name,
  items,
}: {
  name: string;
  items: ChecklistItem[];
}) {
  const { control } = useFormContext();
  const values = useWatch({ control, name }) as
    | Record<string, boolean>
    | undefined;
  const done = items.filter((i) => values?.[i.key]).length;
  const complete = done === items.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Tick each task as you complete it.</p>
        <Badge tone={complete ? "green" : "neutral"}>
          {done}/{items.length} done
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((i) => (
          <CheckboxField key={i.key} name={`${name}.${i.key}`} label={i.label} />
        ))}
      </div>
    </div>
  );
}
