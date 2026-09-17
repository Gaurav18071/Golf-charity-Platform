import { AI_SEARCH_SYSTEM_PROMPT, buildSearchUserPrompt } from "./prompts";
import { SearchIntent, SearchIntentSchema } from "./search-types";
import { AiServiceResponse } from "./types";

/**
 * Calls Gemini → OpenAI → deterministic fallback to extract
 * a structured SearchIntent from a donor's natural-language query.
 *
 * CRITICAL: AI never queries the database. AI only interprets user intent.
 * The result is validated with Zod before use. Unknown or invalid fields
 * are stripped — never executed raw against Prisma.
 */
export async function executeSearchIntentExtraction(
  query: string
): Promise<AiServiceResponse<SearchIntent>> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const userPrompt = buildSearchUserPrompt(query);

  // ── 1. Google Gemini ──────────────────────────────────────────────────────
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
                parts: [
                  { text: `${AI_SEARCH_SYSTEM_PROMPT}\n\n${userPrompt}` },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1, // Low temperature for deterministic intent extraction
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText =
          json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

        const parsed = JSON.parse(rawText);
        const validated = SearchIntentSchema.safeParse(parsed);

        if (validated.success) {
          return {
            success: true,
            data: validated.data,
            provider: "Google Gemini (gemini-1.5-flash)",
          };
        }

        // Partial parse: return empty intent rather than crash
        console.warn("[SearchProvider] Gemini returned invalid intent schema:", validated.error.issues);
      }
    } catch (e) {
      console.warn("[SearchProvider] Gemini error, falling back:", e);
    }
  }

  // ── 2. OpenAI ─────────────────────────────────────────────────────────────
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
            { role: "system", content: AI_SEARCH_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const rawText = json.choices?.[0]?.message?.content?.trim() || "{}";
        const parsed = JSON.parse(rawText);
        const validated = SearchIntentSchema.safeParse(parsed);

        if (validated.success) {
          return {
            success: true,
            data: validated.data,
            provider: "OpenAI (gpt-4o-mini)",
          };
        }

        console.warn("[SearchProvider] OpenAI returned invalid intent schema:", validated.error.issues);
      }
    } catch (e) {
      console.warn("[SearchProvider] OpenAI error, falling back:", e);
    }
  }

  // ── 3. Deterministic Keyword Fallback ─────────────────────────────────────
  // Parses the query using simple keyword matching without any AI call.
  // Ensures search always works even without API keys configured.
  const intent = deterministicIntentExtraction(query);
  return {
    success: true,
    data: intent,
    provider: "Golf Charity Built-in Engine (Fallback)",
  };
}

/**
 * Deterministic fallback: extracts intent using keyword matching.
 * Safe, offline, zero API calls.
 */
function deterministicIntentExtraction(query: string): SearchIntent {
  const q = query.toLowerCase();
  const intent: SearchIntent = {};

  // Category detection
  if (/(educat|school|student|learn|college|universit)/.test(q)) {
    intent.category = "EDUCATION";
  } else if (/(health|hospital|medical|doctor|patient|disease|cancer|clinic)/.test(q)) {
    intent.category = "HEALTHCARE";
  } else if (/(environment|tree|green|climate|pollution|nature|forest)/.test(q)) {
    intent.category = "ENVIRONMENT";
  } else if (/(animal|pet|dog|cat|wildlife|bird)/.test(q)) {
    intent.category = "ANIMAL_WELFARE";
  } else if (/(disaster|flood|earthquake|relief|emergency|cyclone)/.test(q)) {
    intent.category = "DISASTER_RELIEF";
  } else if (/(food|hunger|meal|nutrition|feed)/.test(q)) {
    intent.category = "FOOD";
  } else if (/(sport|golf|cricket|football|athlete)/.test(q)) {
    intent.category = "SPORTS";
  } else if (/(communit|village|rural|urban)/.test(q)) {
    intent.category = "COMMUNITY";
  } else if (/(child|kid|orphan|youth|girl|boy|baby|infant)/.test(q)) {
    intent.category = "CHILD_WELFARE";
  } else if (/(elder|senior|old age|aged|grandp)/.test(q)) {
    intent.category = "ELDERLY_SUPPORT";
  }

  // Sort detection
  if (/(most raised|highest|top fundr|trending)/.test(q)) {
    intent.sortBy = "raised";
  } else if (/(oldest|first|earliest)/.test(q)) {
    intent.sortBy = "oldest";
  }

  // Amount extraction: "around 1000", "under 500", "1 lakh", "50k"
  const lakhMatch = q.match(/(\d+(?:\.\d+)?)\s*lakh/);
  if (lakhMatch) {
    const v = parseFloat(lakhMatch[1]) * 100000;
    if (q.includes("under") || q.includes("less") || q.includes("below") || q.includes("within") || q.includes("around") || q.includes("up to")) {
      intent.maxAmount = v;
    } else {
      intent.minAmount = v;
    }
  }

  const kMatch = q.match(/(\d+)\s*k\b/);
  if (kMatch) {
    const v = parseInt(kMatch[1]) * 1000;
    if (q.includes("under") || q.includes("less") || q.includes("below") || q.includes("within") || q.includes("around") || q.includes("up to")) {
      intent.maxAmount = v;
    } else {
      intent.minAmount = v;
    }
  }

  const amountMatch = q.match(/(?:around|donate|₹|rs\.?|inr)\s*(\d{3,7})/);
  if (amountMatch && !intent.maxAmount) {
    const v = parseInt(amountMatch[1]);
    // "around X" → set as maxAmount (donor budget)
    intent.maxAmount = v * 2; // Give some range
  }

  // Extract keywords from what remains (after removing stop words)
  const stopWords = new Set([
    "show", "me", "find", "i", "want", "to", "support", "give",
    "donate", "around", "about", "where", "can", "please", "help",
    "a", "an", "the", "and", "or", "for", "in", "on", "at", "with",
    "campaigns", "campaign",
  ]);
  const words = q
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 5);

  if (words.length > 0) {
    intent.keywords = words;
  }

  return intent;
}
