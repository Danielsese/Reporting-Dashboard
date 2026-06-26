// ChosenOnes — Chat Manager Operations Checklist content (BUILD_SPEC §6).
// Data-driven: edit tasks here without touching layout. Item ids are derived as
// `${card.id}.${index}` so completion state is stable as long as ids don't move.

export type ChipTone = "gold" | "red";

export interface ChecklistItem {
  text: string;
  chip?: string;
  chipTone?: ChipTone;
  action?: string;
}

export interface ChecklistCard {
  id: string;
  title: string;
  intro: string;
  note?: string;
  items: ChecklistItem[];
}

export interface ChecklistPhase {
  title: string;
  subtitle?: string;
  cards: ChecklistCard[];
}

export interface Checklist {
  id: ChecklistId;
  title: string;
  intro: string;
  phases: ChecklistPhase[];
}

export type ChecklistId = "daily" | "weekly" | "monthly";

export const CHECKLIST_TABS: { id: ChecklistId; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

/** Stable id for one item, used as the persistence key within a checklist. */
export function itemId(cardId: string, index: number) {
  return `${cardId}.${index}`;
}

/** Every item id in a checklist (for progress totals). */
export function allItemIds(list: Checklist): string[] {
  const ids: string[] = [];
  for (const phase of list.phases)
    for (const card of phase.cards)
      card.items.forEach((_, i) => ids.push(itemId(card.id, i)));
  return ids;
}

const DAILY: Checklist = {
  id: "daily",
  title: "Daily",
  intro:
    "Your every-shift operating rhythm — yesterday's numbers, the team, training, and the live floor.",
  phases: [
    {
      title: "Start of day",
      subtitle: "before / at the start of the shift",
      cards: [
        {
          id: "daily_call",
          title: "Daily call & KPI review",
          intro:
            "Start the day aligned; know yesterday's numbers before anyone asks.",
          items: [
            { text: "Join the daily call on time" },
            {
              text: "Go over every KPI from the day before (revenue, opens, response time, etc.)",
            },
            { text: "Flag any number that's off-target to raise on the call" },
            { text: "Write down action items & decisions from the call" },
          ],
        },
        {
          id: "sos_reminder",
          title: "Start-of-shift reminder",
          intro: "Set the tempo early so chatters hit cadence from minute one.",
          items: [
            {
              text: "Send the start-of-shift reminder to all chatters",
              chip: "every shift",
            },
            { text: "Remind them: mass message every 30 min + text new subs hourly" },
          ],
        },
      ],
    },
    {
      title: "Review yesterday",
      subtitle: "backtrack the previous day, model by model",
      cards: [
        {
          id: "whale_crm",
          title: "Whale CRM (Real CRM)",
          intro:
            "Whales pay the bills; make sure they're worked and logged every day.",
          items: [
            { text: "Check today's active whales across all models — anyone who spent today" },
            { text: "Confirm assigned chatters are contacting their whales", chip: "daily" },
            { text: "Confirm whale notes are being logged in Infloww" },
            {
              text: "Whale not contacted or notes missing?",
              action: "Call out the chatter directly",
            },
            {
              text: "Fill whale profile fields — nationality, DOB, hobbies, spending strategy, objections",
              chip: "$300+ spend",
            },
          ],
        },
        {
          id: "spenders",
          title: "Spenders board",
          intro:
            "Yesterday's big sales; confirm they were noted so they can be repeated.",
          items: [
            { text: "Review yesterday's top spenders across all models" },
            { text: "Focus on anyone over $300", chip: "$300+" },
            { text: "With QC, confirm chatters made proper notes in OF for those spenders" },
          ],
        },
        {
          id: "missed_upsells",
          title: "Missed upsells board",
          intro:
            "Where the money leaks out; catch PPVs that opened wrong or got ignored.",
          note: "Models for now: Sydney, Figgy, Julia, Eliana, Victoria. Weekly/monthly % tracking lives in those tabs. Long-term goal: min 30% PPV open rate.",
          items: [
            { text: "Pull up the board and backtrack yesterday for each model" },
            { text: "Look at the drop-off from PPV1 → PPV4" },
            {
              text: "Flag any first PPV not started at $8 / $8.88",
              chip: "$8 / $8.88",
              chipTone: "red",
            },
            {
              text: "Write down the bad ones",
              action: "Send to QC to check what happened in the chat",
            },
          ],
        },
        {
          id: "chat_quality",
          title: "Chat quality / offenses",
          intro:
            "Spot today's mistakes early and bank the patterns for the weekly call.",
          items: [
            { text: "Check the daily QC alerts" },
            { text: "Check the offense logs" },
            { text: "Note the most common issues of the day — no follow-ups, weak aftercare, slow replies" },
            { text: "Save these as notes for the weekly call" },
          ],
        },
        {
          id: "handover",
          title: "Handover notes",
          intro:
            "Nothing falls through the cracks between shifts, especially incoming money.",
          items: [
            { text: "Confirm every chatter left handover notes at clock-out" },
            { text: "Any missing?", action: "Flag it as an issue and point it out" },
            {
              text: "Note flags incoming money (e.g. payday on the 15th)?",
              action: "Tell the chatter to follow up",
            },
          ],
        },
        {
          id: "clock_bonuses",
          title: "Clock-in/out, shift reports & bonuses",
          intro:
            "Keep the team accountable: on time, reported, bonuses by the book.",
          items: [
            { text: "Check clock-ins were on time — flag anyone late", chip: "10 min before" },
            { text: "Confirm everyone sent yesterday's shift sales report", chip: "≤ 1 hr into shift" },
            { text: "Report missing? Point it out" },
            { text: "Check bonuses were posted & approved (full bonus-script SOP followed)" },
            { text: "Confirm you + QC are tagged / flagged in each bonus post" },
          ],
        },
      ],
    },
    {
      title: "Training & onboarding",
      subtitle: "trainees, shadow / trial shifts, new hires",
      cards: [
        {
          id: "training",
          title: "Training dashboard",
          intro:
            "Keep the pipeline clean; push the good ones, cut dead weight fast.",
          items: [
            { text: "Review who's on Kick / Danger / Watch / On Track" },
            {
              text: "KICK — no start after 48h",
              chip: "48h",
              chipTone: "red",
              action: "Remove them + send the polite rejection message",
            },
            {
              text: "DANGER — no activity 24h",
              chip: "24h",
              chipTone: "red",
              action: "Message them, ask what happened. No good reason → kick",
            },
            { text: "WATCH — keep an eye on them today" },
            { text: "ON TRACK — confirm they're progressing" },
            {
              text: "Someone finished training?",
              action: "Tell Stan so the AI grade can be reviewed",
            },
          ],
        },
        {
          id: "trainee_updates",
          title: "Daily trainee updates",
          intro: "Stay in their corner daily so problems surface before they quit.",
          items: [
            { text: "Send a daily update to everyone in training" },
            { text: "Ask each one how it's going / where they're stuck" },
            { text: "Log any blockers or red flags" },
          ],
        },
        {
          id: "shadow",
          title: "Shadow shifts",
          intro: "Let trainees watch a real chatter work before they're trusted live.",
          items: [
            { text: "Identify trainees who need a shadow shift" },
            { text: "Schedule it", action: "pair with a live chatter and confirm the slot" },
          ],
        },
        {
          id: "trial",
          title: "Trial shifts",
          intro: "A live test run before we commit; see if they can actually sell.",
          items: [
            { text: "Identify candidates ready for a trial shift" },
            { text: "Schedule it", action: "confirm time + model line" },
            { text: "Flag QC to review the trial afterward" },
          ],
        },
      ],
    },
    {
      title: "Live during shift",
      subtitle: "real-time, kept running all shift",
      cards: [
        {
          id: "mass_messages",
          title: "Mass messages (Message Pro)",
          intro: "The volume engine; keep it firing so new subs always get hit.",
          items: [
            { text: "Keep Message Pro open all shift" },
            { text: "Check chatters are texting new subscribers", chip: "hourly" },
            { text: "Check a mass message goes out", chip: "every 30 min" },
            { text: "Confirm the previous mass message was unsent first" },
            { text: "Keep the auto-mass-message bank topped up" },
          ],
        },
      ],
    },
  ],
};

const WEEKLY: Checklist = {
  id: "weekly",
  title: "Weekly",
  intro:
    "The Monday-to-Sunday layer — schedules, leave, %-tracking, QC patterns, and the weekly call.",
  phases: [
    {
      title: "Monday",
      subtitle: "set up the week",
      cards: [
        {
          id: "schedules",
          title: "Schedules",
          intro: "Lock the week's coverage so every model line is staffed.",
          items: [
            { text: "Build the weekly shift schedule in the Schedules board — set timezone, assign models per chatter" },
            { text: "Set once per person — copy Mon–Sun, or up to 4 weeks ahead if nothing changes", chip: "up to 4 wks" },
            { text: "Update immediately whenever a new chatter starts" },
          ],
        },
        {
          id: "call_prep",
          title: "Weekly call prep (with Stan & Daniel)",
          intro: "Walk into the chatter call with a plan, not a vibe.",
          items: [
            { text: "Prep with Stan & Daniel on Monday" },
            { text: "Write the plan for the weekly call with the chatters" },
            { text: "Write out where the chatters need to improve" },
            { text: "Once a training is built for it and approved", action: "Use it with the chatters" },
          ],
        },
      ],
    },
    {
      title: "Through the week",
      subtitle: "keep it running",
      cards: [
        {
          id: "leave",
          title: "Leave & coverage",
          intro: "Time off only when it's covered; protect the model lines first.",
          items: [
            { text: "Approve or reject leave requests" },
            { text: "Mind the notice rules — sick 20h, non-paid 24h, yearly holiday 30 days", chip: "20h / 24h / 30d" },
            { text: "Chatters find their own coverage first — no coverage, no approval" },
          ],
        },
        {
          id: "ppv_tracking",
          title: "PPV campaign tracking",
          intro: "Measure every Saturday blast so you know what's worth resending.",
          items: [
            { text: "Add Saturday's mass PPV (with price tag) to the PPV tracker", chip: "every Saturday" },
            { text: "Update per campaign: fans sent, opens, purchases, revenue, conversion rate" },
          ],
        },
        {
          id: "mm_refresh",
          title: "Mass message refresh",
          intro: "Keep the bank fresh so mass messages never go stale or repeat.",
          items: [
            { text: "Pull new messages from OF and top up the auto-mass-message bank", chip: "every 2–3 days" },
          ],
        },
      ],
    },
    {
      title: "Weekly review & QC",
      subtitle: "zoom out on the week",
      cards: [
        {
          id: "weekly_call",
          title: "Weekly call (with Stan & Daniel)",
          intro: "Zoom out with leadership: what worked, what didn't, what to fix.",
          items: [
            { text: "Go over the QC reports the QC team made this week" },
            { text: "Go over the weekly sheet you put together" },
            { text: "Go over how the week went overall" },
          ],
        },
        {
          id: "upsell_pct",
          title: "Missed Upsells % tracking",
          intro: "Put a number on the leak: are opens trending up or down vs last week?",
          items: [
            { text: "Calculate the week's PPV open rate / drop-off as a % (up or down vs last week)" },
            { text: "Measure it against the open-rate goal", chip: "30% goal" },
          ],
        },
        {
          id: "qc_review",
          title: "QC review (weekly pattern check)",
          intro: "One bad day is noise; a pattern is a problem.",
          items: [
            { text: "Review the week's offenses per chatter — who has the most / recurring issues" },
            { text: "Flag repeat offenders and talk to them directly" },
            { text: "Check Missed Upsells week-over-week — is drop-off improving?", chip: "Sat → Sat" },
          ],
        },
        {
          id: "whale_check",
          title: "Whale check & CRM update",
          intro: "Catch whales going quiet before they're gone for good.",
          items: [
            { text: "Review whales marked Gone Cold", chip: "no spend 1 mo" },
            { text: "Review whales marked At Risk", chip: "2 mo" },
            { text: "Keep whale profiles and notes current in the CRM" },
            { text: "Spent $200+ then went quiet? Check Fan Intelligence for what happened", chip: "$200+", action: "Flag for follow-up" },
          ],
        },
      ],
    },
  ],
};

const MONTHLY: Checklist = {
  id: "monthly",
  title: "Monthly",
  intro:
    "The zoom-out layer — revenue goals, full campaign numbers, trends, and event planning.",
  phases: [
    {
      title: "1st of the month",
      subtitle: "set the target",
      cards: [
        {
          id: "revenue_goals",
          title: "Revenue goals",
          intro: "Set the target on day one and chase green days all month.",
          items: [
            { text: "Set the monthly revenue goal with Stan & Daniel in the Revenue Tracker", chip: "1st of month" },
            { text: "Track green days (goal hit) vs the running total through the month" },
            { text: "Push to hit the per-model targets" },
          ],
        },
      ],
    },
    {
      title: "Plan ahead",
      subtitle: "get in front of the big days",
      cards: [
        {
          id: "event_planning",
          title: "Holiday / event PPV planning",
          intro: "Order content a month out so big events aren't a scramble.",
          items: [
            { text: "Plan major events ~1 month ahead (Halloween, Black Friday, Christmas, NYE, Valentine's…)", chip: "~1 mo ahead" },
            { text: "Order content from the models early" },
            { text: "Follow the PPV event SOP timeline" },
          ],
        },
      ],
    },
    {
      title: "Monthly review",
      subtitle: "the big-picture check",
      cards: [
        {
          id: "monthly_call",
          title: "Monthly call",
          intro: "The big-picture check-in: the month's numbers and its biggest problems.",
          items: [
            { text: "Go over the month's numbers" },
            { text: "Go over the biggest issues during the month" },
          ],
        },
        {
          id: "campaign_review",
          title: "Campaign review",
          intro: "Slow money keeps landing after week one; review the real final numbers.",
          items: [
            { text: "Review every PPV campaign from the month (not just weekly)" },
            { text: "Update final numbers — revenue keeps coming in after week one" },
            { text: "Identify the top-earning PPVs / call-ups so you know what to repeat" },
          ],
        },
        {
          id: "upsell_pct_month",
          title: "Missed Upsells % tracking",
          intro: "The month's open rate vs the 30% goal: real trend or noise?",
          items: [
            { text: "Calculate the month's PPV open rate / drop-off as a % (up or down)" },
            { text: "Measure it against the long-term goal", chip: "30% goal" },
          ],
        },
        {
          id: "performance_trends",
          title: "Performance trends",
          intro: "Did training actually move the needle? The 90-day view tells you.",
          items: [
            { text: "Review month-over-month per chatter and per model", chip: "90-day view" },
            { text: "After any training, confirm: unlock ratio up, golden ratio down, sales trending up" },
            { text: "Not improving? Dig in" },
          ],
        },
      ],
    },
  ],
};

export const CHECKLISTS: Record<ChecklistId, Checklist> = {
  daily: DAILY,
  weekly: WEEKLY,
  monthly: MONTHLY,
};

export interface ReminderRule {
  title: string;
  body: string;
  danger?: boolean;
}

export const REMINDERS: {
  rules: ReminderRule[];
  boards: string[];
} = {
  rules: [
    {
      title: "You're the Chat Manager — not the VA.",
      body: "Someone else uploads content and sends the mass messages. You need to know how it works, not do it all yourself.",
    },
    {
      title: "The analyzer & module building isn't yours.",
      body: "Someone else handles the analyzer and builds the modules. You just check trainees daily and flag when they finish.",
    },
    {
      title: "Escalate to Stan & Daniel.",
      body: "Salary deductions, Tier 1 offenses (fire on the spot), and anything you're unsure about — escalate, don't decide it alone.",
      danger: true,
    },
  ],
  boards: [
    "Employees",
    "Schedules",
    "Leave",
    "Whale CRM",
    "Spenders",
    "Revenue Tracker",
    "PPV Tracker",
    "Missed Upsells",
    "Chat Quality",
    "Handover Notes",
  ],
};
