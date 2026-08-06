import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  BookOpen,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const FAQ_ITEMS = [
  {
    question: "How do I create a campaign?",
    answer:
      "Navigate to Campaigns → Create Campaign in the sidebar. Fill in the campaign details and submit for admin review. Campaigns go live once approved.",
  },
  {
    question: "How long does organizer verification take?",
    answer:
      "Verification typically takes 2–3 business days. You'll receive an email notification once your application has been reviewed.",
  },
  {
    question: "How are donations processed?",
    answer:
      "Donations are processed securely through our payment gateway. Funds are transferred to the campaign organizer after a brief settlement period.",
  },
  {
    question: "Can I get a refund on my donation?",
    answer:
      "Refunds are handled on a case-by-case basis. Contact our support team with your transaction ID and we'll review your request within 5 business days.",
  },
  {
    question: "How do I withdraw my campaign funds?",
    answer:
      "Once your campaign ends, withdrawals are processed to the bank account on file in your Organization Profile. Withdrawals take 5–7 business days.",
  },
  {
    question: "How do I report a suspicious campaign?",
    answer:
      "Use the 'Report' button on any campaign page, or email our support team directly with the campaign link and details.",
  },
];

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="mt-1 text-sm text-slate-500">
          Find answers to common questions or contact our support team.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: <MessageSquare className="h-6 w-6" />,
            title: "Live Chat",
            description: "Chat with our support team in real time.",
            action: "Start Chat",
            color: "bg-emerald-100 text-emerald-600",
          },
          {
            icon: <Mail className="h-6 w-6" />,
            title: "Email Support",
            description: "Send us an email — we reply within 24 hours.",
            action: "support@golfcharity.in",
            color: "bg-blue-100 text-blue-600",
          },
          {
            icon: <BookOpen className="h-6 w-6" />,
            title: "Documentation",
            description: "Browse our full documentation and guides.",
            action: "View Docs",
            color: "bg-purple-100 text-purple-600",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
              {card.icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{card.description}</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {card.action}
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            Frequently Asked Questions
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {FAQ_ITEMS.map((item, i) => (
            <li key={i} className="px-6 py-4">
              <details className="group">
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <span className="text-sm font-medium text-slate-900">{item.question}</span>
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
