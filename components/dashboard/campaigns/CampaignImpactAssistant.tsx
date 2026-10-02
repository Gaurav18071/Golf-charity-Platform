"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Info,
  HelpCircle,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { askCampaignImpactAction, getCampaignSuggestedQuestionsAction } from "@/app/actions/campaign-impact.actions";
import type { ImpactAssistantResponse } from "@/lib/ai/impact-types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignImpactAssistantProps {
  /** Campaign slug or UUID — verified server-side */
  campaignId: string;
  campaignTitle: string;
}

type UiState = "idle" | "loading_suggestions" | "ready" | "asking" | "answered" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// Confidence badge
// ─────────────────────────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        Platform-verified data
      </span>
    );
  }
  if (confidence === "organizer_claim") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
        <Info className="h-3 w-3" />
        Organizer-provided
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
      <HelpCircle className="h-3 w-3" />
      Information unavailable
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function CampaignImpactAssistant({
  campaignId,
  campaignTitle,
}: CampaignImpactAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uiState, setUiState] = useState<UiState>("idle");
  const [question, setQuestion] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [result, setResult] = useState<ImpactAssistantResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>("");

  const isAsking = uiState === "asking";

  // Load suggested questions when the panel opens
  useEffect(() => {
    if (!isOpen || suggestedQuestions.length > 0) return;

    // Use a microtask to avoid synchronous setState-in-effect lint warning
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setUiState("loading_suggestions");
      getCampaignSuggestedQuestionsAction(campaignId)
        .then((res) => {
          if (controller.signal.aborted) return;
          if (res.success) setSuggestedQuestions(res.questions);
          setUiState("ready");
        })
        .catch(() => {
          if (!controller.signal.aborted) setUiState("ready");
        });
    });
    return () => { controller.abort(); };
  }, [isOpen, campaignId, suggestedQuestions.length]);

  const handleAsk = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed || trimmed.length < 3) return;

      setLastQuestion(trimmed);
      setQuestion("");
      setUiState("asking");
      setResult(null);
      setErrorMessage(null);

      try {
        const res = await askCampaignImpactAction(trimmed, campaignId);
        setResult(res);
        setUiState(res.success ? "answered" : "error");
        if (!res.success) setErrorMessage(res.error ?? "An unknown error occurred.");
      } catch (e) {
        setUiState("error");
        setErrorMessage(e instanceof Error ? e.message : "Request failed. Please try again.");
      }
    },
    [campaignId]
  );

  const handleSuggestedClick = (q: string) => {
    setQuestion(q);
    handleAsk(q);
  };

  const handleRegenerate = () => {
    if (lastQuestion) handleAsk(lastQuestion);
  };

  const handleClear = () => {
    setResult(null);
    setUiState("ready");
    setErrorMessage(null);
    setLastQuestion("");
    setQuestion("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isAsking) {
      e.preventDefault();
      handleAsk(question);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/40">
      {/* Toggle Header */}
      <button
        type="button"
        id="campaign-impact-assistant-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={isOpen}
        aria-controls="campaign-impact-panel"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              💬 Ask About This Campaign
            </p>
            <p className="text-xs text-slate-500">
              AI assistant powered by verified campaign data
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
          id="campaign-impact-panel"
          className="border-t border-blue-200 p-4 space-y-4"
        >
          {/* Question Input */}
          <div className="flex gap-2">
            <input
              id="impact-question-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${campaignTitle}…`}
              disabled={isAsking}
              maxLength={400}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              aria-label="Ask a question about this campaign"
            />
            <button
              type="button"
              id="impact-ask-button"
              onClick={() => handleAsk(question)}
              disabled={isAsking || question.trim().length < 3}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
              aria-label="Submit question"
            >
              {isAsking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>

          {/* Suggested Questions */}
          {uiState === "ready" && suggestedQuestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestedClick(q)}
                    className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition text-left"
                    aria-label={`Ask: ${q}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading suggestions */}
          {uiState === "loading_suggestions" && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading suggested questions…
            </div>
          )}

          {/* Asking / Loading State */}
          {uiState === "asking" && (
            <div className="rounded-xl border border-dashed border-blue-200 bg-white p-6 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Looking up verified campaign data…</p>
              <p className="text-xs text-slate-400 text-center">
                The assistant retrieves real campaign data before generating an answer.
              </p>
              {lastQuestion && (
                <p className="text-xs text-blue-700 italic mt-1">
                  &ldquo;{lastQuestion}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {uiState === "error" && errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Could not answer your question</p>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                  aria-label="Retry question"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                  aria-label="Clear and ask another question"
                >
                  Ask another question
                </button>
              </div>
            </div>
          )}

          {/* Answer State */}
          {uiState === "answered" && result?.success && result.answer && (
            <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3">
              {/* Answer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">AI Answer</p>
                    {lastQuestion && (
                      <p className="text-[10px] text-slate-400 italic truncate max-w-[220px]">
                        &ldquo;{lastQuestion}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isAsking}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
                    title="Regenerate answer"
                    aria-label="Regenerate answer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
                    title="Ask another question"
                    aria-label="Close answer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Confidence Badge */}
              <ConfidenceBadge confidence={result.answer.confidence} />

              {/* Answer Text */}
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {result.answer.answer}
              </p>

              {/* Disclaimer */}
              {result.answer.disclaimer && (
                <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{result.answer.disclaimer}</span>
                </div>
              )}

              {/* Source Link */}
              {result.source && (
                <div className="border-t border-slate-100 pt-2.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Source</p>
                  <a
                    href={result.source.path}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                    aria-label={`View campaign: ${result.source.title}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {result.source.title}
                  </a>
                </div>
              )}

              {/* Suggested Follow-ups */}
              {result.answer.suggestedQuestions && result.answer.suggestedQuestions.length > 0 && (
                <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Follow-up questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.answer.suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestedClick(q)}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition text-left"
                        aria-label={`Ask follow-up: ${q}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Privacy & grounding notice */}
          {(uiState === "ready" || uiState === "loading_suggestions") && (
            <p className="text-[11px] text-slate-400 italic">
              ✱ Answers are generated using only verified campaign data from this platform.
              Financial figures come from platform records. Organizer-written content is labelled as such.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
