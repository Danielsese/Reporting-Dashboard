import { z } from "zod";
import { str, bool, list, funnelRecord, emptyFunnel } from "./common";

const improvement = z.object({ chatter: str, issue: str, action: str });
const training = z.object({ topic: str, reason: str, status: str });
const leave = z.object({
  chatter: str,
  type: str,
  dates: str,
  coverage: str,
  approved: str,
});
const repeatOffender = z.object({ chatter: str, issue: str, action: str });

export const weeklySchema = z.object({
  week_start: z.string().min(1, "Pick the week"),
  week_end: z.string().min(1),

  // Weekly Overview
  overview: z.object({
    wins: list,
    concerns: list,
    priorities: list,
  }),

  // 1. Weekly Call
  call: z.object({
    qc_report: str,
    weekly_performance: str,
    team_concerns: str,
    major_updates: str,
    improvements: z.array(improvement).default([]),
    trainings: z.array(training).default([]),
  }),

  // 2. Team Performance Summary
  performance: z.object({
    total_revenue: str,
    best_model: str,
    best_chatter: str,
    highest_growth: str,
    biggest_decline: str,
    general: str,
  }),

  // 3. Schedule & Staffing
  schedule: z.object({
    checks: z.object({
      schedule_completed: bool,
      models_assigned: bool,
      new_chatters_added: bool,
    }),
    concerns: str,
  }),

  // 4. Leave & Coverage
  leave: z.object({
    entries: z.array(leave).default([]),
    issues: str,
  }),

  // 5. Mass Message Refresh
  mmRefresh: z.object({
    checks: z.object({
      bank_updated: bool,
      new_added: bool,
      underperforming_removed: bool,
    }),
    notes: str,
  }),

  // 6. QC Weekly Review
  qc: z.object({
    common_offenses: list,
    repeat_offenders: z.array(repeatOffender).default([]),
  }),

  // 6b. Missed Upsells roll-up — weekly per-model PPV funnel + open-rate vs goal
  upsells: z.object({
    models: funnelRecord,
    notes: str,
  }),

  // 7. Whale CRM Review
  whaleCrm: z.object({
    active_count: str,
    new_300: str,
    profiles_updated: str,
    gone_cold: str,
    at_risk: str,
  }),

  // 8. Team Coaching & Development
  coaching: z.object({
    one_on_ones: str,
    needing_support: str,
    top_performers: str,
  }),

  // Action Plan for Next Week
  actionPlan: z.object({
    priorities: list,
    trainings_to_prepare: str,
    follow_ups: list,
    manager_notes: str,
  }),
});

export type WeeklyValues = z.infer<typeof weeklySchema>;

export function emptyWeekly(week_start: string, week_end: string): WeeklyValues {
  return weeklySchema.parse({
    week_start,
    week_end,
    overview: {},
    call: { improvements: [], trainings: [] },
    performance: {},
    schedule: { checks: {} },
    leave: { entries: [] },
    mmRefresh: { checks: {} },
    qc: { repeat_offenders: [] },
    upsells: { models: emptyFunnel() },
    whaleCrm: {},
    coaching: {},
    actionPlan: {},
  });
}
