import {
  AI_IMPACT_ASSISTANT_SYSTEM_PROMPT,
  buildImpactUserPrompt,
} from "./prompts";
import {
  GroundedCampaignContext,
  ImpactAnswerOutput,
  ImpactAnswerOutputSchema,
} from "./impact-types";

/**
 * Calls Gemini → OpenAI → deterministic fallback to answer a donor's
 * question about a specific campaign using only grounded, pre-retrieved data.
 *
 * CRITICAL SAFETY CONTRACT:
 * - AI NEVER queries the database. Data is retrieved by Prisma BEFORE this call.
 * - AI receives only the safe GroundedCampaignContext (no adminNotes, no tokens).
 * - Every AI response is Zod-validated before returning.
 * - Malformed AI output falls through to the next provider, then to the fallback.
 * - The fallback never invents information — it generates a grounded plain answer.
 */
export async function executeImpactAnswer(
  question: string,
  ctx: GroundedCampaignContext
): Promise<{ data: ImpactAnswerOutput; provider: string }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = AI_IMPACT_ASSISTANT_SYSTEM_PROMPT;
  const userPrompt = buildImpactUserPrompt(question, ctx);

  // ── 1. Google Gemini ────────────────────────────────────────────────────
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
              temperature: 0.15, // Low temperature for factual Q&A
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const rawText: string =
          json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

        let parsed: unknown;
        try { parsed = JSON.parse(rawText); } catch { parsed = {}; }

        const validated = ImpactAnswerOutputSchema.safeParse(parsed);
        if (validated.success) {
          return { data: validated.data, provider: "Google Gemini (gemini-1.5-flash)" };
        }
        console.warn("[ImpactProvider] Gemini output failed Zod validation:", validated.error.issues);
      }
    } catch (e) {
      console.warn("[ImpactProvider] Gemini error:", e);
    }
  }

  // ── 2. OpenAI ──────────────────────────────────────────────────────────
  if (openAiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.15,
          max_tokens: 1024,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawText: string = json.choices?.[0]?.message?.content?.trim() || "{}";

        let parsed: unknown;
        try { parsed = JSON.parse(rawText); } catch { parsed = {}; }

        const validated = ImpactAnswerOutputSchema.safeParse(parsed);
        if (validated.success) {
          return { data: validated.data, provider: "OpenAI (gpt-4o-mini)" };
        }
        console.warn("[ImpactProvider] OpenAI output failed Zod validation:", validated.error.issues);
      }
    } catch (e) {
      console.warn("[ImpactProvider] OpenAI error:", e);
    }
  }

  // ── 3. Deterministic Fallback ─────────────────────────────────────────
  // Produces a grounded answer using only the campaign data fields.
  // Never invents anything — uses only what is in ctx.
  const fallback = buildDeterministicAnswer(question, ctx);
  return { data: fallback, provider: "Built-in Engine (Fallback)" };
}

/**
 * Deterministic fallback — produces grounded answers without any AI call.
 * Uses only verified campaign context fields.
 */
