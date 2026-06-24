"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FormProvider,
  type UseFormReturn,
  type FieldValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadOnlyProvider } from "@/components/form/readonly";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Loader2,
  Lock,
  Save,
  Send,
} from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";
type ReportStatus = "draft" | "submitted";

interface Props<T extends FieldValues> {
  methods: UseFormReturn<T>;
  onSave: (
    values: T,
    status: ReportStatus,
  ) => Promise<{ id?: string; error?: string }>;
  title: string;
  subtitle?: string;
  listHref: string;
  initialId?: string;
  initialStatus: ReportStatus;
  headerActions?: React.ReactNode;
  readOnly?: boolean;
  children: React.ReactNode;
}

export function ReportFormShell<T extends FieldValues>({
  methods,
  onSave,
  title,
  subtitle,
  listHref,
  initialId,
  initialStatus,
  headerActions,
  readOnly = false,
  children,
}: Props<T>) {
  const router = useRouter();
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [status, setStatus] = React.useState<ReportStatus>(initialStatus);
  const idRef = React.useRef<string | undefined>(initialId);
  const statusRef = React.useRef<ReportStatus>(initialStatus);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = React.useRef(false);

  const doSave = React.useCallback(
    async (nextStatus: ReportStatus) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaveState("saving");
      const res = await onSave(methods.getValues(), nextStatus);
      savingRef.current = false;
      if (res.error) {
        setSaveState("error");
        return;
      }
      statusRef.current = nextStatus;
      setStatus(nextStatus);
      setSaveState("saved");
      methods.reset(methods.getValues(), { keepValues: true });
      if (res.id && res.id !== idRef.current) {
        idRef.current = res.id;
        router.replace(`${listHref}/${res.id}/edit`);
      }
    },
    [methods, onSave, router, listHref],
  );

  // Debounced autosave on change (disabled in read-only view).
  React.useEffect(() => {
    if (readOnly) return;
    const sub = methods.watch(() => {
      setSaveState("idle");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => doSave(statusRef.current), 1500);
    });
    return () => sub.unsubscribe();
  }, [methods, doSave, readOnly]);

  const saveIndicator = {
    idle: null,
    saving: (
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    ),
    saved: (
      <span className="flex items-center gap-1.5 text-xs text-rag-green">
        <Check className="h-3.5 w-3.5" /> Saved
      </span>
    ),
    error: (
      <span className="flex items-center gap-1.5 text-xs text-rag-red">
        <CloudOff className="h-3.5 w-3.5" /> Save failed
      </span>
    ),
  }[saveState];

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-6 sm:px-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link
              href={listHref}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <Badge tone={status === "submitted" ? "green" : "neutral"}>
                {status === "submitted" ? "Submitted" : "Draft"}
              </Badge>
              {readOnly && (
                <Badge tone="neutral">
                  <Lock className="h-3 w-3" /> View only
                </Badge>
              )}
            </div>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </div>

        <ReadOnlyProvider value={readOnly}>
          <form className="flex flex-col gap-5">{children}</form>
        </ReadOnlyProvider>
      </div>

      {/* Sticky action bar — only in edit mode */}
      {!readOnly && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-20">{saveIndicator}</div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => doSave("draft")}
                disabled={saveState === "saving"}
              >
                <Save className="h-4 w-4" /> Save draft
              </Button>
              <Button
                type="button"
                onClick={() => doSave("submitted")}
                disabled={saveState === "saving"}
              >
                <Send className="h-4 w-4" /> Submit report
              </Button>
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  );
}
