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

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  // Keep as string — html number input returns string, convert in onSubmit
  goalAmount: z
    .string()
    .min(1, "Goal amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1000, "Minimum goal is ₹1,000"),
  coverImageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  story: z.string().min(50, "Story must be at least 50 characters"),
  location: z.string().min(2, "Enter a location"),
  endDate: z.string().min(1, "End date is required"),
  beneficiaryName: z.string().min(2, "Beneficiary name is required"),
  beneficiaryDescription: z.string().min(10, "Describe the beneficiary"),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  "Education", "Healthcare", "Environment", "Community",
  "Sports", "Animals", "Disaster Relief", "Other",
];

export default function CreateCampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, goalAmount: Number(data.goalAmount) }),
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to create campaign");
      }

      const json = await res.json() as { id: string };
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
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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

          {/* Cover Image */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="coverImageUrl">Cover Image URL <span className="text-slate-400">(optional)</span></Label>
            <Input id="coverImageUrl" type="url" placeholder="https://example.com/image.jpg" {...register("coverImageUrl")} />
            {errors.coverImageUrl && <p className="text-xs text-destructive">{errors.coverImageUrl.message}</p>}
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="description">Short Description</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief overview of your campaign…"
              {...register("description")}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </div>
      </section>

      {/* Section: Story */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Campaign Story</h2>
        <div className="space-y-1.5">
          <Label htmlFor="story">Full Story</Label>
          <textarea
            id="story"
            rows={8}
            placeholder="Tell donors the full story — why this campaign matters, who it helps, and what the funds will be used for…"
            {...register("story")}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
          />
          {errors.story && <p className="text-xs text-destructive">{errors.story.message}</p>}
        </div>
      </section>

      {/* Section: Beneficiary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Beneficiary Details</h2>
        <div className="grid gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
            <Input id="beneficiaryName" placeholder="Organisation or person receiving funds" {...register("beneficiaryName")} />
            {errors.beneficiaryName && <p className="text-xs text-destructive">{errors.beneficiaryName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="beneficiaryDescription">Beneficiary Description</Label>
            <textarea
              id="beneficiaryDescription"
              rows={3}
              placeholder="Who are the funds going to and how will they be used?"
              {...register("beneficiaryDescription")}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
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
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit for Review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
