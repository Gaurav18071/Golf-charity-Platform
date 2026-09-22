import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ORGANIZER_AI_OPERATIONS = [
  "IMPROVE_DESCRIPTION",
  "GENERATE_TITLE",
  "GENERATE_STORY",
  "IMPROVE_STORY",
  "GENERATE_SUMMARY",
  "GENERATE_CTA",
  "GENERATE_FAQ",
  "GENERATE_SOCIAL_POST",
  "IMPROVE_READABILITY",
  "ADJUST_TONE",
  "SHORTEN",
  "EXPAND",
] as const;

export type OrganizerAiOperation = (typeof ORGANIZER_AI_OPERATIONS)[number];

export const VALID_TONES = ["professional", "warm", "urgent", "inspiring", "simple"] as const;
export type ContentTone = (typeof VALID_TONES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// INPUT — Campaign context sent to AI
// Strictly limited: no PII, no payment data, no admin notes, no tokens
// ─────────────────────────────────────────────────────────────────────────────

export const OrganizerAiInputSchema = z.object({
  operation: z.enum(ORGANIZER_AI_OPERATIONS),

  // Campaign basics (organizer-provided only)
  title: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  story: z.string().max(8000).optional(),
  location: z.string().max(150).optional(),
  goalAmount: z.number().min(0).max(100_000_000).optional(),
  endDate: z.string().max(20).optional(),

  // Organization context (non-sensitive)
  organizationName: z.string().max(200).optional(),
  organizationType: z.string().max(50).optional(),

  // For content manipulation operations (SHORTEN, EXPAND, IMPROVE_READABILITY, ADJUST_TONE)
  targetContent: z.string().max(8000).optional(),

  // For ADJUST_TONE
  targetTone: z.enum(VALID_TONES).optional(),

  // Organizer-provided additional facts (they control what to include)
  additionalContext: z.string().max(1000).optional(),
});

export type OrganizerAiInput = z.infer<typeof OrganizerAiInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT SCHEMAS — One per operation, all Zod-validated before use
// ─────────────────────────────────────────────────────────────────────────────

/** Used by: IMPROVE_DESCRIPTION, GENERATE_STORY, IMPROVE_STORY, GENERATE_SUMMARY,
 *           GENERATE_CTA, GENERATE_SOCIAL_POST, IMPROVE_READABILITY, ADJUST_TONE,
 *           SHORTEN, EXPAND */
export const SingleContentOutputSchema = z.object({
  content: z.string().min(5).max(10000),
  notes: z.string().max(500).optional(), // optional writing tips for the organizer
});
export type SingleContentOutput = z.infer<typeof SingleContentOutputSchema>;

/** Used by: GENERATE_TITLE */
export const TitleSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string().min(5).max(200)).min(1).max(5),
});
export type TitleSuggestionsOutput = z.infer<typeof TitleSuggestionsOutputSchema>;

/** Used by: GENERATE_FAQ */
export const FaqOutputSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string().min(5).max(300),
        answer: z.string().min(10).max(1000),
      })
    )
    .min(1)
    .max(8),
});
export type FaqOutput = z.infer<typeof FaqOutputSchema>;

/** Union of all possible AI output types */
export type OrganizerAiOutputData =
  | SingleContentOutput
  | TitleSuggestionsOutput
  | FaqOutput;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE — Returned from server action to client
// ─────────────────────────────────────────────────────────────────────────────

export interface OrganizerAiResponse {
  success: boolean;
  operation: OrganizerAiOperation;
  data?: OrganizerAiOutputData;
  provider?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI METADATA — Human-readable labels for the assistant panel
// ─────────────────────────────────────────────────────────────────────────────

export interface OperationMeta {
  label: string;
  icon: string;
  description: string;
  group: "content" | "generate" | "refine";
  requiresContent: boolean;
}

export const OPERATION_META: Record<OrganizerAiOperation, OperationMeta> = {
  IMPROVE_DESCRIPTION: {
    label: "Improve Description",
    icon: "✨",
    description: "Polish and improve your campaign description",
    group: "refine",
    requiresContent: true,
  },
  GENERATE_TITLE: {
    label: "Suggest Titles",
    icon: "💡",
    description: "Get 3 compelling title ideas",
    group: "generate",
    requiresContent: false,
  },
  GENERATE_STORY: {
    label: "Generate Story",
    icon: "📖",
    description: "Create a compelling campaign story",
    group: "generate",
    requiresContent: false,
  },
  IMPROVE_STORY: {
    label: "Improve Story",
    icon: "📝",
    description: "Refine and enhance your existing story",
    group: "refine",
    requiresContent: true,
  },
  GENERATE_SUMMARY: {
    label: "Generate Summary",
    icon: "📋",
    description: "Create a concise campaign summary",
    group: "generate",
    requiresContent: false,
  },
  GENERATE_CTA: {
    label: "Generate CTA",
    icon: "🎯",
    description: "Craft a powerful call-to-action",
    group: "generate",
    requiresContent: false,
  },
  GENERATE_FAQ: {
    label: "Generate FAQs",
    icon: "❓",
    description: "Create donor-focused FAQs",
    group: "generate",
    requiresContent: false,
  },
  GENERATE_SOCIAL_POST: {
    label: "Social Media Post",
    icon: "📢",
    description: "Create a shareable social post",
    group: "generate",
    requiresContent: false,
  },
  IMPROVE_READABILITY: {
    label: "Improve Readability",
    icon: "👓",
    description: "Make content clearer and easier to read",
    group: "refine",
    requiresContent: true,
  },
  ADJUST_TONE: {
    label: "Adjust Tone",
    icon: "🎨",
    description: "Change writing style and tone",
    group: "refine",
    requiresContent: true,
  },
  SHORTEN: {
    label: "Make Shorter",
    icon: "✂️",
    description: "Condense content while keeping key points",
    group: "refine",
    requiresContent: true,
  },
  EXPAND: {
    label: "Expand Content",
    icon: "📐",
    description: "Add depth and detail to content",
    group: "refine",
    requiresContent: true,
  },
};
