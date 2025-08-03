'use server';

/**
 * @fileOverview An AI-powered personal financial planner.
 *
 * - getFinancialPlan - A function that generates a personalized financial plan.
 * - FinancialPlannerInput - The input type for the getFinancialPlan function.
 * - FinancialPlannerOutput - The return type for the getFinancialPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FinancialPlannerInputSchema = z.object({
  currentAge: z.number().describe('The current age of the user.'),
  retirementAge: z.number().describe('The desired retirement age of the user.'),
  initialInvestment: z.number().describe('The initial investment amount in dollars.'),
  monthlyContribution: z.number().describe('The current monthly contribution in dollars.'),
  desiredMonthlyIncome: z.number().describe('The desired monthly retirement income in dollars.'),
  riskTolerance: z.enum(['low', 'medium', 'high']).describe('The user\'s risk tolerance.'),
  language: z.enum(['en', 'pt']).optional().default('en').describe('The language for the response.'),
});

export type FinancialPlannerInput = z.infer<typeof FinancialPlannerInputSchema>;

const FinancialPlannerOutputSchema = z.object({
  isFeasible: z.boolean().describe('Whether the goal is feasible with the current plan.'),
  diagnosis: z
    .string()
    .describe('A brief, encouraging diagnosis of the user\'s current financial situation regarding their retirement goals.'),
  actionableAdvice: z
    .string()
    .describe(
      'Clear, actionable, and conversational advice for the user. If the plan is not feasible, suggest a new monthly contribution in a conversational tone. If it is feasible, suggest other ways to optimize in a friendly way.'
    ),
  newMonthlyContribution: z
    .number()
    .optional()
    .describe(
      'The suggested new monthly contribution to reach the goal. Only present if the plan is not feasible.'
    ),
  projectedTotalValue: z.number().describe('The projected total value of the investment at retirement age.'),
  projectedMonthlyIncome: z.number().describe('The projected monthly income at retirement.'),
});

export type FinancialPlannerOutput = z.infer<typeof FinancialPlannerOutputSchema>;

export async function getFinancialPlan(input: FinancialPlannerInput): Promise<FinancialPlannerOutput> {
  return personalFinancialPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalFinancialPlannerPrompt',
  input: { schema: FinancialPlannerInputSchema },
  output: { schema: FinancialPlannerOutputSchema },
  prompt: `You are an expert financial planner specializing in retirement for a platform called CryptoPrev. Your goal is to provide clear, actionable, and encouraging advice to help users achieve their retirement goals using DeFi yields. Your tone should be conversational and easy to understand.

**IMPORTANT: Generate your entire response (diagnosis and actionable advice) in the following language: {{{language}}}.**

You will receive the user's current situation and their goals. Assume a safe average APY based on their risk tolerance: low=5%, medium=7%, high=9%. Assume a safe withdrawal rate of 4% at retirement to calculate monthly income.

User Data:
- Current Age: {{{currentAge}}}
- Desired Retirement Age: {{{retirementAge}}}
- Initial Investment: \${{{initialInvestment}}}
- Monthly Contribution: \${{{monthlyContribution}}}
- Desired Monthly Retirement Income: \${{{desiredMonthlyIncome}}}
- Risk Tolerance: {{{riskTolerance}}}

Tasks:
1.  **Calculate Projections**: Calculate the projected total value at retirement and the resulting monthly income based on the user's current contributions and risk tolerance.
2.  **Diagnose Feasibility**: Compare the projected monthly income with the desired monthly income to determine if the goal is feasible.
3.  **Generate Diagnosis**: Write a brief, encouraging diagnosis of the user's current plan in the requested language.
4.  **Provide Conversational, Actionable Advice**:
    -   **If the plan is NOT feasible**: Calculate the new monthly contribution required. Phrase the advice conversationally. For example: "To reach your goal of $X per month, you should increase your monthly contribution to about $Y. This adjustment will put you on the right track!" (Translated to the requested language).
    -   **If the plan IS feasible**: Congratulate the user! Phrase the advice conversationally. For example: "Great news! Your plan is on track. To build an extra safety net, you could consider increasing your monthly contribution by a small amount, like $20-$50." (Translated to the requested language).
5.  **Fill Output Schema**: Populate all fields in the output schema accurately. The 'newMonthlyContribution' field should only be set if the plan is not feasible.
`,
});

const personalFinancialPlannerFlow = ai.defineFlow(
  {
    name: 'personalFinancialPlannerFlow',
    inputSchema: FinancialPlannerInputSchema,
    outputSchema: FinancialPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
