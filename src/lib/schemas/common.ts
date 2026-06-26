import { z } from "zod";
import { MODELS } from "@/lib/constants";

// Most fields are optional so a report can be saved as a partial draft.
export const str = z.string().optional().default("");
export const bool = z.boolean().optional().default(false);
export const rag = z.enum(["green", "amber", "red"]).or(z.literal("")).default("");

export const three = z
  .array(z.string())
  .length(3)
  .optional()
  .default(["", "", ""]);

// Growable list of free-text entries (e.g. wins, follow-ups). Reads old
// fixed-length-3 arrays fine, but has no length cap so the UI can add more.
export const list = z.array(z.string()).optional().default([]);

export const status = z.enum(["draft", "submitted"]).default("draft");

// Ad-hoc custom entries for a specific report (label + note). Lets the manager
// add anything the template doesn't cover for that day/week/month.
export const customItems = z
  .array(z.object({ label: str, value: str }))
  .default([]);

export type RAG = "green" | "amber" | "red" | "";

// Per-model PPV funnel cell, shared by the Missed Upsells board across daily,
// weekly and monthly reports. Open-rate = ppv4 / ppv1, tracked vs a goal in UI.
export const funnelCell = z.object({
  ppv1: str,
  ppv4: str,
  missed: str,
  issue: str,
});
export const emptyFunnel = (): Record<string, z.infer<typeof funnelCell>> =>
  Object.fromEntries(
    MODELS.map((m) => [m, { ppv1: "", ppv4: "", missed: "", issue: "" }]),
  );
export const funnelRecord = z
  .record(z.string(), funnelCell)
  .default(emptyFunnel);
