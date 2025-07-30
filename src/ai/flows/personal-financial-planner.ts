'use server';

/**
 * @fileOverview An AI-powered personal financial planner.
 *
 * - getFinancialPlan - A function that generates a personalized financial plan.
 * - FinancialPlannerInput - The input type for the getFinancialPlan function.
 * - FinancialPlannerOutput - The return type for the getFinancialPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialPlannerInputSchema = z.object({
  currentAge: z.number().describe('The current age of the user.'),
  retirementAge: z.number().describe('The desired retirement age of the user.'),
  initialInvestment: z.number().describe('The initial investment amount in dollars.'),
  monthlyContribution: z.number().describe('The current monthly contribution in dollars.'),
  desiredMonthlyIncome: z.number().describe('The desired monthly retirement income in dollars.'),
  riskTolerance: z.enum(['low', 'medium', 'high']).describe('The user\'s risk tolerance.'),
});

export type FinancialPlannerInput = z.infer<typeof FinancialPlannerInputSchema>;

const FinancialPlannerOutputSchema = z.object({
  isFeasible: z.boolean().describe('Whether the goal is feasible with the current plan.'),
  diagnosis: z
    .string()
    .describe('A brief diagnosis of the user\'s current financial situation regarding their retirement goals.'),
  actionableAdvice: z
    .string()
    .describe(
      'Clear, actionable advice for the user. If the plan is not feasible, suggest a new monthly contribution. If it is feasible, suggest other ways to optimize.'
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
  prompt: `You are an expert financial planner specializing in retirement for a platform called CryptoPrev. Your goal is to provide clear, actionable advice to help users achieve their retirement goals using DeFi yields.

You will receive the user's current situation and their goals. Assume a safe average APY based on their risk tolerance: low=5%, medium=7%, high=9%. Assume a safe withdrawal rate of 4% at retirement to calculate monthly income.

User Data:
- Current Age: {{{currentAge}}}
- Desired Retirement Age: {{{retirementAge}}}
- Initial Investment: ${{{initialInvestment}}}
- Monthly Contribution: ${{{monthlyContribution}}}
- Desired Monthly Retirement Income: ${{{desiredMonthlyIncome}}}
- Risk Tolerance: {{{riskTolerance}}}

Tasks:
1.  **Calculate Projections**: Calculate the projected total value at retirement and the resulting monthly income based on the user's current contributions and risk tolerance.
2.  **Diagnose Feasibility**: Compare the projected monthly income with the desired monthly income to determine if the goal is feasible.
3.  **Generate Diagnosis**: Write a brief, encouraging diagnosis of the user's current plan.
4.  **Provide Actionable Advice**:
    -   **If the plan is NOT feasible**: Calculate the new monthly contribution required to meet their desired income. Provide this as the primary actionable advice. State clearly: "To reach your goal, you should increase your monthly contribution to $X."
    -   **If the plan IS feasible**: Congratulate the user and provide advice on how they could further optimize, such as slightly increasing contributions to build a buffer or considering a different risk profile.
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
