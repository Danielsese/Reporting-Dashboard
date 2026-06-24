"use client";

import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { weeklySchema, type WeeklyValues } from "@/lib/schemas/weekly";
import { prettyWeek, weekRange } from "@/lib/dates";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReportFormShell } from "@/components/form/report-form-shell";
import { CarryNotice } from "@/components/form/carry-notice";
import { Section, FieldGrid, SubHeading } from "@/components/form/section";
import {
  TextField,
  TextareaField,
  CheckboxField,
  NumberedThree,
  RepeatableRows,
} from "@/components/form/fields";
import {
  saveWeekly,
  archiveWeekly,
  restoreWeekly,
  deleteWeekly,
} from "@/app/(app)/weekly/actions";
import { ReportActions } from "@/components/report-actions";

export function WeeklyForm({
  defaultValues,
  id,
  status,
  carriedFrom,
  archived = false,
  readOnly = false,
}: {
  defaultValues: WeeklyValues;
  id?: string;
  status: "draft" | "submitted";
  carriedFrom?: number;
  archived?: boolean;
  readOnly?: boolean;
}) {
  const methods = useForm<WeeklyValues>({
    resolver: zodResolver(weeklySchema) as Resolver<WeeklyValues>,
    defaultValues,
  });

  const week_start = methods.watch("week_start");
  const week_end = methods.watch("week_end");

  return (
    <ReportFormShell
      methods={methods}
      onSave={saveWeekly}
      title="Weekly Report"
      subtitle={
        week_start && week_end ? prettyWeek(week_start, week_end) : undefined
      }
      listHref="/weekly"
      initialId={id}
      initialStatus={status}
      readOnly={readOnly}
      headerActions={
        id ? (
          <div className="flex items-center gap-2">
            {readOnly && (
              <Link href={`/weekly/${id}/edit`}>
                <Button type="button">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
            <ReportActions
              id={id}
              archived={archived}
              archiveAction={archiveWeekly}
              restoreAction={restoreWeekly}
              deleteAction={deleteWeekly}
              redirectTo="/weekly"
              variant="bar"
            />
          </div>
        ) : null
      }
    >
      {carriedFrom ? <CarryNotice count={carriedFrom} unit="daily reports" /> : null}
      <Section title="Report week" description="Pick any day; the Mon–Sun week is set automatically.">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weekpick">Week of</Label>
            <Input
              id="weekpick"
              type="date"
              disabled={readOnly}
              defaultValue={week_start}
              onChange={(e) => {
                if (!e.target.value) return;
                const { week_start, week_end } = weekRange(e.target.value);
                methods.setValue("week_start", week_start, {
                  shouldDirty: true,
                });
                methods.setValue("week_end", week_end, { shouldDirty: true });
              }}
              className="w-48"
            />
          </div>
          {week_start && week_end && (
            <p className="pb-2.5 text-sm text-muted">
              {prettyWeek(week_start, week_end)}
            </p>
          )}
        </div>
      </Section>

      <Section title="Weekly Overview">
        <div className="grid gap-6 sm:grid-cols-3">
          <NumberedThree name="overview.wins" label="🟢 Wins" />
          <NumberedThree name="overview.concerns" label="🟡 Areas of concern" />
          <NumberedThree name="overview.priorities" label="🔴 Immediate priorities" />
        </div>
      </Section>

      <Section number={1} title="Weekly Call (Stan & Daniel)">
        <SubHeading>Topics covered</SubHeading>
        <FieldGrid cols={2}>
          <TextField name="call.qc_report" label="QC report review" />
          <TextField name="call.weekly_performance" label="Weekly performance review" />
          <TextField name="call.team_concerns" label="Team concerns" />
          <TextField name="call.major_updates" label="Major updates" />
        </FieldGrid>
        <div className="mt-5">
          <RepeatableRows
            name="call.improvements"
            label="Improvements needed"
            addLabel="Add improvement"
            fields={[
              { name: "chatter", placeholder: "Chatter" },
              { name: "issue", placeholder: "Issue" },
              { name: "action", placeholder: "Action plan", wide: true },
            ]}
          />
        </div>
        <div className="mt-5">
          <RepeatableRows
            name="call.trainings"
            label="Trainings needed"
            addLabel="Add training"
            fields={[
              { name: "topic", placeholder: "Topic" },
              { name: "reason", placeholder: "Reason" },
              { name: "status", placeholder: "Status" },
            ]}
          />
        </div>
      </Section>

      <Section number={2} title="Team Performance Summary">
        <FieldGrid cols={2}>
          <TextField name="performance.total_revenue" label="Total revenue" prefix="$" />
          <TextField name="performance.best_model" label="Best performing model" />
          <TextField name="performance.best_chatter" label="Best performing chatter" />
          <TextField name="performance.highest_growth" label="Highest growth" />
          <TextField name="performance.biggest_decline" label="Biggest decline" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="performance.general" label="General team performance" />
        </div>
      </Section>

      <Section number={3} title="Schedule & Staffing">
        <FieldGrid cols={1}>
          <CheckboxField name="schedule.checks.schedule_completed" label="Weekly schedule completed" />
          <CheckboxField name="schedule.checks.models_assigned" label="Models assigned correctly" />
          <CheckboxField name="schedule.checks.new_chatters_added" label="New chatters added to schedule" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="schedule.concerns" label="Staffing concerns" rows={2} />
        </div>
      </Section>

      <Section number={4} title="Leave & Coverage">
        <RepeatableRows
          name="leave.entries"
          label="Leave entries"
          addLabel="Add leave"
          fields={[
            { name: "chatter", placeholder: "Chatter" },
            { name: "type", placeholder: "Type of leave" },
            { name: "dates", placeholder: "Dates" },
            { name: "coverage", placeholder: "Coverage" },
            { name: "approved", placeholder: "Approved?" },
          ]}
        />
        <div className="mt-4">
          <TextareaField name="leave.issues" label="Issues" rows={2} />
        </div>
      </Section>

      <Section number={5} title="Mass Message Refresh">
        <FieldGrid cols={1}>
          <CheckboxField name="mmRefresh.checks.bank_updated" label="Auto-MM bank updated" />
          <CheckboxField name="mmRefresh.checks.new_added" label="New messages added" />
          <CheckboxField name="mmRefresh.checks.underperforming_removed" label="Underperforming messages removed" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="mmRefresh.notes" label="Notes" rows={2} />
        </div>
      </Section>

      <Section number={6} title="QC Weekly Review">
        <div className="max-w-md">
          <NumberedThree name="qc.common_offenses" label="Most common offenses" />
        </div>
        <div className="mt-5">
          <RepeatableRows
            name="qc.repeat_offenders"
            label="Repeat offenders"
            addLabel="Add offender"
            fields={[
              { name: "chatter", placeholder: "Chatter" },
              { name: "issue", placeholder: "Main issue" },
              { name: "action", placeholder: "Action taken", wide: true },
            ]}
          />
        </div>
      </Section>

      <Section number={7} title="Whale CRM Review">
        <FieldGrid cols={3}>
          <TextField name="whaleCrm.active_count" label="Active whales" />
          <TextField name="whaleCrm.new_300" label="New whales ($300+)" />
          <TextField name="whaleCrm.profiles_updated" label="Profiles updated" />
        </FieldGrid>
        <div className="mt-4 grid gap-4">
          <TextareaField name="whaleCrm.gone_cold" label="Gone cold whales (1 month)" rows={2} />
          <TextareaField name="whaleCrm.at_risk" label="At risk whales (2 months)" rows={2} />
        </div>
      </Section>

      <Section number={8} title="Team Coaching & Development">
        <div className="grid gap-4">
          <TextareaField name="coaching.one_on_ones" label="One-on-ones conducted" rows={2} />
          <TextareaField name="coaching.needing_support" label="Chatters needing additional support" rows={2} />
          <TextareaField name="coaching.top_performers" label="Top performers" rows={2} />
        </div>
      </Section>

      <Section title="Action Plan for Next Week">
        <div className="max-w-md">
          <NumberedThree name="actionPlan.priorities" label="Priorities" />
        </div>
        <div className="mt-5 grid gap-4">
          <TextareaField name="actionPlan.trainings_to_prepare" label="Trainings to prepare" rows={2} />
          <TextareaField name="actionPlan.follow_ups" label="Follow-ups required" rows={2} />
          <TextareaField name="actionPlan.manager_notes" label="Manager notes" rows={2} />
        </div>
      </Section>
    </ReportFormShell>
  );
}
