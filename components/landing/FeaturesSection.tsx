import { Calendar, TrendingUp, Heart, Gift } from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Monthly Draws",
    description: "Subscribe and participate in monthly prize draws.",
    color: "text-emerald-700 bg-emerald-50",
  },
  {
    icon: TrendingUp,
    title: "Track Scores",
    description: "Enter your golf scores and climb the leaderboard.",
    color: "text-emerald-700 bg-emerald-50",
  },
  {
    icon: Heart,
    title: "Support Charities",
    description: "Choose a charity and a portion of your subscription supports the cause.",
    color: "text-emerald-700 bg-emerald-50",
  },
  {
    icon: Gift,
    title: "Win Prizes",
    description: "Match numbers and win exciting prizes every month.",
    color: "text-emerald-700 bg-emerald-50",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-2xs transition hover:border-emerald-300 hover:bg-white hover:shadow-md"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
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