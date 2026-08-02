import type { ReactNode } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type StepStatus = "completed" | "current" | "pending";

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
}

interface ProgressCardProps {
  title: string;
  description?: string;
  steps: ProgressStep[];
  /** 0–100 */
  percentage?: number;
  badge?: ReactNode;
}

const STEP_ICON: Record<StepStatus, ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  current:   <Clock className="h-5 w-5 text-amber-500" />,
  pending:   <Circle className="h-5 w-5 text-slate-300" />,
};

const STEP_LABEL_STYLE: Record<StepStatus, string> = {
  completed: "text-slate-900 font-semibold",
  current:   "text-amber-700 font-semibold",
  pending:   "text-slate-400",
};

/**
 * ProgressCard
 *
 * Step-by-step progress tracker.
 * Used for organizer verification status and campaign completion.
 */
export function ProgressCard({
  title,
  description,
  steps,
  percentage,
  badge,
}: ProgressCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Overall progress bar */}
      {percentage !== undefined && (
        <div className="mb-5 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-semibold text-slate-700">{percentage}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-start gap-3">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div className="mt-0.5">{STEP_ICON[step.status]}</div>
              {i < steps.length - 1 && (
                <div className={[
                  "mt-1 w-px flex-1 min-h-[20px]",
                  step.status === "completed" ? "bg-emerald-300" : "bg-slate-200",
                ].join(" ")} />
              )}
            </div>

            <div className="pb-3">
              <p className={`text-sm ${STEP_LABEL_STYLE[step.status]}`}>
                {step.title}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
