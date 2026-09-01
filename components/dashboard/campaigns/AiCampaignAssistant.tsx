"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, AlertCircle, RefreshCw, X, FileText, HelpCircle, Layers } from "lucide-react";
import { enhanceCampaignWithAiAction } from "@/app/actions/ai.actions";
import { CampaignEnhancementOutput } from "@/lib/ai/types";

interface AiCampaignAssistantProps {
  title: string;
  category: string;
  description: string;
  onApplyDescription: (text: string) => void;
  onApplyStory?: (text: string) => void;
}

export function AiCampaignAssistant({
  title,
  category,
  description,
  onApplyDescription,
  onApplyStory,
}: AiCampaignAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<CampaignEnhancementOutput | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [appliedDesc, setAppliedDesc] = useState(false);
  const [appliedStory, setAppliedStory] = useState(false);

  const handleGenerate = async () => {
    if (!title || title.trim().length < 3) {
      setError("Please provide a campaign title before enhancing.");
      setIsOpen(true);
      return;
    }

    if (!category) {
      setError("Please select a category before enhancing.");
      setIsOpen(true);
      return;
    }

    if (!description || description.trim().length < 10) {
      setError("Please type at least a brief 1-2 sentence draft description.");
      setIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsOpen(true);
      setAppliedDesc(false);
      setAppliedStory(false);

      const res = await enhanceCampaignWithAiAction({
        title,
        category,
        description,
      });

      if (!res.success || !res.data) {
        setError(res.error || "Failed to generate suggestions.");
      } else {
        setSuggestion(res.data);
        setProvider(res.provider || "AI Engine");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-800 transition hover:shadow-md disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        )}
        <span>✨ AI Description & Impact Assistant</span>
      </button>

      {/* Suggestion Modal / Drawer */}
      {isOpen && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs animate-in fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  AI Campaign Recommendations
                </h4>
                {provider && (
                  <p className="text-[10px] text-emerald-700 font-medium">
                    Powered by {provider}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition"
                title="Regenerate"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-slate-700">
                Crafting transparent impact points & polished wording…
              </p>
            </div>
          )}

          {!loading && suggestion && (
            <div className="space-y-4 pt-1">
              {/* Improved Description */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    Enhanced Campaign Narrative
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyDescription(suggestion.improvedDescription);
                      setAppliedDesc(true);
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
                      appliedDesc
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                    }`}
                  >
                    {appliedDesc ? <Check className="h-3 w-3" /> : null}
                    <span>{appliedDesc ? "Applied to Description" : "Apply to Description"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1">
                  {suggestion.improvedDescription}
                </p>
              </div>

              {/* Short Summary */}
              {onApplyStory && suggestion.shortSummary && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      Executive Hook / Short Summary
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyStory(suggestion.shortSummary);
                        setAppliedStory(true);
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
                        appliedStory
                          ? "bg-blue-100 text-blue-800"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                      }`}
                    >
                      {appliedStory ? <Check className="h-3 w-3" /> : null}
                      <span>{appliedStory ? "Applied as Story" : "Apply as Story"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {suggestion.shortSummary}
                  </p>
                </div>
              )}

              {/* Suggested Impact Points */}
              {suggestion.suggestedImpactPoints?.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-900">
                    Transparent Impact Deliverables
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                    {suggestion.suggestedImpactPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested FAQs */}
              {suggestion.suggestedFaqs?.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                    Suggested Donor FAQs
                  </span>
                  <div className="space-y-2">
                    {suggestion.suggestedFaqs.map((faq, i) => (
                      <div key={i} className="text-xs border-l-2 border-emerald-500 pl-2.5">
                        <p className="font-bold text-slate-800">{faq.question}</p>
                        <p className="text-slate-600 mt-0.5">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human in the loop disclaimer */}
              <p className="text-[11px] text-slate-400 italic">
                * AI suggestions are non-binding drafts. Please review all details for accuracy before submitting your campaign.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
