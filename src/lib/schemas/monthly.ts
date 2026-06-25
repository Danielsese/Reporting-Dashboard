import { z } from "zod";
import {
  str,
  bool,
  rag,
  three,
  checklist,
  customItems,
  funnelRecord,
  emptyFunnel,
} from "./common";

const event = z.object({ event: str, content_ideas: str, status: str });
const ppvCampaign = z.object({
  name: str,
  sent: str,
  opens: str,
  purchases: str,
  revenue: str,
  conversion: str,
});

export const monthlySchema = z.object({
  month: z.string().min(1, "Pick the month"), // first day of month, yyyy-MM-dd

  // Manager run-through checklist (Mariana's monthly tasks)
  checklist,

  // Executive Summary
  exec: z.object({
    overall_rating: rag,
    wins: three,
    challenges: three,
    focus: three,
  }),

  // 1. Monthly Call Summary
  call: z.object({
    overall_revenue: str,
    biggest_concerns: str,
    operational_updates: str,
    training_updates: str,
    strategic_decisions: str,
    key_takeaways: str,
  }),

  // 2. Revenue Goals & Performance
  revenue: z.object({
    target: str,
    actual: str,
    green_days: str, // days the daily goal was hit
    running_total: str,
  }),

  // 2b. Missed Upsells (monthly %) — per-model funnel vs the 30% goal
  upsells: z.object({
    models: funnelRecord,
    vs_goal: str, // up/down vs the 30% long-term goal
    notes: str,
  }),

  // 2c. PPV Campaign Review — final numbers for every campaign this month
  ppvCampaigns: z.array(ppvCampaign).default([]),

  // 3. Training Effectiveness Review
  training: z.object({
    conducted: str,
    results: z.object({
      unlock_ratio_improved: bool,
      golden_ratio_decreased: bool,
      sales_increased: bool,
      engagement_improved: bool,
    }),
    not_improved: str,
    next_priorities: str,
  }),

  // 4. Team Development
  team: z.object({
    top_performers: str,
    needing_support: str,
    promotions_demotions: str,
  }),

  // 5. Whale & High-Value Client Review
  whales: z.object({
    new_high_value: str,
    retained: str,
    lost: str,
    recovery: str,
  }),

  // 6. Holiday & Event Planning
  events: z.array(event).default([]),

  // Operational Health Check
  health: z.object({
    team_morale: rag,
    staffing: rag,
    sales_performance: rag,
    process_compliance: rag,
  }),

  // Strategic Goals for Next Month
  strategic: z.object({
    goal_1: str,
    goal_2: str,
    goal_3: str,
    support_needed: str,
    final_notes: str,
  }),

  // Anything specific for this month not covered above
  custom: customItems,
});

export type MonthlyValues = z.infer<typeof monthlySchema>;

export function emptyMonthly(month: string): MonthlyValues {
  return monthlySchema.parse({
    month,
    exec: {},
    call: {},
    revenue: {},
    upsells: { models: emptyFunnel() },
    ppvCampaigns: [],
    training: { results: {} },
    team: {},
    whales: {},
    events: [],
    health: {},
    strategic: {},
  });
}
