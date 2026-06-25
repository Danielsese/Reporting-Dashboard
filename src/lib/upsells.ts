import { MODELS } from "@/lib/constants";

export const UPSELL_GOAL = 30; // % PPV open rate (PPV4 ÷ PPV1)

export interface FunnelCell {
  ppv1?: string;
  ppv4?: string;
  missed?: string;
  issue?: string;
}

/** Open rate % for one model's funnel cell, or null if no PPV1 started. */
export function openRate(cell: FunnelCell | undefined): number | null {
  const p1 = Number(cell?.ppv1) || 0;
  const p4 = Number(cell?.ppv4) || 0;
  return p1 > 0 ? Math.round((p4 / p1) * 100) : null;
}

export function rateTone(pct: number | null, goal = UPSELL_GOAL) {
  if (pct === null) return "neutral" as const;
  return pct >= goal ? ("green" as const) : ("red" as const);
}

export interface ModelRate {
  model: string;
  pct: number | null;
  ppv1: number;
  ppv4: number;
  missed: number;
}

/** Per-model open rates from a daily/weekly `missedUpsells.models` record. */
export function modelRates(
  models: Record<string, FunnelCell> | undefined,
): ModelRate[] {
  return MODELS.map((m) => {
    const cell = models?.[m];
    return {
      model: m,
      pct: openRate(cell),
      ppv1: Number(cell?.ppv1) || 0,
      ppv4: Number(cell?.ppv4) || 0,
      missed: Number(cell?.missed) || 0,
    };
  });
}
