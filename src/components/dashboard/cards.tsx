import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModelRate } from "@/lib/upsells";
import { UPSELL_GOAL, rateTone } from "@/lib/upsells";
import {
  AlertTriangle,
  ArrowRight,
  Pin,
  Trophy,
  Siren,
  Fish,
  Target,
} from "lucide-react";

/** Banner shown when today's report isn't submitted yet. */
export function NudgeBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-500/40 dark:bg-amber-500/10">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rag-amber" />
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <Link href="/daily/new">
        <Button size="sm">
          Start today&apos;s report <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-1 text-sm text-muted">{children}</p>;
}

/** Follow-ups for tomorrow — Stan's headline ask. */
export function FollowUpsCard({
  items,
  dateLabel,
}: {
  items: string[];
  dateLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-brand" /> Follow-ups for tomorrow
        </CardTitle>
        {dateLabel && (
          <p className="text-xs text-muted">From {dateLabel}</p>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyLine>No open follow-ups.</EmptyLine>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Latest daily summary — wins / problems / members needing attention. */
export function SummaryCard({
  wins,
  problems,
  attention,
}: {
  wins: string[];
  problems: string[];
  attention: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest daily summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <Trophy className="h-3.5 w-3.5" /> Wins
          </p>
          {wins.length === 0 ? (
            <EmptyLine>—</EmptyLine>
          ) : (
            <ul className="ml-1 list-disc pl-4 text-sm marker:text-rag-green">
              {wins.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <Siren className="h-3.5 w-3.5" /> Problems
          </p>
          {problems.length === 0 ? (
            <EmptyLine>—</EmptyLine>
          ) : (
            <ul className="ml-1 list-disc pl-4 text-sm marker:text-rag-red">
              {problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </div>
        {attention.trim() && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Team members needing attention
            </p>
            <p className="text-sm">{attention}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Per-model PPV open rate vs the 30% goal. */
export function UpsellCard({ rates }: { rates: ModelRate[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-brand" /> Missed upsells — open rate
        </CardTitle>
        <p className="text-xs text-muted">
          PPV4 ÷ PPV1 · goal {UPSELL_GOAL}%
        </p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y divide-border">
          {rates.map((r) => {
            const tone = rateTone(r.pct);
            return (
              <li
                key={r.model}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="font-medium">{r.model}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {r.ppv1}→{r.ppv4}
                  </span>
                  <Badge tone={tone}>
                    {r.pct === null ? "—" : `${r.pct}%`}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Offenses count + whales needing attention. */
export function AttentionCard({
  offenseCount,
  whales,
}: {
  offenseCount: number;
  whales: { sub?: string; model?: string; issue?: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fish className="h-4 w-4 text-brand" /> Attention needed
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge tone={offenseCount > 0 ? "red" : "neutral"}>
            {offenseCount}
          </Badge>
          <span className="text-muted">
            offense{offenseCount === 1 ? "" : "s"} logged in the latest report
          </span>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Whales needing attention
          </p>
          {whales.length === 0 ? (
            <EmptyLine>None flagged.</EmptyLine>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {whales.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rag-amber" />
                  <span>
                    <span className="font-medium">
                      {w.sub || "Whale"}
                      {w.model ? ` · ${w.model}` : ""}
                    </span>
                    {w.issue ? ` — ${w.issue}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
