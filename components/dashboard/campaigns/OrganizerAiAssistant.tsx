"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  X,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  Info,
} from "lucide-react";
import { runOrganizerAssistantAction } from "@/app/actions/ai.actions";
import {
  OrganizerAiOperation,
  OrganizerAiInput,
  OrganizerAiResponse,
  OrganizerAiOutputData,
  SingleContentOutput,
  TitleSuggestionsOutput,
  FaqOutput,
  OPERATION_META,
  VALID_TONES,
  ContentTone,
} from "@/lib/ai/organizer-types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OrganizerAiContext {
  title?: string;
  category?: string;
  description?: string;
  story?: string;
  location?: string;
  goalAmount?: number;
  endDate?: string;
  organizationName?: string;
  organizationType?: string;
}

export interface OrganizerAiAssistantProps {
  /** Campaign context from the form — auto-populated */
  context: OrganizerAiContext;
  /** Called when the organizer clicks Apply on a single-content suggestion */
  onApplyContent: (field: "description" | "story" | "shortDescription", content: string) => void;
  /** Called when the organizer selects a title suggestion */
  onApplyTitle?: (title: string) => void;
  /** Optional campaignId for ownership verification */
  campaignId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Operation groups for the UI
// ─────────────────────────────────────────────────────────────────────────────

type OperationGroup = "generate" | "refine";

const GENERATE_OPS: OrganizerAiOperation[] = [
  "GENERATE_TITLE",
  "GENERATE_STORY",
  "GENERATE_SUMMARY",
  "GENERATE_CTA",
  "GENERATE_FAQ",
  "GENERATE_SOCIAL_POST",
];

const REFINE_OPS: OrganizerAiOperation[] = [
  "IMPROVE_DESCRIPTION",
  "IMPROVE_STORY",
  "IMPROVE_READABILITY",
  "ADJUST_TONE",
  "SHORTEN",
  "EXPAND",
];

// ─────────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────────

function isTitleOutput(data: OrganizerAiOutputData): data is TitleSuggestionsOutput {
  return "suggestions" in data;
}
function isFaqOutput(data: OrganizerAiOutputData): data is FaqOutput {
  return "faqs" in data;
}
function isSingleContent(data: OrganizerAiOutputData): data is SingleContentOutput {
  return "content" in data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function TitleSuggestionsPanel({
  data,
  onApply,
}: {
  data: TitleSuggestionsOutput;
  onApply?: (title: string) => void;
}) {
  const [applied, setApplied] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700 mb-2">
        💡 Select a title to apply:
      </p>
      {data.suggestions.map((title, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <span className="text-sm text-slate-800 flex-1">{title}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <CopyButton text={title} />
            {onApply && (
              <button
                type="button"
                onClick={() => {
                  onApply(title);
                  setApplied(i);
                }}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  applied === i
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {applied === i ? <Check className="h-3 w-3" /> : null}
                {applied === i ? "Applied" : "Apply"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqPanel({ data }: { data: FaqOutput }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-700">
        ❓ Suggested FAQs — copy and add these to your campaign:
      </p>
      {data.faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold text-slate-900 flex-1">{faq.question}</p>
            <CopyButton text={`Q: ${faq.question}\nA: ${faq.answer}`} />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}

function SingleContentPanel({
  data,
  operation,
  onApply,
}: {
  data: SingleContentOutput;
  operation: OrganizerAiOperation;
  onApply: (field: "description" | "story" | "shortDescription", content: string) => void;
}) {
  const [edited, setEdited] = useState(data.content);
  const [applyTarget, setApplyTarget] = useState<"description" | "story" | "shortDescription">("description");
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApply(applyTarget, edited);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  // Determine which targets make sense for the operation
  const showStoryTarget =
    operation === "GENERATE_STORY" || operation === "IMPROVE_STORY";
  const showSummaryTarget =
    operation === "GENERATE_SUMMARY" || operation === "GENERATE_CTA";

  return (
    <div className="space-y-3">
      {/* Editable suggestion */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-slate-700">AI Suggestion — edit before applying:</p>
          <CopyButton text={edited} />
        </div>
        <textarea
          value={edited}
          onChange={(e) => {
            setEdited(e.target.value);
            setApplied(false);
          }}
          rows={Math.min(12, Math.max(4, edited.split("\n").length + 2))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-800 leading-relaxed focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
          aria-label="Editable AI suggestion"
        />
      </div>

      {/* Notes from AI */}
      {data.notes && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{data.notes}</span>
        </div>
      )}

      {/* Apply controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Target field selector */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden text-xs font-semibold">
          <button
            type="button"
            onClick={() => setApplyTarget("description")}
            className={`px-3 py-1.5 transition ${applyTarget === "description" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            → Description
          </button>
          {showStoryTarget && (
            <button
              type="button"
              onClick={() => setApplyTarget("story")}
              className={`px-3 py-1.5 transition border-l border-slate-200 ${applyTarget === "story" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              → Story
            </button>
          )}
          {showSummaryTarget && (
            <button
              type="button"
              onClick={() => setApplyTarget("shortDescription")}
              className={`px-3 py-1.5 transition border-l border-slate-200 ${applyTarget === "shortDescription" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              → Summary
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleApply}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition ${
            applied
              ? "bg-emerald-100 text-emerald-800"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
          aria-label={`Apply to ${applyTarget}`}
        >
          {applied ? <Check className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {applied ? "Applied ✓" : "Apply to Form"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

type UiState = "idle" | "loading" | "success" | "error";

export function OrganizerAiAssistant({
  context,
  onApplyContent,
  onApplyTitle,
  campaignId,
}: OrganizerAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<OperationGroup>("generate");
  const [selectedOp, setSelectedOp] = useState<OrganizerAiOperation | null>(null);
  const [selectedTone, setSelectedTone] = useState<ContentTone>("professional");
  const [uiState, setUiState] = useState<UiState>("idle");
  const [result, setResult] = useState<OrganizerAiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = uiState === "loading";

  const handleRun = useCallback(
    async (op: OrganizerAiOperation) => {
      setSelectedOp(op);
      setUiState("loading");
      setErrorMessage(null);
      setResult(null);

      const aiInput: Omit<OrganizerAiInput, "operation"> = {
        title: context.title,
        category: context.category,
        description: context.description,
        story: context.story,
        location: context.location,
        goalAmount: context.goalAmount,
        endDate: context.endDate,
        organizationName: context.organizationName,
        organizationType: context.organizationType,
        // For refine operations, use the description as the target content
        targetContent:
          op === "ADJUST_TONE" ||
          op === "IMPROVE_READABILITY" ||
          op === "SHORTEN" ||
          op === "EXPAND"
            ? context.description
            : undefined,
        targetTone: op === "ADJUST_TONE" ? selectedTone : undefined,
      };

      try {
        const response = await runOrganizerAssistantAction(op, aiInput, campaignId);
        setResult(response);
        setUiState(response.success ? "success" : "error");
        if (!response.success) setErrorMessage(response.error ?? "Unknown error");
      } catch (e) {
        setUiState("error");
        setErrorMessage(e instanceof Error ? e.message : "Request failed");
      }
    },
    [context, selectedTone, campaignId]
  );

  const handleRegenerate = () => {
    if (selectedOp) handleRun(selectedOp);
  };

  const handleDismiss = () => {
    setResult(null);
    setUiState("idle");
    setSelectedOp(null);
    setErrorMessage(null);
  };

  const opsForGroup = activeGroup === "generate" ? GENERATE_OPS : REFINE_OPS;

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50/30">
      {/* Header / Trigger */}
      <button
        type="button"
        id="organizer-ai-assistant-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="organizer-ai-panel"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">✨ AI Content Assistant</p>
            <p className="text-xs text-slate-500">
              Generate or improve campaign content — you review before applying
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          id="organizer-ai-panel"
          className="border-t border-purple-200 p-4 space-y-4"
        >
          {/* Operation group tabs */}
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-xs font-semibold">
            {(["generate", "refine"] as OperationGroup[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setActiveGroup(g);
                  setUiState("idle");
                  setResult(null);
                  setSelectedOp(null);
                }}
                className={`flex-1 py-2 transition capitalize ${
                  activeGroup === g
                    ? "bg-purple-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {g === "generate" ? "🪄 Generate" : "✂️ Refine"}
              </button>
            ))}
          </div>

          {/* Tone selector — show when ADJUST_TONE is relevant */}
          {activeGroup === "refine" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 shrink-0">Tone:</span>
              <div className="flex flex-wrap gap-1.5">
                {VALID_TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTone(t)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize transition border ${
                      selectedTone === t
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Operation buttons */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {opsForGroup.map((op) => {
              const meta = OPERATION_META[op];
              const isRunning = selectedOp === op && isLoading;
              const isSelected = selectedOp === op && uiState !== "idle";
              return (
                <button
                  key={op}
                  type="button"
                  id={`ai-op-${op.toLowerCase()}`}
                  onClick={() => handleRun(op)}
                  disabled={uiState === "loading"}
                  className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition text-xs font-medium ${
                    isSelected
                      ? "border-purple-400 bg-purple-50 text-purple-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
                  } disabled:opacity-60`}
                  aria-label={meta.description}
                  title={meta.description}
                >
                  <span className="text-base leading-none">{meta.icon}</span>
                  <span className="font-semibold">
                    {isRunning ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Running…
                      </span>
                    ) : (
                      meta.label
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {uiState === "loading" && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-purple-200 bg-white py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <p className="text-sm font-semibold text-slate-700">
                {selectedOp ? OPERATION_META[selectedOp].description : "Generating…"}
              </p>
              <p className="text-xs text-slate-400">
                AI is working on your content — this takes a moment
              </p>
            </div>
          )}

          {/* Error State */}
          {uiState === "error" && errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">AI operation failed</p>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Success — Result Panel */}
          {uiState === "success" && result?.success && result.data && selectedOp && (
            <div className="rounded-xl border border-purple-200 bg-white p-4 space-y-3">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{OPERATION_META[selectedOp].icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {OPERATION_META[selectedOp].label}
                    </p>
                    {result.provider && (
                      <p className="text-[10px] text-purple-600 font-medium">
                        via {result.provider}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    title="Regenerate"
                    aria-label="Regenerate suggestion"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    title="Dismiss"
                    aria-label="Dismiss suggestion"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Operation-specific output */}
              {isTitleOutput(result.data) && (
                <TitleSuggestionsPanel data={result.data} onApply={onApplyTitle} />
              )}
              {isFaqOutput(result.data) && <FaqPanel data={result.data} />}
              {isSingleContent(result.data) && (
                <SingleContentPanel
                  data={result.data}
                  operation={selectedOp}
                  onApply={onApplyContent}
                />
              )}

              {/* Human-in-the-loop disclaimer */}
              <p className="text-[11px] text-slate-400 italic border-t border-slate-100 pt-2">
                ✱ AI content is a suggestion only. Review for accuracy before applying.
                AI does not verify facts, certifications, or financial claims.
              </p>
            </div>
          )}

          {/* Idle hint */}
          {uiState === "idle" && (
            <p className="text-center text-xs text-slate-400">
              Select an operation above to get AI-powered content suggestions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
