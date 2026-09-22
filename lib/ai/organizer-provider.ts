import { getOrganizerSystemPrompt, buildOrganizerUserPrompt } from "./prompts";
import {
  OrganizerAiInput,
  OrganizerAiOperation,
  OrganizerAiOutputData,
  OrganizerAiResponse,
  SingleContentOutputSchema,
  TitleSuggestionsOutputSchema,
  FaqOutputSchema,
} from "./organizer-types";

/**
 * Selects the correct Zod output schema for the given operation and
 * validates the raw AI response JSON against it.
 *
 * Returns the validated data, or null if validation fails.
 */
function validateOperationOutput(
  operation: OrganizerAiOperation,
  raw: unknown
): OrganizerAiOutputData | null {
  if (operation === "GENERATE_TITLE") {
    const result = TitleSuggestionsOutputSchema.safeParse(raw);
    return result.success ? result.data : null;
  }
  if (operation === "GENERATE_FAQ") {
    const result = FaqOutputSchema.safeParse(raw);
    return result.success ? result.data : null;
  }
  // All other operations return SingleContentOutput
  const result = SingleContentOutputSchema.safeParse(raw);
  return result.success ? result.data : null;
}

/**
 * Server-side AI Provider Dispatcher for Organizer Operations.
 *
 * Gemini 1.5 Flash → OpenAI gpt-4o-mini → deterministic text fallback.
 *
 * CRITICAL SAFETY:
 * - Never called from client-side code.
 * - All output is Zod-validated before returning.
 * - AI never receives PII, payment data, or admin notes.
 * - AI never directly queries or modifies the database.
 */
export async function executeOrganizerAiOperation(
  operation: OrganizerAiOperation,
  input: OrganizerAiInput
): Promise<OrganizerAiResponse> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = getOrganizerSystemPrompt(operation);
  const userPrompt = buildOrganizerUserPrompt(operation, input);

  // ── 1. Google Gemini ────────────────────────────────────────────────────
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.4,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText: string =
          json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

        let parsed: unknown;
        try { parsed = JSON.parse(rawText); } catch { parsed = {}; }

        const validated = validateOperationOutput(operation, parsed);
        if (validated) {
          return { success: true, operation, data: validated, provider: "Google Gemini (gemini-1.5-flash)" };
        }
        console.warn("[OrganizerProvider] Gemini output failed Zod validation for", operation);
      }
    } catch (e) {
      console.warn("[OrganizerProvider] Gemini error:", e);
    }
  }

  // ── 2. OpenAI ──────────────────────────────────────────────────────────
  if (openAiApiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const rawText: string = json.choices?.[0]?.message?.content?.trim() || "{}";

        let parsed: unknown;
        try { parsed = JSON.parse(rawText); } catch { parsed = {}; }

        const validated = validateOperationOutput(operation, parsed);
        if (validated) {
          return { success: true, operation, data: validated, provider: "OpenAI (gpt-4o-mini)" };
        }
        console.warn("[OrganizerProvider] OpenAI output failed Zod validation for", operation);
      }
    } catch (e) {
      console.warn("[OrganizerProvider] OpenAI error:", e);
    }
  }

  // ── 3. Deterministic Fallback ─────────────────────────────────────────
  // Always returns structured, safe suggestions even without API keys.
  const fallback = buildDeterministicFallback(operation, input);
  return {
    success: true,
    operation,
    data: fallback,
    provider: "Golf Charity Built-in Engine (Fallback)",
  };
}

/**
 * Deterministic fallback — produces structured, non-hallucinated output
 * when both AI providers are unavailable or fail validation.
 *
 * No invented statistics, certifications, or claims.
 */
function buildDeterministicFallback(
  operation: OrganizerAiOperation,
  input: OrganizerAiInput
): OrganizerAiOutputData {
  const title = input.title || "this campaign";
  const category = (input.category || "charitable").replace(/_/g, " ").toLowerCase();
  const org = input.organizationName || "our organization";

  switch (operation) {
    case "GENERATE_TITLE":
      return {
        suggestions: [
          `Support ${title}`,
          `Help Us With ${title}`,
          `Join the ${title} Initiative`,
        ],
      };

    case "GENERATE_FAQ":
      return {
        faqs: [
          {
            question: "How will my donation be used?",
            answer: `All donations go directly toward ${title}. [Add specific fund allocation details here.]`,
          },
          {
            question: "Is my donation tax-deductible?",
            answer: `Please check with ${org} for tax exemption eligibility. [Add your 80G/12A details here if applicable.]`,
          },
          {
            question: "How can I track the campaign's progress?",
            answer: "You can monitor real-time progress on this campaign page. We will post updates regularly.",
          },
          {
            question: "Who will benefit from this campaign?",
            answer: `This campaign supports ${category} initiatives. [Add specific beneficiary details here.]`,
          },
        ],
      };

    case "IMPROVE_DESCRIPTION":
    case "GENERATE_STORY":
    case "IMPROVE_STORY":
      return {
        content: `${title} is a ${category} campaign led by ${org}.\n\n${input.description || input.story || "[Add your campaign story here.]"}\n\nYour support makes a real difference. [Add specific impact details here.]`,
        notes: "Review this draft and add specific facts, beneficiary details, and your organization's verified achievements.",
      };

    case "GENERATE_SUMMARY":
      return {
        content: `${title} is a ${category} initiative by ${org}. We are raising funds to [add your specific goal here]. Every contribution counts.`,
        notes: "Add your specific impact goal and beneficiary information.",
      };

    case "GENERATE_CTA":
      return {
        content: `Join us in supporting ${title}. Your donation today directly funds our ${category} work. [Add donation impact details here.] Give now and be part of this change.`,
        notes: "Personalize this with your specific fundraising milestone or beneficiary story.",
      };

    case "GENERATE_SOCIAL_POST":
      return {
        content: `We need your help! 🙏 ${title} is raising funds for ${category} work. Every rupee counts. Support us today and help create real change. [Add campaign link] #Charity #GiveBack`,
        notes: "Add your campaign link and any verified impact milestone you've achieved.",
      };

    case "IMPROVE_READABILITY":
    case "ADJUST_TONE":
    case "SHORTEN":
    case "EXPAND":
      return {
        content: input.targetContent || input.description || "[Paste your content here to process it.]",
        notes: "AI service is currently unavailable. Please try again shortly or edit this content manually.",
      };
  }
}
