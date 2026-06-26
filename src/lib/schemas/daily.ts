import { z } from "zod";
import {
  str,
  bool,
  list,
  customItems,
  funnelRecord,
  emptyFunnel,
} from "./common";

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

// One row on the Spenders board — yesterday's top spenders ($300+).
const spenderRow = z.object({
  model: str,
  spender: str,
  amount: str,
  of_notes: str, // yes | no — were proper OF notes made (QC-confirmed)
  note: str,
});

// One trainee row in the Training Dashboard "roster" spreadsheet.
const traineeRow = z.object({
  name: str,
  status: str, // on_track | watch | danger | kick
  note: str,
});

// One structured offense entry in Chat Quality & Offenses.
const offenseRow = z.object({
  chatter: str,
  what_happened: str,
  repeated: str, // yes | no
  escalation: str,
});

export const dailySchema = z.object({
  report_date: z.string().min(1, "Pick a date"),

  // 1. Daily Call & KPI Review
  kpi: z.object({
    revenue: str,
    top_model: str,
    top_chatter: str,
    worst_chatter: str,
    main_concern: str,
    key_takeaway: str,
    next_steps: list, // agreed next steps from the call
  }),

  // 2. Training Dashboard (Trainees) — a roster spreadsheet + action lists
  training: z.object({
    roster: z.array(traineeRow).default([]),
    kicks_sent: list,
    follow_ups: list,
    completed_ai_review: list,
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

  // 4. Spenders Board — yesterday's top spenders ($300+), QC-confirmed OF notes
  spenders: z.object({
    rows: z.array(spenderRow).default([]),
    notes: str,
  }),

  // 5. Missed Upsells Board — per-model PPV1→PPV4 funnel + open-rate vs goal
  missedUpsells: z.object({
    models: funnelRecord,
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
    common_issues: list, // manager's own free-entry issues (beyond the presets)
    offenses: z.array(offenseRow).default([]), // per-offense detail (who/what/repeated/escalation)
    notes: str,
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
    wins: list,
    problems: list,
    follow_ups: list,
    members_attention: str,
    general_notes: str,
  }),

  // Anything specific for this day not covered above
  custom: customItems,
});

export type DailyValues = z.infer<typeof dailySchema>;

export function emptyDaily(report_date: string): DailyValues {
  return dailySchema.parse({
    report_date,
    kpi: {},
    training: {},
    whaleCrm: { checks: {}, attention: [] },
    spenders: { rows: [] },
    missedUpsells: { models: emptyFunnel(), issues: [] },
    chatQuality: { issues: {} },
    handover: {},
    attendance: {},
    massMessages: { checks: {} },
    summary: {},
  });
}
