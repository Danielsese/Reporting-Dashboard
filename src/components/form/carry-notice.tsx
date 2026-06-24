import { Sparkles } from "lucide-react";

export function CarryNotice({
  count,
  unit,
}: {
  count: number;
  unit: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-indigo-200 bg-brand-soft px-4 py-3">
      <Sparkles className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
      <p className="text-sm text-foreground">
        <span className="font-medium">Auto-filled from {count} {unit}.</span>{" "}
        Revenue and roll-ups were pulled in automatically — review and edit
        anything before submitting.
      </p>
    </div>
  );
}
