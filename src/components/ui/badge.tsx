import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "green" | "amber" | "red" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted border-border",
  green:
    "bg-green-50 text-rag-green border-green-200 dark:bg-green-500/10 dark:border-green-500/30",
  amber:
    "bg-amber-50 text-rag-amber border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30",
  red: "bg-red-50 text-rag-red border-red-200 dark:bg-red-500/10 dark:border-red-500/30",
  brand: "bg-brand-soft text-brand border-indigo-200 dark:border-indigo-500/30",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
