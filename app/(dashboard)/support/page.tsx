import { Metadata } from "next";
import { HelpCircle, Mail, MessageCircle, BookOpen, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Get help and support for using the platform",
};

export default function SupportPage() {
  const supportOptions = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      action: "View Docs",
      href: "#",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      href: "#",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll get back to you within 24 hours",
      action: "Send Email",
      href: "mailto:support@golfcharity.com",
    },
  ];

  const faqs = [
    {
      question: "How do I create a fundraising campaign?",
      answer: "Navigate to Campaigns → Create Campaign and fill in the required details.",
    },
    {
      question: "How long does organization verification take?",
      answer: "Verification typically takes 3-5 business days once all documents are submitted.",
    },
    {
      question: "What payment methods are supported?",
      answer: "We support all major credit/debit cards, UPI, and net banking through Razorpay.",
    },
    {
      question: "Can I get a donation receipt for tax purposes?",
      answer: "Yes, you can download tax receipts from your donation history.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">How can we help you?</h1>
        <p className="text-muted-foreground mt-2">
          Get answers to your questions or reach out to our support team
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search for help articles..."
          className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Support Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {supportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <a
              key={option.title}
              href={option.href}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-all text-center"
            >
              <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{option.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {option.description}
              </p>
              <span className="text-sm font-medium text-primary flex items-center justify-center gap-1">
                {option.action}
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          );
        })}
      </div>

      {/* FAQs */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <summary className="font-medium cursor-pointer flex items-center justify-between">
                {faq.question}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
        <h3 className="font-semibold text-blue-900 mb-2">
          Still need help?
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Our support team is here to help you with any questions or issues.
        </p>
        <a
          href="mailto:support@golfcharity.com"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
