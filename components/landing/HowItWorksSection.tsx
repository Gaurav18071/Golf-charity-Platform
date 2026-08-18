import { UserCheck, Edit3, Gift, Trophy } from "lucide-react";

const STEPS = [
  {
    step: "1. Subscribe",
    icon: UserCheck,
    description: "Choose a plan and subscribe to participate in monthly draws.",
  },
  {
    step: "2. Enter Scores",
    icon: Edit3,
    description: "Enter your latest 5 golf scores in Stableford format.",
  },
  {
    step: "3. Get a Chance",
    icon: Gift,
    description: "Your scores become your lucky numbers in the draw.",
  },
  {
    step: "4. Win & Support",
    icon: Trophy,
    description: "Win prizes and support your selected charity.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 bg-slate-50/60 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How It Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Participating is simple. Play your regular golf, enter your scores, and make a real difference.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex flex-col items-center text-center relative z-10">
                {/* Step Icon Circle */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border-2 border-emerald-100 text-emerald-700 shadow-sm transition hover:scale-105 hover:border-emerald-500">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {item.step}
                </h3>
                <p className="text-xs text-slate-600 max-w-[220px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
