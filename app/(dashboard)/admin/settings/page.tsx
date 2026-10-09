import { Metadata } from "next";
import { Settings, Database, Mail, Shield, Palette, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Settings | Admin",
  description: "Configure platform-wide settings and preferences",
};

export default function AdminSettingsPage() {
  const settingsSections = [
    {
      icon: Database,
      title: "Database Configuration",
      description: "Manage database connections and backups",
      status: "Active",
      statusColor: "text-green-600 bg-green-50",
    },
    {
      icon: Mail,
      title: "Email & Notifications",
      description: "Configure SMTP settings and notification preferences",
      status: "Needs Setup",
      statusColor: "text-yellow-600 bg-yellow-50",
    },
    {
      icon: Shield,
      title: "Security & Authentication",
      description: "Manage authentication providers and security policies",
      status: "Active",
      statusColor: "text-green-600 bg-green-50",
    },
    {
      icon: Palette,
      title: "Branding & Appearance",
      description: "Customize platform colors, logos, and themes",
      status: "Coming Soon",
      statusColor: "text-gray-600 bg-gray-50",
    },
    {
      icon: Globe,
      title: "Regional Settings",
      description: "Configure timezone, currency, and language options",
      status: "Active",
      statusColor: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">
              Platform Configuration
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              These settings affect the entire platform. Changes here will be
              applied globally for all users.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${section.statusColor}`}
                >
                  {section.status}
                </span>
              </div>

              <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {section.description}
              </p>

              <button className="text-sm font-medium text-primary hover:underline">
                Configure →
              </button>
            </div>
          );
        })}
      </div>

      {/* Current Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>

        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Platform Name</span>
            <span className="text-sm text-muted-foreground">
              Golf Charity Platform
            </span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Environment</span>
            <span className="text-sm text-muted-foreground">Development</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Database</span>
            <span className="text-sm text-green-600">✓ Connected (Neon PostgreSQL)</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Authentication</span>
            <span className="text-sm text-green-600">✓ Active (Supabase)</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Storage</span>
            <span className="text-sm text-green-600">✓ Connected (Supabase Storage)</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Payment Gateway</span>
            <span className="text-sm text-yellow-600">⚠ Test Mode (Razorpay)</span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-sm font-medium">Email Service</span>
            <span className="text-sm text-yellow-600">⚠ Not Configured</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              Configuration Changes
            </h3>
            <p className="text-sm text-yellow-800 mt-1">
              Modifying system settings requires careful consideration. Always
              backup your configuration before making changes and test in a
              development environment first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
