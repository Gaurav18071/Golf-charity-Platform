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
  Lock,
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { createDonationAction, processPaymentAction } from "../actions/donation.actions";
import { loadRazorpayScript, type RazorpaySuccessResponse } from "../utils/load-razorpay";
import { PaymentGateway } from "@prisma/client";

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  organizationName?: string;
  goalAmount: number;
  currentAmount: number;
  isActive: boolean;
  status?: string;
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
  status,
  donorName,
  donorEmail,
}: DonationFormProps) {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("500");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [step, setStep] = useState<"form" | "confirm" | "processing" | "success" | "error">("form");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [activeDonationId, setActiveDonationId] = useState<string | null>(null);
  const [gatewayOrderId, setGatewayOrderId] = useState<string | null>(null);
  const [gatewayKeyId, setGatewayKeyId] = useState<string | null>(null);
  const [currentRaised, setCurrentRaised] = useState<number>(initialCurrentAmount);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && PRESET_AMOUNTS.includes(num)) {
      setSelectedAmount(num);
    } else {
      setSelectedAmount(0);
    }
  };

  /**
   * Submits verification to the server and handles success/error redirection.
   */
  const handleServerVerification = async (
    donationId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    setLoading(true);
    setStep("processing");

    try {
      const res = await processPaymentAction({
        donationId,
        gateway: PaymentGateway.RAZORPAY,
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId,
        gatewaySignature: signature,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.error || "Payment verification failed. Please contact support.");
        setStep("error");
      } else {
        if (res.data.campaignCurrentAmount !== undefined) {
          setCurrentRaised(res.data.campaignCurrentAmount);
        } else {
          setCurrentRaised((prev) => prev + effectiveAmount);
        }
        setStep("success");
        router.refresh();
        // Redirect to verified receipt page after brief pause
        setTimeout(() => {
          router.push(`/donations/${donationId}/success`);
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Payment verification failed. Please try again."
      );
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates the donation by creating the order server-side and launching Razorpay.
   */
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
      // 1. Create donation & payment order on server
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
        setLoading(false);
        return;
      }

      const { donationId, gatewayOrderId: orderId, keyId } = res.data;
      setActiveDonationId(donationId);
      setGatewayOrderId(orderId);
      setGatewayKeyId(keyId || null);

      // 2. Attempt to load Razorpay Standard Checkout SDK
      const isScriptLoaded = await loadRazorpayScript();

      if (isScriptLoaded && window.Razorpay && keyId && !keyId.includes("placeholder")) {
        // Open official Razorpay modal
        const rzp = new window.Razorpay({
          key: keyId,
          amount: Math.round(effectiveAmount * 100),
          currency: "INR",
          name: "Golf Charity Platform",
          description: `Donation for ${campaignTitle.slice(0, 40)}`,
          order_id: orderId,
          handler: (response: RazorpaySuccessResponse) => {
            void handleServerVerification(
              donationId,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: isAnonymous ? "Anonymous Donor" : donorName || "",
            email: donorEmail || "",
          },
          theme: {
            color: "#059669", // emerald-600
          },
          modal: {
            ondismiss: () => {
              setStep("confirm");
              setLoading(false);
            },
          },
        });

        rzp.open();
      } else {
        // Test mode or fallback confirmation screen
        setStep("confirm");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirms payment verification in test mode or fallback.
   */
  const handleConfirmTestPayment = async () => {
    if (!activeDonationId || !gatewayOrderId) return;

    const mockPaymentId = `pay_test_${activeDonationId.replace(/-/g, "").slice(0, 10)}_${Date.now()}`;
    const mockSignature = `sig_test_${Date.now()}_valid_hash_token_12345`;

    await handleServerVerification(
      activeDonationId,
      gatewayOrderId,
      mockPaymentId,
      mockSignature
    );
  };

  if (!isActive) {
    if (status === "DRAFT") {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-center text-amber-900 shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 border border-amber-300/50 text-amber-700 shadow-xs">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Pending Admin Approval</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              This campaign has been submitted and is currently awaiting review and approval by an administrator.
            </p>
            <p className="mt-1 text-xs text-amber-700 font-medium">
              Donations will be enabled automatically once approved.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-3.5 py-1 text-xs font-bold text-amber-900 border border-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Status: Draft / In Review
            </span>
          </div>
        </div>
      );
    }

    if (status === "COMPLETED") {
      return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-6 text-center text-blue-900 shadow-xs space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Campaign Completed</h3>
          <p className="mt-1 text-xs text-slate-600">
            This campaign has reached its duration and is no longer accepting donations. Thank you to all donors!
          </p>
        </div>
      );
    }

    if (status === "CANCELLED") {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-center text-red-900 shadow-xs space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Campaign Inactive</h3>
          <p className="mt-1 text-xs text-slate-600">
            This campaign is not currently active.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-700 shadow-xs">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-500" />
        <h3 className="font-semibold text-base text-slate-900">Donations Unavailable</h3>
        <p className="mt-1 text-xs text-slate-500">
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
          <span className="text-emerald-700 font-bold">Raised: {formatCurrency(currentRaised)}</span>
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
                const isSelected = effectiveAmount === amt;
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

          {/* Payment Guarantee */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              Secure 256-bit Razorpay Gateway
            </span>
            <span className="font-semibold text-slate-700">UPI • Cards • NetBanking</span>
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
                Securing Gateway Order...
              </>
            ) : (
              <>
                Donate {formatCurrency(effectiveAmount)} Now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: Payment Confirmation / Test Checkout */}
      {step === "confirm" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Confirm Payment Details
            </h3>
            <div className="space-y-2 text-xs text-emerald-800">
              <div className="flex justify-between">
                <span className="text-emerald-700">Donation Amount:</span>
                <span className="font-bold text-sm text-emerald-900">{formatCurrency(effectiveAmount)}</span>
              </div>
              {organizationName && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Beneficiary Org:</span>
                  <span className="font-medium">{organizationName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-emerald-700">Donor:</span>
                <span className="font-medium">{isAnonymous ? "Anonymous" : donorName || "Registered Donor"}</span>
              </div>
              {gatewayOrderId && (
                <div className="flex justify-between">
                  <span className="text-emerald-700">Gateway Order:</span>
                  <span className="font-mono text-slate-700">{gatewayOrderId.slice(0, 18)}...</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-emerald-700">Payment Gateway:</span>
                <span className="font-semibold text-emerald-900">Razorpay Secure</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            256-bit encrypted server-verified transaction
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
              onClick={handleConfirmTestPayment}
              disabled={loading}
              className="w-2/3 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Complete Payment"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing & Server Verification */}
      {step === "processing" && (
        <div className="py-10 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Verifying Payment Authenticity...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Validating cryptographic signatures with payment gateway.
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Success Notification & Redirect */}
      {step === "success" && (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Payment Verified Successfully!</h3>
            <p className="text-xs text-slate-600 mt-1">
              Your donation of <span className="font-bold text-emerald-700">{formatCurrency(effectiveAmount)}</span> has been securely recorded.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            Redirecting to official receipt...
          </div>
        </div>
      )}

      {/* Error State with Retry option */}
      {step === "error" && (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Payment Unsuccessful</h3>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