function buildDeterministicAnswer(
  question: string,
  ctx: GroundedCampaignContext
): ImpactAnswerOutput {
  const q = question.toLowerCase();

  // Financial / goal questions
  if (/(goal|target|how much|raising|amount|fund|₹|inr|rupee)/.test(q)) {
    const remaining = ctx.remainingAmount;
    return {
      answer: `${ctx.title} has a fundraising goal of ₹${ctx.goalAmount.toLocaleString("en-IN")}. As of now, ₹${ctx.currentAmount.toLocaleString("en-IN")} has been raised (${ctx.percentFunded}% of the goal), with ₹${remaining.toLocaleString("en-IN")} still needed. The campaign has ${ctx.donorCount} supporter${ctx.donorCount !== 1 ? "s" : ""}.`,
      confidence: "verified",
      suggestedQuestions: [
        "What is this campaign trying to achieve?",
        "When does this campaign end?",
      ],
    };
  }

  // Progress questions
  if (/(progress|raised|how far|percent|supporter|donor)/.test(q)) {
    return {
      answer: `This campaign has raised ₹${ctx.currentAmount.toLocaleString("en-IN")} of its ₹${ctx.goalAmount.toLocaleString("en-IN")} goal — that is ${ctx.percentFunded}% funded by ${ctx.donorCount} supporter${ctx.donorCount !== 1 ? "s" : ""}. ${ctx.daysLeft > 0 ? `There are ${ctx.daysLeft} days remaining.` : "The campaign period has ended."}`,
      confidence: "verified",
    };
  }

  // End date / time questions
  if (/(end|deadline|close|when|days|remaining|expire)/.test(q)) {
    return {
      answer: ctx.daysLeft > 0
        ? `The campaign ends on ${ctx.endDate} — ${ctx.daysLeft} day${ctx.daysLeft !== 1 ? "s" : ""} from now.`
        : `This campaign's fundraising period ended on ${ctx.endDate}.`,
      confidence: "verified",
    };
  }

  // Beneficiary questions
  if (/(beneficiar|who.*help|who.*benefit|recipient)/.test(q)) {
    if (!ctx.hasBeneficiaryInfo && !ctx.hasStory) {
      return {
        answer: "The campaign page does not currently provide specific beneficiary information. You can contact the organizer directly for more details.",
        confidence: "unavailable",
        disclaimer: "No beneficiary information was found in the campaign data.",
      };
    }
    const parts: string[] = [];
    if (ctx.beneficiaryName) parts.push(`The named beneficiary is: ${ctx.beneficiaryName}.`);
    if (ctx.hasStory) parts.push("Additional context is available in the campaign story on the campaign page.");
    return {
      answer: parts.join(" ") || "Please see the campaign story for beneficiary information.",
      confidence: "organizer_claim",
      disclaimer: "This information is provided by the campaign organizer and has not been independently verified by the platform.",
    };
  }

  // Organization / verification
  if (/(organiz|ngo|who.*run|trust|verified|legitimate)/.test(q)) {
    const verificationNote = ctx.organizationVerified
      ? "The organization has been verified by the Golf Charity Platform."
      : "This organization has not yet completed platform verification.";
    return {
      answer: `This campaign is run by ${ctx.organizationName} (${ctx.organizationType}), based in ${ctx.organizationCity ?? "India"}. ${verificationNote}`,
      confidence: "verified",
    };
  }

  // Purpose / what does this do
  if (/(purpose|what.*for|achiev|objective|mission|goal.*campaign|what.*do)/.test(q)) {
    const desc = ctx.hasDescription ? ctx.shortDescription : (ctx.story?.slice(0, 300) ?? "");
    if (!desc) {
      return {
        answer: `${ctx.title} is a ${ctx.category.replace(/_/g, " ").toLowerCase()} campaign. No additional description has been provided by the organizer.`,
        confidence: "organizer_claim",
        disclaimer: "No detailed description was provided for this campaign.",
      };
    }
    return {
      answer: `${ctx.title} is a ${ctx.category.replace(/_/g, " ").toLowerCase()} campaign. According to the organizer: "${desc}"`,
      confidence: "organizer_claim",
      disclaimer: "This description is provided by the campaign organizer and has not been independently verified.",
    };
  }

  // Impact questions — unavailable if not in story
  if (/(impact|result|outcome|achiev|success|help.*so far)/.test(q)) {
    if (!ctx.hasStory) {
      return {
        answer: "The campaign page does not currently provide reported impact information. The organizer has not yet added a campaign story with impact details.",
        confidence: "unavailable",
        disclaimer: "Impact information is not available in the current campaign data.",
      };
    }
    return {
      answer: `Impact details may be found in the campaign story on this page. The campaign has raised ₹${ctx.currentAmount.toLocaleString("en-IN")} with support from ${ctx.donorCount} donor${ctx.donorCount !== 1 ? "s" : ""}. Note that impact claims in the story are organizer-provided and not independently verified by the platform.`,
      confidence: "organizer_claim",
      disclaimer: "Impact claims are organizer-provided and not independently verified.",
      suggestedQuestions: ["How much has this campaign raised?", "Who benefits from this campaign?"],
    };
  }

  // Default — summarize what we know
  return {
    answer: `${ctx.title} is an active ${ctx.category.replace(/_/g, " ").toLowerCase()} campaign by ${ctx.organizationName}. It has raised ₹${ctx.currentAmount.toLocaleString("en-IN")} of its ₹${ctx.goalAmount.toLocaleString("en-IN")} goal (${ctx.percentFunded}%) with ${ctx.daysLeft} day${ctx.daysLeft !== 1 ? "s" : ""} remaining. For specific information on the topic you asked about, please check the full campaign page.`,
    confidence: "verified",
    suggestedQuestions: [
      "What is this campaign trying to achieve?",
      "How much has been raised?",
      "Who will benefit from this campaign?",
    ],
  };
}
