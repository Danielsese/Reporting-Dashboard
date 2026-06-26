"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CHECKLISTS,
  CHECKLIST_TABS,
  REMINDERS,
  allItemIds,
  itemId,
  type Checklist,
  type ChecklistCard,
  type ChecklistId,
  type ChecklistItem,
} from "@/lib/checklist-content";
import { setChecked, resetChecklist } from "@/app/(app)/checklist/actions";
import {
  Check,
  RotateCcw,
  Printer,
  ArrowRight,
  AlertTriangle,
  ListChecks,
} from "lucide-react";

type Tab = ChecklistId | "reminders";

export function ChecklistView({
  periodKeys,
  periodLabels,
  initialChecked,
}: {
  periodKeys: Record<ChecklistId, string>;
  periodLabels: Record<ChecklistId, string>;
  initialChecked: Record<ChecklistId, string[]>;
}) {
  const [tab, setTab] = React.useState<Tab>("daily");
  const [checked, setCheckedState] = React.useState<
    Record<ChecklistId, Set<string>>
  >({
    daily: new Set(initialChecked.daily),
    weekly: new Set(initialChecked.weekly),
    monthly: new Set(initialChecked.monthly),
  });

  function toggle(id: ChecklistId, key: string) {
    const set = new Set(checked[id]);
    const next = !set.has(key);
    if (next) set.add(key);
    else set.delete(key);
    setCheckedState((c) => ({ ...c, [id]: set }));
    void setChecked(id, periodKeys[id], key, next);
  }

  function reset(id: ChecklistId) {
    if (!window.confirm(`Reset the ${id} checklist for this period?`)) return;
    setCheckedState((c) => ({ ...c, [id]: new Set() }));
    void resetChecklist(id, periodKeys[id]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ops Checklist
          </h1>
          <p className="mt-1 text-sm text-muted">
            Chat Manager operating rhythm. Ticks save automatically and reset
            each period.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Printer className="h-4 w-4" /> Print all
        </button>
      </div>

      {/* Tabs */}
      <div className="no-print mb-6 flex flex-wrap gap-1 border-b border-border">
        {[...CHECKLIST_TABS, { id: "reminders", label: "Reminders" }].map(
          (t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={cn(
                "-mb-px border-b-2 px-3.5 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-gold text-gold"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ),
        )}
      </div>

      {CHECKLIST_TABS.map((t) => {
        const list = CHECKLISTS[t.id];
        return (
          <section
            key={t.id}
            className={cn(tab === t.id ? "block" : "hidden print-show")}
          >
            <ChecklistPanel
              list={list}
              checked={checked[t.id]}
              periodLabel={periodLabels[t.id]}
              onToggle={(key) => toggle(t.id, key)}
              onReset={() => reset(t.id)}
            />
          </section>
        );
      })}

      <section
        className={cn(tab === "reminders" ? "block" : "hidden print-show")}
      >
        <RemindersPanel />
      </section>
    </div>
  );
}

function ChecklistPanel({
  list,
  checked,
  periodLabel,
  onToggle,
  onReset,
}: {
  list: Checklist;
  checked: Set<string>;
  periodLabel: string;
  onToggle: (key: string) => void;
  onReset: () => void;
}) {
  const ids = allItemIds(list);
  const done = ids.filter((id) => checked.has(id)).length;
  const total = ids.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{list.intro}</p>

      <div className="mb-6 rounded-[var(--radius-card)] border border-border bg-surface p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="ops-mono text-xs uppercase tracking-wider text-muted">
            {periodLabel}
          </span>
          <div className="flex items-center gap-3">
            <span className="ops-mono text-sm font-semibold">
              {done} / {total}
              <span className="ml-2 text-muted">{pct}%</span>
            </span>
            <button
              onClick={onReset}
              className="no-print inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-rag-green transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col">
        {list.phases.map((phase, pi) => {
          const phaseIds = phase.cards.flatMap((c) =>
            c.items.map((_, i) => itemId(c.id, i)),
          );
          const phaseDone = phaseIds.every((id) => checked.has(id));
          const isLast = pi === list.phases.length - 1;
          return (
            <div key={pi} className="flex gap-4">
              {/* Spine */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    phaseDone
                      ? "border-gold bg-gold text-white"
                      : "border-border bg-surface text-muted",
                  )}
                >
                  {phaseDone ? <Check className="h-4 w-4" /> : pi + 1}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1",
                      phaseDone ? "bg-gold" : "bg-border",
                    )}
                  />
                )}
              </div>

              {/* Phase content */}
              <div className={cn("flex-1", isLast ? "pb-2" : "pb-8")}>
                <div className="mb-3">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {phase.title}
                  </h2>
                  {phase.subtitle && (
                    <p className="text-xs text-muted">{phase.subtitle}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {phase.cards.map((card) => (
                    <CardBlock
                      key={card.id}
                      card={card}
                      checked={checked}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardBlock({
  card,
  checked,
  onToggle,
}: {
  card: ChecklistCard;
  checked: Set<string>;
  onToggle: (key: string) => void;
}) {
  const ids = card.items.map((_, i) => itemId(card.id, i));
  const cardDone = ids.every((id) => checked.has(id));

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-opacity",
        cardDone && "opacity-60",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold">{card.title}</h3>
        {cardDone && (
          <Check className="h-3.5 w-3.5 text-rag-green" aria-label="done" />
        )}
      </div>
      <p className="mb-3 text-xs italic text-muted">{card.intro}</p>
      {card.note && (
        <p className="mb-3 rounded-md border border-border bg-surface-muted px-3 py-2 text-xs text-muted">
          {card.note}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {card.items.map((item, i) => {
          const id = itemId(card.id, i);
          return (
            <ItemRow
              key={id}
              item={item}
              checkedItem={checked.has(id)}
              onToggle={() => onToggle(id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  checkedItem,
  onToggle,
}: {
  item: ChecklistItem;
  checkedItem: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-start gap-3 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-surface-muted"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          checkedItem
            ? "border-rag-green bg-rag-green text-white"
            : "border-border group-hover:border-rag-green/50",
        )}
      >
        {checkedItem && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm",
              checkedItem && "text-muted line-through",
            )}
          >
            {item.text}
          </span>
          {item.chip && <Chip label={item.chip} tone={item.chipTone} />}
        </span>
        {item.action && (
          <span className="mt-1 flex items-center gap-1.5 text-xs text-gold">
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            {item.action}
          </span>
        )}
      </span>
    </button>
  );
}

function Chip({ label, tone }: { label: string; tone?: "gold" | "red" }) {
  const red = tone === "red";
  return (
    <span
      className={cn(
        "ops-mono inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium",
        red
          ? "border-rag-red/40 bg-red-50 text-rag-red dark:bg-red-500/10"
          : "border-gold/40 bg-gold-soft text-gold",
      )}
    >
      {label}
    </span>
  );
}

function RemindersPanel() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        Standing rules for the role. No checkboxes — just the guardrails.
      </p>
      <div className="grid gap-3">
        {REMINDERS.rules.map((r, i) => (
          <div
            key={i}
            className={cn(
              "rounded-[var(--radius-card)] border bg-surface p-4",
              r.danger
                ? "border-rag-red/40"
                : "border-border",
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              {r.danger && (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rag-red" />
              )}
              <h3
                className={cn(
                  "text-sm font-semibold",
                  r.danger && "text-rag-red",
                )}
              >
                {r.title}
              </h3>
            </div>
            <p className="text-sm text-muted">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold">Your key boards</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {REMINDERS.boards.map((b) => (
            <span
              key={b}
              className="ops-mono rounded border border-gold/40 bg-gold-soft px-2 py-1 text-xs text-gold"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
