"use client";

import * as React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RAG_OPTIONS } from "@/lib/constants";
import { useReadOnly } from "@/components/form/readonly";
import { Plus, Trash2 } from "lucide-react";

export function TextField({
  name,
  label,
  placeholder,
  type = "text",
  prefix,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  const { register } = useFormContext();
  const ro = useReadOnly();
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            {prefix}
          </span>
        )}
        <Input
          id={name}
          type={type}
          placeholder={ro ? "—" : placeholder}
          readOnly={ro}
          className={cn(prefix && "pl-7", ro && "bg-surface-muted")}
          {...register(name)}
        />
      </div>
    </div>
  );
}

export function TextareaField({
  name,
  label,
  placeholder,
  rows = 3,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
}) {
  const { register } = useFormContext();
  const ro = useReadOnly();
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Textarea
        id={name}
        rows={rows}
        placeholder={ro ? "—" : placeholder}
        readOnly={ro}
        className={cn(ro && "bg-surface-muted")}
        {...register(name)}
      />
    </div>
  );
}

export function CheckboxField({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { register } = useFormContext();
  const ro = useReadOnly();
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-soft",
        ro ? "cursor-default" : "cursor-pointer hover:bg-brand-soft/50",
      )}
    >
      <input
        type="checkbox"
        disabled={ro}
        className="h-4 w-4 rounded border-border accent-[var(--color-brand)]"
        {...register(name)}
      />
      <span className="select-none">{label}</span>
    </label>
  );
}

export function RAGSelect({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  const ro = useReadOnly();
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex gap-2">
            {RAG_OPTIONS.map((opt) => {
              const active = field.value === opt.value;
              const ring = {
                green: "border-rag-green bg-green-50 text-rag-green",
                amber: "border-rag-amber bg-amber-50 text-rag-amber",
                red: "border-rag-red bg-red-50 text-rag-red",
              }[opt.tone];
              const dot = {
                green: "bg-rag-green",
                amber: "bg-rag-amber",
                red: "bg-rag-red",
              }[opt.tone];
              // In read-only mode, hide the unselected options for a cleaner view.
              if (ro && !active) return null;
              return (
                <button
                  type="button"
                  key={opt.value}
                  disabled={ro}
                  onClick={() => !ro && field.onChange(active ? "" : opt.value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? ring
                      : "border-border bg-surface text-muted hover:bg-surface-muted",
                    ro && "cursor-default",
                  )}
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
                  {opt.label}
                </button>
              );
            })}
            {ro && !field.value && (
              <span className="text-sm text-muted">— not set —</span>
            )}
          </div>
        )}
      />
    </div>
  );
}

export function NumberedThree({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const { register } = useFormContext();
  const ro = useReadOnly();
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-medium text-muted">
            {i + 1}
          </span>
          <Input
            readOnly={ro}
            className={cn(ro && "bg-surface-muted")}
            {...register(`${name}.${i}`)}
          />
        </div>
      ))}
    </div>
  );
}

interface RowField {
  name: string;
  placeholder: string;
  wide?: boolean;
}

export function RepeatableRows({
  name,
  label,
  fields,
  addLabel = "Add row",
}: {
  name: string;
  label?: string;
  fields: RowField[];
  addLabel?: string;
}) {
  const { control, register } = useFormContext();
  const ro = useReadOnly();
  const { fields: rows, append, remove } = useFieldArray({ control, name });

  const blank = Object.fromEntries(fields.map((f) => [f.name, ""]));

  return (
    <div className="flex flex-col gap-3">
      {label && <Label>{label}</Label>}
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-muted">
          None added.
        </p>
      )}
      {rows.map((row, idx) => (
        <div
          key={row.id}
          className="flex items-start gap-2 rounded-lg border border-border bg-surface-muted p-3"
        >
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              <Input
                key={f.name}
                placeholder={ro ? "—" : f.placeholder}
                readOnly={ro}
                className={cn("bg-surface", f.wide && "sm:col-span-2")}
                {...register(`${name}.${idx}.${f.name}`)}
              />
            ))}
          </div>
          {!ro && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(idx)}
              aria-label="Remove row"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {!ro && (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(blank)}
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
