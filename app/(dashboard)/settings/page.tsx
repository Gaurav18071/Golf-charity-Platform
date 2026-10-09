import { Metadata } from "next";
import { User, Bell, Shield, Palette, Globe, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  const settingsSections = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Update your personal information and profile photo",
      href: "/profile",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure email and in-app notification preferences",
      href: "/notifications",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Manage your privacy settings and two-factor authentication",
      href: "/settings/security",
    },
    {
      icon: Key,
      title: "Password",
      description: "Change your password and security questions",
      href: "/settings/password",
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize your dashboard theme and layout preferences",
      href: "/settings/appearance",
    },
    {
      icon: Globe,
      title: "Language & Region",
      description: "Set your preferred language, timezone, and date format",
      href: "/settings/region",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.title}
              href={section.href}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-all hover:border-primary/50"
            >
              <div className="rounded-lg bg-primary/10 p-2.5 w-fit mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {section.description}
              </p>

              <span className="text-sm font-medium text-primary">
                Configure →
              </span>
            </a>
          );
        })}
      </div>

      {/* Account Information */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>

        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Account Status</span>
            <span className="text-sm text-green-600">✓ Active</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Email Verified</span>
            <span className="text-sm text-green-600">✓ Verified</span>
          </div>

          <div className="flex justify-between py-3 border-b">
            <span className="text-sm font-medium">Two-Factor Auth</span>
            <span className="text-sm text-muted-foreground">Not Enabled</span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-sm font-medium">Member Since</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-800 mb-4">
          Irreversible actions that affect your account
        </p>

        <div className="space-y-3">
          <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
            Export Account Data
          </button>
          <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors ml-0 sm:ml-3">
            Deactivate Account
          </button>
          <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors ml-0 sm:ml-3">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
