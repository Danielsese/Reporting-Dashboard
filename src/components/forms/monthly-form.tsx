"use client";

import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { monthlySchema, type MonthlyValues } from "@/lib/schemas/monthly";
import { prettyMonth } from "@/lib/dates";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReportFormShell } from "@/components/form/report-form-shell";
import { CarryNotice } from "@/components/form/carry-notice";
import { Section, FieldGrid, SubHeading } from "@/components/form/section";
import {
  TextField,
  TextareaField,
  CheckboxField,
  RAGSelect,
  NumberedThree,
  RepeatableRows,
  ModelFunnelTable,
} from "@/components/form/fields";
import {
  saveMonthly,
  archiveMonthly,
  restoreMonthly,
  deleteMonthly,
} from "@/app/(app)/monthly/actions";
import { ReportActions } from "@/components/report-actions";

export function MonthlyForm({
  defaultValues,
  id,
  status,
  carriedFrom,
  archived = false,
  readOnly = false,
}: {
  defaultValues: MonthlyValues;
  id?: string;
  status: "draft" | "submitted";
  carriedFrom?: number;
  archived?: boolean;
  readOnly?: boolean;
}) {
  const methods = useForm<MonthlyValues>({
    resolver: zodResolver(monthlySchema) as Resolver<MonthlyValues>,
    defaultValues,
  });

  const month = methods.watch("month");

  return (
    <ReportFormShell
      methods={methods}
      onSave={saveMonthly}
      title="Monthly Report"
      subtitle={month ? prettyMonth(month) : undefined}
      listHref="/monthly"
      initialId={id}
      initialStatus={status}
      readOnly={readOnly}
      headerActions={
        id ? (
          <div className="flex items-center gap-2">
            {readOnly && (
              <Link href={`/monthly/${id}/edit`}>
                <Button type="button">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
            <ReportActions
              id={id}
              archived={archived}
              archiveAction={archiveMonthly}
              restoreAction={restoreMonthly}
              deleteAction={deleteMonthly}
              redirectTo="/monthly"
              variant="bar"
            />
          </div>
        ) : null
      }
    >
      {carriedFrom ? <CarryNotice count={carriedFrom} unit="weekly reports" /> : null}
      <Section title="Report month">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="monthpick">Month</Label>
          <Input
            id="monthpick"
            type="month"
            disabled={readOnly}
            defaultValue={month ? month.slice(0, 7) : ""}
            onChange={(e) =>
              methods.setValue(
                "month",
                e.target.value ? `${e.target.value}-01` : "",
                { shouldDirty: true },
              )
            }
            className="w-48"
          />
        </div>
      </Section>

      <Section title="Executive Summary">
        <RAGSelect name="exec.overall_rating" label="Overall month rating" />
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <NumberedThree name="exec.wins" label="🏆 Biggest wins" />
          <NumberedThree name="exec.challenges" label="🚨 Biggest challenges" />
          <NumberedThree name="exec.focus" label="🎯 Main focus next month" />
        </div>
      </Section>

      <Section number={1} title="Monthly Call Summary">
        <SubHeading>Topics discussed</SubHeading>
        <FieldGrid cols={2}>
          <TextField name="call.overall_revenue" label="Overall revenue" prefix="$" />
          <TextField name="call.biggest_concerns" label="Biggest concerns" />
          <TextField name="call.operational_updates" label="Operational updates" />
          <TextField name="call.training_updates" label="Training updates" />
          <TextField name="call.strategic_decisions" label="Strategic decisions" />
        </FieldGrid>
        <div className="mt-4">
          <TextareaField name="call.key_takeaways" label="Key takeaways" />
        </div>
      </Section>

      <Section number={2} title="Revenue Goals & Performance">
        <FieldGrid cols={2}>
          <TextField name="revenue.target" label="Target" prefix="$" />
          <TextField name="revenue.actual" label="Actual revenue" prefix="$" />
          <TextField name="revenue.green_days" label="Green days (goal hit)" />
          <TextField name="revenue.running_total" label="Running total" prefix="$" />
        </FieldGrid>
      </Section>

      <Section number={3} title="Missed Upsells (Monthly %)">
        <SubHeading>PPV funnel by model</SubHeading>
        <ModelFunnelTable name="upsells.models" goal={30} />
        <div className="mt-4">
          <TextField
            name="upsells.vs_goal"
            label="Open rate vs 30% goal (up / down)"
          />
        </div>
        <div className="mt-4">
          <TextareaField name="upsells.notes" label="Notes" rows={2} />
        </div>
      </Section>

      <Section number={4} title="PPV Campaign Review">
        <SubHeading>Every campaign this month (final numbers)</SubHeading>
        <RepeatableRows
          name="ppvCampaigns"
          addLabel="Add campaign"
          fields={[
            { name: "name", placeholder: "Campaign / date", wide: true },
            { name: "sent", placeholder: "Fans sent", kind: "number" },
            { name: "opens", placeholder: "Opens", kind: "number" },
            { name: "purchases", placeholder: "Purchases", kind: "number" },
            { name: "revenue", placeholder: "Revenue $", kind: "number" },
            { name: "conversion", placeholder: "Conversion %" },
          ]}
        />
      </Section>

      <Section number={5} title="Training Effectiveness Review">
        <TextareaField name="training.conducted" label="Trainings conducted this month" rows={2} />
        <div className="mt-5">
          <SubHeading>Results after training</SubHeading>
          <FieldGrid cols={2}>
            <CheckboxField name="training.results.unlock_ratio_improved" label="Unlock ratio improved" />
            <CheckboxField name="training.results.golden_ratio_decreased" label="Golden ratio decreased" />
            <CheckboxField name="training.results.sales_increased" label="Sales increased" />
            <CheckboxField name="training.results.engagement_improved" label="Engagement improved" />
          </FieldGrid>
        </div>
        <div className="mt-4 grid gap-4">
          <TextareaField name="training.not_improved" label="Areas where training did not improve results" rows={2} />
          <TextareaField name="training.next_priorities" label="Next training priorities" rows={2} />
        </div>
      </Section>

      <Section number={6} title="Team Development">
        <div className="grid gap-4">
          <TextareaField name="team.top_performers" label="⭐ Top performers" rows={2} />
          <TextareaField name="team.needing_support" label="📚 Chatters needing additional support" rows={2} />
          <TextareaField name="team.promotions_demotions" label="Recommended promotions / demotions" rows={2} />
        </div>
      </Section>

      <Section number={7} title="Whale & High-Value Client Review">
        <div className="grid gap-4">
          <TextareaField name="whales.new_high_value" label="New high-value whales" rows={2} />
          <TextareaField name="whales.retained" label="Retained whales" rows={2} />
          <TextareaField name="whales.lost" label="Lost whales" rows={2} />
          <TextareaField name="whales.recovery" label="Recovery opportunities" rows={2} />
        </div>
      </Section>

      <Section number={8} title="Holiday & Event Planning">
        <RepeatableRows
          name="events"
          label="Upcoming events"
          addLabel="Add event"
          fields={[
            { name: "event", placeholder: "Event" },
            { name: "status", placeholder: "Status" },
            { name: "content_ideas", placeholder: "Content ideas", wide: true },
          ]}
        />
      </Section>

      <Section title="Operational Health Check">
        <div className="grid gap-5 sm:grid-cols-2">
          <RAGSelect name="health.team_morale" label="Team morale" />
          <RAGSelect name="health.staffing" label="Staffing" />
          <RAGSelect name="health.sales_performance" label="Sales performance" />
          <RAGSelect name="health.process_compliance" label="Process compliance" />
        </div>
      </Section>

      <Section title="Strategic Goals for Next Month">
        <div className="grid gap-4">
          <TextField name="strategic.goal_1" label="Goal #1" />
          <TextField name="strategic.goal_2" label="Goal #2" />
          <TextField name="strategic.goal_3" label="Goal #3" />
          <TextareaField name="strategic.support_needed" label="Support needed from leadership" rows={2} />
          <TextareaField name="strategic.final_notes" label="Final notes" rows={2} />
        </div>
      </Section>

      <Section title="Custom items" description="Add anything specific to this month not covered above.">
        <RepeatableRows
          name="custom"
          addLabel="Add item"
          fields={[
            { name: "label", placeholder: "Label" },
            { name: "value", placeholder: "Details / note", wide: true },
          ]}
        />
      </Section>
    </ReportFormShell>
  );
}
