import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileText } from "lucide-react";

export interface ReportRow {
  id: string;
  href: string;
  primary: string;
  secondary?: string;
  metric?: string;
  status: "draft" | "submitted";
  author?: string;
  actions?: React.ReactNode;
}

export function ReportList({
  rows,
  emptyHint,
}: {
  rows: ReportRow[];
  emptyHint: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-muted">
          <FileText className="h-5 w-5" />
        </div>
        <p className="font-medium">Nothing here</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center">
            <Link
              href={row.href}
              className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-muted"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <p className="truncate font-medium">{row.primary}</p>
                  <Badge tone={row.status === "submitted" ? "green" : "neutral"}>
                    {row.status === "submitted" ? "Submitted" : "Draft"}
                  </Badge>
                </div>
                {row.secondary && (
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {row.secondary}
                    {row.author && (
                      <span className="text-muted"> · {row.author}</span>
                    )}
                  </p>
                )}
              </div>
              {row.metric && (
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{row.metric}</p>
                </div>
              )}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
            {row.actions && <div className="pr-3">{row.actions}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
