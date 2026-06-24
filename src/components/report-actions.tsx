"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionFn = (id: string) => Promise<unknown>;

interface Props {
  id: string;
  archived: boolean;
  archiveAction: ActionFn;
  restoreAction: ActionFn;
  deleteAction: ActionFn;
  /** Where to go after delete/archive (used on the report page). */
  redirectTo?: string;
  /** "menu" = compact icon buttons for list rows; "bar" = labelled buttons for the report page. */
  variant?: "menu" | "bar";
}

export function ReportActions({
  id,
  archived,
  archiveAction,
  restoreAction,
  deleteAction,
  redirectTo,
  variant = "menu",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function run(fn: ActionFn, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    await fn(id);
    setBusy(false);
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  const deleteMsg = "Delete this report permanently? This cannot be undone.";

  if (variant === "bar") {
    return (
      <div className="flex items-center gap-2">
        {archived ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => run(restoreAction)}
            disabled={busy}
          >
            <ArchiveRestore className="h-4 w-4" /> Restore
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => run(archiveAction)}
            disabled={busy}
          >
            <Archive className="h-4 w-4" /> Archive
          </Button>
        )}
        <Button
          type="button"
          variant="danger"
          onClick={() => run(deleteAction, deleteMsg)}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete
        </Button>
      </div>
    );
  }

  // Compact inline icon buttons for list rows (no dropdown → never clipped).
  return (
    <div className="flex items-center gap-1">
      {archived ? (
        <IconButton
          label="Restore"
          onClick={() => run(restoreAction)}
          busy={busy}
        >
          <ArchiveRestore className="h-4 w-4" />
        </IconButton>
      ) : (
        <IconButton
          label="Archive"
          onClick={() => run(archiveAction)}
          busy={busy}
        >
          <Archive className="h-4 w-4" />
        </IconButton>
      )}
      <IconButton
        label="Delete"
        danger
        onClick={() => run(deleteAction, deleteMsg)}
        busy={busy}
      >
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  busy,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted disabled:opacity-50",
        danger ? "hover:text-rag-red" : "hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
