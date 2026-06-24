import { z } from "zod";
import { str, bool, three } from "./common";
import { MODELS } from "@/lib/constants";

const whaleAttention = z.object({
  sub: str,
  model: str,
  chatter: str,
  issue: str,
  action: str,
});

const upsellIssue = z.object({
  model: str,
  chatter: str,
  problem: str,
  action: str,
});

export const dailySchema = z.object({
  report_date: z.string().min(1, "Pick a date"),

  // 1. Daily Call & KPI Review
  kpi: z.object({
    revenue: str,
    top_model: str,
    top_chatter: str,
    main_concern: str,
    key_takeaway: str,
  }),

  // 2. Training Dashboard (Trainees)
  training: z.object({
    on_track: str,
    watch: str,
    danger: str,
    kick: str,
    kicked: str,
    follow_ups_sent: str,
    trainees_completed: str,
    ai_reviews: str,
    notes: str,
  }),

  // 3. Whale CRM
  whaleCrm: z.object({
    active_whales: str,
    checks: z.object({
      daily_contact: bool,
      inflow_notes: bool,
      missing_follow_ups: bool,
      profiles_updated: bool,
    }),
    attention: z.array(whaleAttention).default([]),
  }),

  // 4. Missed Upsells Board
  missedUpsells: z.object({
    reviewed: z.record(z.string(), z.boolean()).default(
      Object.fromEntries(MODELS.map((m) => [m, false])),
    ),
    issues: z.array(upsellIssue).default([]),
    notes: str,
  }),

  // 5. Chat Quality & Offenses
  chatQuality: z.object({
    issues: z.object({
      no_follow_ups: bool,
      poor_aftercare: bool,
      slow_response: bool,
      weak_setup: bool,
      low_engagement: bool,
      other: str,
    }),
    warnings: str,
    repeat_offenses: str,
    escalations: str,
  }),

  // 6. Handover Notes
  handover: z.object({
    all_left: z.enum(["yes", "no", ""]).default(""),
    missing_notes: str,
    important_follow_ups: str,
  }),

  // 7. Attendance, Reports & Bonuses
  attendance: z.object({
    clock_in_issues: str,
    missing_shift_reports: str,
    bonuses_reviewed: str,
    missing_proof: str,
    sop_issues: str,
    notes: str,
  }),

  // 8. Mass Messages Monitoring
  massMessages: z.object({
    checks: z.object({
      hourly_texting: bool,
      mm_every_30: bool,
      prev_unsent: bool,
      auto_mm_bank: bool,
      shift_reminder: bool,
    }),
    issues: str,
  }),

  // Daily Summary
  summary: z.object({
    wins: three,
    problems: three,
    follow_ups: three,
    members_attention: str,
    general_notes: str,
  }),
});

export type DailyValues = z.infer<typeof dailySchema>;

export function emptyDaily(report_date: string): DailyValues {
  return dailySchema.parse({
    report_date,
    kpi: {},
    training: {},
    whaleCrm: { checks: {}, attention: [] },
    missedUpsells: {
      reviewed: Object.fromEntries(MODELS.map((m) => [m, false])),
      issues: [],
    },
    chatQuality: { issues: {} },
    handover: {},
    attendance: {},
    massMessages: { checks: {} },
    summary: {},
  });
}
