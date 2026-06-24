import { z } from "zod";

// Most fields are optional so a report can be saved as a partial draft.
export const str = z.string().optional().default("");
export const bool = z.boolean().optional().default(false);
export const rag = z.enum(["green", "amber", "red"]).or(z.literal("")).default("");

export const three = z
  .array(z.string())
  .length(3)
  .optional()
  .default(["", "", ""]);

export const status = z.enum(["draft", "submitted"]).default("draft");

export type RAG = "green" | "amber" | "red" | "";
