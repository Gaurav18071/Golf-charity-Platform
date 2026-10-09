"use client";

import { useState } from "react";
import { X, Info, User, UserCircle, Shield, Clock } from "lucide-react";

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  icon: typeof User;
  color: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "Admin",
    email: "admin@golfcharity.com",
    password: "Demo@123",
    icon: Shield,
    color: "bg-red-500",
    description: "Full platform access, manage users & campaigns",
  },
  {
    role: "Organizer",
    email: "organizer@golfcharity.com",
    password: "Demo@123",
    icon: UserCircle,
    color: "bg-blue-500",
    description: "Create campaigns, manage organization",
  },
  {
    role: "Donor",
    email: "donor@golfcharity.com",
    password: "Demo@123",
    icon: User,
    color: "bg-purple-500",
    description: "Browse campaigns, make donations",
  },
  {
    role: "Pending Organizer",
    email: "pending@golfcharity.com",
    password: "Demo@123",
    icon: Clock,
    color: "bg-yellow-500",
    description: "Awaiting admin approval",
  },
];

interface DemoBannerProps {
  onSelectAccount?: (email: string, password: string) => void;
}

export function DemoBanner({ onSelectAccount }: DemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleSelectAccount = (email: string, password: string) => {
    setSelectedEmail(email);
    
    // Call parent callback to fill form
    if (onSelectAccount) {
      onSelectAccount(email, password);
    }
    
    // Also copy to clipboard as backup
    navigator.clipboard.writeText(`${email}\n${password}`);
    
    // Visual feedback
    setTimeout(() => setSelectedEmail(null), 1500);
  };

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">
            Demo Mode - Try Different Roles
          </h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-800"
          aria-label="Close demo banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-blue-800">
        This is a demo environment with pre-configured accounts. Click any
        account below to autofill the login form and explore the platform.
      </p>

      {/* Demo Accounts Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const isSelected = selectedEmail === account.email;

          return (
            <button
              key={account.email}
              onClick={() =>
                handleSelectAccount(account.email, account.password)
              }
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                isSelected
                  ? "border-green-400 bg-green-50 ring-2 ring-green-400 ring-opacity-50"
                  : "border-blue-200 bg-white hover:border-blue-400"
              }`}
            >
              {/* Icon */}
              <div className={`rounded-full ${account.color} p-2 text-white`}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {account.role}
                  </h4>
                  {isSelected && (
                    <span className="text-xs font-medium text-green-600 animate-in fade-in">
                      ✓ Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1 truncate">
                  {account.email}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {account.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-3 flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2">
        <Info className="h-4 w-4 flex-shrink-0 text-blue-700" />
        <p className="text-xs text-blue-900">
          <strong>Password for all accounts:</strong> Demo@123 • Click any card
          to autofill the form
        </p>
      </div>
    </div>
  );
}
