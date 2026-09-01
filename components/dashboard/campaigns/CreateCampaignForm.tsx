"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CampaignImagePicker } from "./CampaignImagePicker";
import { AiCampaignAssistant } from "./AiCampaignAssistant";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  goalAmount: z
    .string()
    .min(1, "Goal amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1000, "Minimum goal is ₹1,000"),
  coverImageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  story: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  endDate: z.string().min(1, "End date is required"),
  beneficiaryName: z.string().optional().or(z.literal("")),
  beneficiaryDescription: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  { label: "Education", value: "EDUCATION" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Environment", value: "ENVIRONMENT" },
  { label: "Animal Welfare", value: "ANIMAL_WELFARE" },
  { label: "Disaster Relief", value: "DISASTER_RELIEF" },
  { label: "Food & Nutrition", value: "FOOD" },
  { label: "Sports", value: "SPORTS" },
  { label: "Community Development", value: "COMMUNITY" },
  { label: "Child Welfare", value: "CHILD_WELFARE" },
  { label: "Elderly Support", value: "ELDERLY_SUPPORT" },
  { label: "Other", value: "OTHER" },
];

export default function CreateCampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const coverImageUrl = watch("coverImageUrl");

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError("");

      const shortDescription =
        data.description.length > 150
          ? data.description.slice(0, 147) + "..."
          : data.description;

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          shortDescription,
          goalAmount: Number(data.goalAmount),
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to create campaign");
      }

      const json = (await res.json()) as { id: string };
      router.push(`/campaigns/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section: Basic Info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Basic Information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="title">Campaign Title</Label>
            <Input id="title" placeholder="e.g. Summer Charity Golf Cup 2026" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              {...register("category")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          {/* Goal Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="goalAmount">Goal Amount (₹)</Label>
            <Input id="goalAmount" type="number" min={1000} placeholder="100000" {...register("goalAmount")} />
            {errors.goalAmount && <p className="text-xs text-destructive">{errors.goalAmount.message}</p>}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g. Mumbai, Maharashtra" {...register("location")} />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
            {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
          </div>

          {/* Cover Image Picker */}
          <div className="sm:col-span-2">
            <CampaignImagePicker
              value={coverImageUrl}
              onChange={(url) => setValue("coverImageUrl", url, { shouldValidate: true })}
            />
            {errors.coverImageUrl && <p className="text-xs text-destructive mt-1">{errors.coverImageUrl.message}</p>}
          </div>

          {/* Description with AI Assistant */}
          <div className="sm:col-span-2 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label htmlFor="description">Campaign Summary / Short Description</Label>
              <AiCampaignAssistant
                title={watch("title")}
                category={watch("category")}
                description={watch("description") || watch("title")}
                onApplyDescription={(text) => setValue("description", text, { shouldValidate: true })}
                onApplyStory={(text) => setValue("story", text, { shouldValidate: true })}
              />
            </div>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief overview of your campaign cause and objective…"
              {...register("description")}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </div>
      </section>

      {/* Section: Story */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Campaign Story (Optional)</h2>
        <div className="space-y-1.5">
          <Label htmlFor="story">Full Story</Label>
          <textarea
            id="story"
            rows={6}
            placeholder="Tell donors the full story — why this campaign matters, who it helps, and what the funds will be used for…"
            {...register("story")}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
          />
          {errors.story && <p className="text-xs text-destructive">{errors.story.message}</p>}
        </div>
      </section>

      {/* Section: Beneficiary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Beneficiary Details (Optional)</h2>
        <div className="grid gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
            <Input id="beneficiaryName" placeholder="Organisation or person receiving funds" {...register("beneficiaryName")} />
            {errors.beneficiaryName && <p className="text-xs text-destructive">{errors.beneficiaryName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="beneficiaryDescription">Beneficiary Story / Description</Label>
            <textarea
              id="beneficiaryDescription"
              rows={3}
              placeholder="Who are the funds going to and how will they be used?"
              {...register("beneficiaryDescription")}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
            {errors.beneficiaryDescription && <p className="text-xs text-destructive">{errors.beneficiaryDescription.message}</p>}
          </div>
        </div>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Campaigns are submitted as <strong>Draft</strong> and require admin approval before going live.
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? "Submitting…" : "Submit for Review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
