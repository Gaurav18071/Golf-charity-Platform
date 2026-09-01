import { z } from "zod";

export const CampaignEnhancementInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(4000),
  targetAudience: z.string().max(300).optional(),
  impactGoal: z.string().max(500).optional(),
});

export type CampaignEnhancementInput = z.infer<typeof CampaignEnhancementInputSchema>;

export const CampaignEnhancementOutputSchema = z.object({
  improvedDescription: z.string().min(20),
  shortSummary: z.string().min(10).max(300),
  suggestedImpactPoints: z.array(z.string()).min(1).max(6),
  suggestedFaqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).max(4),
});

export type CampaignEnhancementOutput = z.infer<typeof CampaignEnhancementOutputSchema>;

export interface AiServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
}
