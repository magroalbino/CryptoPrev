"use server";

import { z } from "zod";
import { analyzeDefiProtocols } from "@/ai/flows/defi-oracle";
import type { AnalyzeDefiProtocolsOutput } from "@/ai/flows/defi-oracle";

const formSchema = z.object({
  stablecoin: z.string().min(1),
  riskTolerance: z.enum(["low", "medium", "high"]),
  investmentAmount: z.coerce.number().min(1),
});

export type OracleState = {
  data: AnalyzeDefiProtocolsOutput | null;
  error: string | null;
};

export async function getOracleSuggestion(
  prevState: OracleState,
  formData: FormData
): Promise<OracleState> {
  const validatedFields = formSchema.safeParse({
    stablecoin: formData.get("stablecoin"),
    riskTolerance: formData.get("riskTolerance"),
    investmentAmount: formData.get("investmentAmount"),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: "Invalid form data. Please check your inputs.",
    };
  }

  try {
    const result = await analyzeDefiProtocols(validatedFields.data);
    return { data: result, error: null };
  } catch (e: any) {
    console.error("Oracle AI Error:", e.message);
    return {
      data: null,
      error: "AI communication failed. Ensure API key is configured correctly in production.",
    };
  }
}
