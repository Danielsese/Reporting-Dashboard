"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
} from "lucide-react";

type ActionFn = (id: string) => Promise<unknown>;

interface Props {
  id: string;
  archived: boolean;
  archiveAction: ActionFn;
  restoreAction: ActionFn;
  deleteAction: ActionFn;
  /** Where to go after delete/archive (used on the report page). */
  redirectTo?: string;
  /** "menu" = kebab dropdown for list rows; "bar" = inline buttons for the report page. */
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
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function run(fn: ActionFn, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    await fn(id);
    setBusy(false);
    setOpen(false);
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        aria-label="Report actions"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
          {archived ? (
            <MenuItem onClick={() => run(restoreAction)} icon={ArchiveRestore}>
              Restore
            </MenuItem>
          ) : (
            <MenuItem onClick={() => run(archiveAction)} icon={Archive}>
              Archive
            </MenuItem>
          )}
          <MenuItem
            onClick={() => run(deleteAction, deleteMsg)}
            icon={Trash2}
            danger
          >
            Delete
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  icon: Icon,
  danger,
  children,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-muted ${
        danger ? "text-rag-red" : "text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}
