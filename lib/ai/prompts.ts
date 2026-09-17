import { CampaignEnhancementInput } from "./types";

export const AI_CAMPAIGN_ASSISTANT_SYSTEM_PROMPT = `
You are the AI Campaign Assistant for the Golf Charity Platform.
Your purpose is to help campaign organizers refine, structure, and articulate their charitable initiatives compellingly and transparently.

CRITICAL SAFETY & TRUTHFULNESS RULES:
1. NEVER fabricate or invent unprovided facts, statistics, numbers, credentials, partner names, or beneficiary stories.
2. NEVER claim a charity is government-certified, tax-exempt (80G/12A), or officially audited unless explicitly stated in the provided input.
3. Enhance clarity, emotional resonance, and donor readability while keeping all factual claims strictly anchored to the provided context.
4. If impact information or goals are missing, use general constructive wording or suggest placeholders for the organizer to specify.
5. Return ONLY a valid JSON object matching the requested schema without conversational filler.

OUTPUT SCHEMA (JSON):
{
  "improvedDescription": "A compelling, well-paragraphed campaign description formatted in clean text.",
  "shortSummary": "A concise 1-2 sentence hook highlighting the core mission.",
  "suggestedImpactPoints": [
    "Clear, transparent bullet point explaining how donor funds directly help",
    "Another transparent operational milestone"
  ],
  "suggestedFaqs": [
    {
      "question": "How will my donation be used?",
      "answer": "Direct explanation based on the campaign's stated objectives."
    }
  ]
}
`.trim();

export function buildCampaignEnhancementUserPrompt(input: CampaignEnhancementInput): string {
  return `
Please enhance and structure the following charity campaign:

Campaign Title: ${input.title}
Category: ${input.category}
Original Draft Description:
${input.description}

${input.targetAudience ? `Target Beneficiaries / Audience: ${input.targetAudience}` : ""}
${input.impactGoal ? `Stated Impact Goal: ${input.impactGoal}` : ""}

Please generate the structured JSON enhancement according to your system instructions.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 13 — Campaign Search Intent Extraction Prompts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * System prompt instructing the AI to extract a structured search intent
 * from a donor's natural-language query.
 *
 * CRITICAL RULES:
 * - AI must NOT invent campaign names, IDs, or data.
 * - AI must ONLY output the search intent JSON — nothing else.
 * - AI must restrict categories to the allowed enum values.
 */
export const AI_SEARCH_SYSTEM_PROMPT = `
You are a campaign search intent extractor for the Golf Charity Platform.
Your ONLY job is to convert a donor's natural-language search query into a structured JSON search intent.

STRICT RULES:
1. Return ONLY a valid JSON object. No explanation, no markdown, no preamble.
2. NEVER invent campaign names, IDs, statistics, or any campaign data.
3. NEVER use status values other than the allowed ones.
4. ONLY use these category values (case-sensitive):
   EDUCATION, HEALTHCARE, ENVIRONMENT, ANIMAL_WELFARE, DISASTER_RELIEF,
   FOOD, SPORTS, COMMUNITY, CHILD_WELFARE, ELDERLY_SUPPORT, OTHER
5. If a field cannot be determined from the query, omit it (do not use null).
6. Keywords should be simple meaningful words, maximum 5.
7. Amounts are in Indian Rupees (₹). Convert written amounts (e.g. "1 lakh" = 100000).
8. sortBy must be one of: newest, raised, oldest — or omit it.

OUTPUT SCHEMA (JSON):
{
  "category": "EDUCATION",
  "location": "Delhi",
  "keywords": ["children", "school"],
  "minAmount": 500,
  "maxAmount": 5000,
  "sortBy": "newest"
}

All fields are optional. Return {} if nothing specific can be extracted.
`.trim();

/**
 * Builds the user prompt for search intent extraction.
 * Sanitized — query is already cleaned before this is called.
 */
export function buildSearchUserPrompt(query: string): string {
  return `Extract a structured search intent from this donor query:\n\n"${query}"\n\nReturn ONLY the JSON object.`;
}

/**
 * Build a safe, human-readable summary of what the AI search found.
 * Uses only facts from the intent and count — never invents campaign data.
 */
export function buildSearchSummary(
  query: string,
  intent: { category?: string; location?: string; keywords?: string[] },
  count: number
): string {
  const parts: string[] = [];

  if (intent.category) {
    parts.push(intent.category.replace(/_/g, " ").toLowerCase());
  }
  if (intent.location) {
    parts.push(`in ${intent.location}`);
  }
  if (intent.keywords?.length) {
    parts.push(`matching "${intent.keywords.slice(0, 2).join(", ")}"`);
  }

  const description = parts.length > 0 ? parts.join(" ") : `"${query}"`;

  if (count === 0) return `No active campaigns found for ${description}.`;
  if (count === 1) return `Found 1 active campaign for ${description}.`;
  return `Found ${count} active campaigns for ${description}.`;
}

