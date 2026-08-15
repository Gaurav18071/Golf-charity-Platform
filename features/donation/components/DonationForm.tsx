"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  UserCheck,
  Building2,
  Lock,
} from "lucide-react";
import { createDonationAction, processPaymentAction } from "../actions/donation.actions";
import { PaymentGateway } from "@prisma/client";

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  organizationName?: string;
  goalAmount: number;
  currentAmount: number;
  isActive: boolean;
  donorName?: string;
  donorEmail?: string;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DonationForm({
  campaignId,
  campaignTitle,
  organizationName,
  goalAmount,
  currentAmount: initialCurrentAmount,
  isActive,
  donorName,
  donorEmail,
}: DonationFormProps) {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [step, setStep] = useState<"form" | "confirm" | "processing" | "success" | "error">("form");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [activeDonationId, setActiveDonationId] = useState<string | null>(null);
  const [currentRaised, setCurrentRaised] = useState<number>(initialCurrentAmount);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
  };

  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount < 10) {
      setErrorMessage("Minimum donation amount is ₹10.");
      setStep("error");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createDonationAction({
        campaignId,
        amount: effectiveAmount,
        currency: "INR",
        isAnonymous,
        message,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.error || "Could not initiate donation.");
        setStep("error");
      } else {
        setActiveDonationId(res.data.donationId);
        setStep("confirm");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeDonationId) return;

    setLoading(true);
    setStep("processing");

    try {
      const res = await processPaymentAction({
        donationId: activeDonationId,
        gateway: PaymentGateway.MOCK,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.error || "Payment processing failed.");
        setStep("error");
      } else {
        if (res.data.campaignCurrentAmount !== undefined) {
          setCurrentRaised(res.data.campaignCurrentAmount);
        } else {
          setCurrentRaised((prev) => prev + effectiveAmount);
        }
        setStep("success");
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("Payment verification failed. Please try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 shadow-sm">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-600" />
        <h3 className="font-semibold text-lg">Donations Unavailable</h3>
        <p className="mt-1 text-sm text-amber-700">
          This campaign is currently inactive or has ended.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="h-5 w-5 fill-emerald-600 text-emerald-600" />
            Make a Donation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Support {campaignTitle}
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Tax Deductible
        </div>
      </div>

      {/* Progress Preview */}
      <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-emerald-700">Raised: {formatCurrency(currentRaised)}</span>
          <span className="text-slate-500">Goal: {formatCurrency(goalAmount)}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round((currentRaised / (goalAmount || 1)) * 100))}%`,
            }}
          />
        </div>
      </div>

      {/* Step 1: Form Selection */}
      {step === "form" && (
        <form onSubmit={handleInitiateDonation} className="space-y-5">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Donation Amount (INR)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`rounded-xl py-2.5 px-3 text-sm font-semibold transition-all border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    {formatCurrency(amt)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label htmlFor="custom-amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Or Enter Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">
                ₹
              </span>
              <input
                id="custom-amount"
                type="number"
                min="10"
                max="10000000"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Donor Message */}
          <div>
            <label htmlFor="donor-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Message of Encouragement (Optional)
            </label>
            <textarea
              id="donor-message"
              rows={2}
              placeholder="Write a message to support this cause..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is-anonymous" className="text-xs font-medium text-slate-700 cursor-pointer">
              Make my donation anonymous on public activity
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || effectiveAmount < 10}
            className="w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing Donation...
              </>
            ) : (
              <>
                Donate {formatCurrency(effectiveAmount)} Now
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: Payment Confirmation */}
      {step === "confirm" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Confirm Payment Details
            </h3>
            <div className="space-y-1.5 text-xs text-emerald-800">
              <div className="flex justify-between">
                <span className="text-emerald-700">Donation Amount:</span>
                <span className="font-bold text-sm">{formatCurrency(effectiveAmount)}</span>
              </div>
              {organizationName && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Recipient:</span>
                  <span className="font-medium">{organizationName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-emerald-700">Donor:</span>
                <span className="font-medium">{isAnonymous ? "Anonymous" : donorName || "Registered Donor"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700">Gateway mode:</span>
                <span className="font-medium">Secure Mock Gateway (Test Mode)</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            256-bit encrypted secure transaction process
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("form")}
              disabled={loading}
              className="w-1/3 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-2/3 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Payment"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === "processing" && (
        <div className="py-10 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Verifying Payment...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Communicating securely with backend payment service.
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Thank You for Your Support!</h3>
            <p className="text-xs text-slate-600 mt-1">
              Your donation of <span className="font-bold text-emerald-700">{formatCurrency(effectiveAmount)}</span> has been successfully processed.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-left text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono text-slate-900">{activeDonationId?.slice(0, 13)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-emerald-600">COMPLETED</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setActiveDonationId(null);
                setCustomAmount("");
                setMessage("");
              }}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Make Another Donation
            </button>
            <button
              type="button"
              onClick={() => router.push("/donations")}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              View My Giving History
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {step === "error" && (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Donation Error</h3>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
