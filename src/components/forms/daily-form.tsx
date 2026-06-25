"use client";

import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { dailySchema, type DailyValues } from "@/lib/schemas/daily";
import { prettyDate } from "@/lib/dates";
import { ReportFormShell } from "@/components/form/report-form-shell";
import { Section, FieldGrid, SubHeading } from "@/components/form/section";
import {
  TextField,
  TextareaField,
  CheckboxField,
  NumberedList,
  RepeatableRows,
  ModelFunnelTable,
} from "@/components/form/fields";

const TRAINEE_STATUS_OPTIONS = [
  { value: "on_track", label: "On track" },
  { value: "watch", label: "Watch" },
  { value: "danger", label: "Danger" },
  { value: "kick", label: "Kick" },
];
import {
  saveDaily,
  archiveDaily,
  restoreDaily,
  deleteDaily,
} from "@/app/(app)/daily/actions";
import { ReportActions } from "@/components/report-actions";

export function DailyForm({
  defaultValues,
  id,
  status,
  archived = false,
  readOnly = false,
}: {
  defaultValues: DailyValues;
  id?: string;
  status: "draft" | "submitted";
  archived?: boolean;
  readOnly?: boolean;
}) {
  const methods = useForm<DailyValues>({
    resolver: zodResolver(dailySchema) as Resolver<DailyValues>,
    defaultValues,
  });

  return (
    <ReportFormShell
      methods={methods}
      onSave={saveDaily}
      title="Daily Report"
      subtitle={prettyDate(defaultValues.report_date)}
      listHref="/daily"
      initialId={id}
      initialStatus={status}
      readOnly={readOnly}
      headerActions={
        id ? (
          <div className="flex items-center gap-2">
            {readOnly && (
              <Link href={`/daily/${id}/edit`}>
                <Button type="button">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
            <ReportActions
              id={id}
              archived={archived}
              archiveAction={archiveDaily}
              restoreAction={restoreDaily}
              deleteAction={deleteDaily}
              redirectTo="/daily"
              variant="bar"
            />
          </div>
        ) : null
      }
    >
      <Section title="Report date">
        <div className="max-w-xs">
          <TextField name="report_date" label="Date" type="date" />
        </div>
      </Section>

      <Section number={1} title="Daily Call & KPI Review">
        <FieldGrid cols={2}>
          <TextField name="kpi.revenue" label="Revenue" prefix="$" placeholder="0" />
          <TextField name="kpi.top_model" label="Top performing model" />
          <TextField name="kpi.top_chatter" label="Top performing chatter" />
          <TextField name="kpi.worst_chatter" label="Worst performing chatter" />
          <TextField name="kpi.main_concern" label="Main concern" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="kpi.key_takeaway" label="Key takeaway" />
        </div>
        <div className="mt-4">
          <NumberedList name="kpi.next_steps" label="Next steps" addLabel="Add next step" />
        </div>
      </Section>

      <Section number={2} title="Training Dashboard (Trainees)">
        <SubHeading>Trainee roster</SubHeading>
        <RepeatableRows
          name="training.roster"
          addLabel="Add trainee"
          fields={[
            { name: "name", placeholder: "Trainee name" },
            {
              name: "status",
              placeholder: "Status…",
              kind: "select",
              options: TRAINEE_STATUS_OPTIONS,
            },
            { name: "note", placeholder: "Note (e.g. stalled 2 days)", wide: true },
          ]}
        />
        <div className="mt-5">
          <SubHeading>Actions taken today</SubHeading>
          <div className="grid gap-5 sm:grid-cols-3">
            <NumberedList name="training.kicks_sent" label="Kicks sent" addLabel="Add" />
            <NumberedList name="training.follow_ups" label="Follow-ups sent" addLabel="Add" />
            <NumberedList
              name="training.completed_ai_review"
              label="Completed — do AI review"
              addLabel="Add"
            />
          </div>
        </div>
        <div className="mt-4">
          <TextareaField name="training.notes" label="Notes" />
        </div>
      </Section>

      <Section number={3} title="Whale CRM">
        <div className="max-w-xs">
          <TextField name="whaleCrm.active_whales" label="Active whales today" />
        </div>
        <div className="mt-5">
          <SubHeading>Checks completed</SubHeading>
          <FieldGrid cols={2}>
            <CheckboxField name="whaleCrm.checks.daily_contact" label="Daily contact confirmed" />
            <CheckboxField name="whaleCrm.checks.inflow_notes" label="Inflow notes updated" />
            <CheckboxField name="whaleCrm.checks.missing_follow_ups" label="Missing follow-ups addressed" />
            <CheckboxField name="whaleCrm.checks.profiles_updated" label="Whale profiles updated" />
          </FieldGrid>
        </div>
        <div className="mt-5">
          <RepeatableRows
            name="whaleCrm.attention"
            label="Whales needing attention"
            addLabel="Add whale"
            fields={[
              { name: "sub", placeholder: "Sub" },
              { name: "model", placeholder: "Model" },
              { name: "chatter", placeholder: "Chatter" },
              { name: "issue", placeholder: "Issue", wide: true },
              { name: "action", placeholder: "Action", wide: true },
            ]}
          />
        </div>
      </Section>

      <Section number={4} title="Missed Upsells Board">
        <SubHeading>PPV funnel by model</SubHeading>
        <ModelFunnelTable name="missedUpsells.models" goal={30} />
        <div className="mt-5">
          <SubHeading>Other issues found</SubHeading>
          <RepeatableRows
            name="missedUpsells.issues"
            addLabel="Add issue"
            fields={[
              { name: "model", placeholder: "Model" },
              { name: "chatter", placeholder: "Chatter" },
              { name: "problem", placeholder: "Problem", wide: true },
              { name: "action", placeholder: "Action", wide: true },
            ]}
          />
        </div>
        <div className="mt-4">
          <TextareaField name="missedUpsells.notes" label="Notes" />
        </div>
      </Section>

      <Section number={5} title="Chat Quality & Offenses">
        <SubHeading>Most common issues today</SubHeading>
        <FieldGrid cols={2}>
          <CheckboxField name="chatQuality.issues.no_follow_ups" label="No follow-ups" />
          <CheckboxField name="chatQuality.issues.poor_aftercare" label="Poor aftercare" />
          <CheckboxField name="chatQuality.issues.slow_response" label="Slow response times" />
          <CheckboxField name="chatQuality.issues.weak_setup" label="Weak setup" />
          <CheckboxField name="chatQuality.issues.low_engagement" label="Low engagement" />
        </FieldGrid>
        <div className="mt-4">
          <NumberedList
            name="chatQuality.common_issues"
            label="Other issues (your own)"
            addLabel="Add issue"
          />
        </div>
        <div className="mt-5">
          <SubHeading>Offenses & warnings</SubHeading>
          <RepeatableRows
            name="chatQuality.offenses"
            addLabel="Add offense"
            fields={[
              { name: "chatter", placeholder: "Chatter" },
              {
                name: "repeated",
                placeholder: "Repeated?",
                kind: "select",
                options: [
                  { value: "no", label: "First time" },
                  { value: "yes", label: "Repeated" },
                ],
              },
              { name: "what_happened", placeholder: "What happened / why the warning", wide: true },
              { name: "escalation", placeholder: "Escalation / action taken", wide: true },
            ]}
          />
        </div>
        <div className="mt-4">
          <TextareaField name="chatQuality.notes" label="Notes" rows={2} />
        </div>
      </Section>

      <Section number={6} title="Handover Notes">
        <FieldGrid cols={1}>
          <TextField
            name="handover.all_left"
            label="All chatters left handover notes? (yes / no)"
          />
          <TextareaField name="handover.missing_notes" label="Missing notes" rows={2} />
          <TextareaField
            name="handover.important_follow_ups"
            label="Important follow-ups"
            rows={2}
          />
        </FieldGrid>
      </Section>

      <Section number={7} title="Attendance, Reports & Bonuses">
        <FieldGrid cols={2}>
          <TextField name="attendance.clock_in_issues" label="Clock-in issues" />
          <TextField name="attendance.missing_shift_reports" label="Missing shift reports" />
        </FieldGrid>
        <div className="mt-5">
          <SubHeading>Bonus approvals</SubHeading>
          <FieldGrid cols={3}>
            <TextField name="attendance.bonuses_reviewed" label="Bonuses reviewed" />
            <TextField name="attendance.missing_proof" label="Missing proof" />
            <TextField name="attendance.sop_issues" label="SOP issues" />
          </FieldGrid>
        </div>
        <div className="mt-4">
          <TextareaField name="attendance.notes" label="Notes" />
        </div>
      </Section>

      <Section number={8} title="Mass Messages Monitoring">
        <FieldGrid cols={2}>
          <CheckboxField name="massMessages.checks.hourly_texting" label="Hourly texting completed" />
          <CheckboxField name="massMessages.checks.mm_every_30" label="Mass messages every 30 minutes" />
          <CheckboxField name="massMessages.checks.prev_unsent" label="Previous MM unsent before new one" />
          <CheckboxField name="massMessages.checks.auto_mm_bank" label="Auto-MM bank updated" />
          <CheckboxField name="massMessages.checks.shift_reminder" label="Shift reminder sent" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="massMessages.issues" label="Issues found" rows={2} />
        </div>
      </Section>

      <Section title="Daily Summary">
        <div className="grid gap-6 sm:grid-cols-3">
          <NumberedList name="summary.wins" label="🏆 Wins" addLabel="Add win" />
          <NumberedList name="summary.problems" label="🚨 Problems" addLabel="Add problem" />
          <NumberedList
            name="summary.follow_ups"
            label="📌 Follow-ups for tomorrow"
            addLabel="Add follow-up"
          />
        </div>
        <div className="mt-5 grid gap-4">
          <TextareaField
            name="summary.members_attention"
            label="Team members requiring attention"
            rows={2}
          />
          <TextareaField name="summary.general_notes" label="General notes" rows={2} />
        </div>
      </Section>
    </ReportFormShell>
  );
}
