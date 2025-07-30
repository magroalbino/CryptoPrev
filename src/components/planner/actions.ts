"use server";

import { z } from "zod";
import { getFinancialPlan } from "@/ai/flows/personal-financial-planner";
import type { FinancialPlannerOutput } from "@/ai/flows/personal-financial-planner";

const formSchema = z.object({
    currentAge: z.coerce.number().min(18),
    retirementAge: z.coerce.number().min(19),
    initialInvestment: z.coerce.number().min(0),
    monthlyContribution: z.coerce.number().min(0),
    desiredMonthlyIncome: z.coerce.number().min(1),
    riskTolerance: z.enum(["low", "medium", "high"]),
  });

export type PlannerState = {
  data: FinancialPlannerOutput | null;
  error: string | null;
};

export async function getPlannerSuggestion(
  prevState: PlannerState,
  formData: FormData
): Promise<PlannerState> {
  const validatedFields = formSchema.safeParse({
    currentAge: formData.get("currentAge"),
    retirementAge: formData.get("retirementAge"),
    initialInvestment: formData.get("initialInvestment"),
    monthlyContribution: formData.get("monthlyContribution"),
    desiredMonthlyIncome: formData.get("desiredMonthlyIncome"),
    riskTolerance: formData.get("riskTolerance"),
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      data: null,
      error: "Invalid form data. Please check your inputs.",
    };
  }

  try {
    const result = await getFinancialPlan(validatedFields.data);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return {
      data: null,
      error: "Failed to get suggestion from AI. Please try again later.",
    };
  }
}
