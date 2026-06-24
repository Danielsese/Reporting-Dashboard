"use client";

import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { dailySchema, type DailyValues } from "@/lib/schemas/daily";
import { MODELS } from "@/lib/constants";
import { prettyDate } from "@/lib/dates";
import { ReportFormShell } from "@/components/form/report-form-shell";
import { Section, FieldGrid, SubHeading } from "@/components/form/section";
import {
  TextField,
  TextareaField,
  CheckboxField,
  NumberedThree,
  RepeatableRows,
} from "@/components/form/fields";
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
          <TextField name="kpi.main_concern" label="Main concern" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="kpi.key_takeaway" label="Key takeaway" />
        </div>
      </Section>

      <Section number={2} title="Training Dashboard (Trainees)">
        <SubHeading>Current status</SubHeading>
        <FieldGrid cols={4}>
          <TextField name="training.on_track" label="On track" />
          <TextField name="training.watch" label="Watch" />
          <TextField name="training.danger" label="Danger" />
          <TextField name="training.kick" label="Kick" />
        </FieldGrid>
        <div className="mt-5">
          <SubHeading>Actions taken today</SubHeading>
          <FieldGrid cols={4}>
            <TextField name="training.kicked" label="Kicked" />
            <TextField name="training.follow_ups_sent" label="Follow-ups sent" />
            <TextField name="training.trainees_completed" label="Completed" />
            <TextField name="training.ai_reviews" label="AI reviews (Stan)" />
          </FieldGrid>
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
        <SubHeading>Models reviewed</SubHeading>
        <FieldGrid cols={3}>
          {MODELS.map((m) => (
            <CheckboxField key={m} name={`missedUpsells.reviewed.${m}`} label={m} />
          ))}
        </FieldGrid>
        <div className="mt-5">
          <RepeatableRows
            name="missedUpsells.issues"
            label="Issues found"
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
          <TextField name="chatQuality.issues.other" label="Other" />
        </div>
        <div className="mt-5">
          <SubHeading>Offense summary</SubHeading>
          <FieldGrid cols={3}>
            <TextField name="chatQuality.warnings" label="Warnings" />
            <TextField name="chatQuality.repeat_offenses" label="Repeat offenses" />
            <TextField name="chatQuality.escalations" label="Escalations" />
          </FieldGrid>
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
          <NumberedThree name="summary.wins" label="🏆 Wins" />
          <NumberedThree name="summary.problems" label="🚨 Problems" />
          <NumberedThree name="summary.follow_ups" label="📌 Follow-ups for tomorrow" />
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
