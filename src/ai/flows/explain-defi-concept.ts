'use server';

/**
 * @fileOverview DeFi Concept Explanation AI agent.
 *
 * - explainDeFiConcept - A function that explains a given DeFi concept.
 * - ExplainDeFiConceptInput - The input type for the explainDeFiConcept function.
 * - ExplainDeFiConceptOutput - The return type for the explainDeFiConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDeFiConceptInputSchema = z.object({
  concept: z.string().describe('The DeFi concept or question to be explained.'),
});
export type ExplainDeFiConceptInput = z.infer<typeof ExplainDeFiConceptInputSchema>;

const ExplainDeFiConceptOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A clear and concise explanation of the concept, suitable for a beginner.'),
});
export type ExplainDeFiConceptOutput = z.infer<typeof ExplainDeFiConceptOutputSchema>;

export async function explainDeFiConcept(
  input: ExplainDeFiConceptInput
): Promise<ExplainDeFiConceptOutput> {
  return explainDeFiConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDeFiConceptPrompt',
  input: {schema: ExplainDeFiConceptInputSchema},
  output: {schema: ExplainDeFiConceptOutputSchema},
  prompt: `You are a helpful assistant for a decentralized finance (DeFi) application called CryptoPrev.
CryptoPrev is an AI-powered platform that helps users plan for retirement by maximizing yield on their stablecoin investments. It offers tools like an AI Oracle to find the best DeFi protocols, and an AI Planner to create personalized retirement strategies.

A user has a question from the FAQ section. Your task is to provide a clear, concise, and easy-to-understand explanation for the following question. Avoid jargon where possible, or explain it if you must use it. Use an analogy if it helps.

User's Question: "{{{concept}}}"`,
});

const explainDeFiConceptFlow = ai.defineFlow(
  {
    name: 'explainDeFiConceptFlow',
    inputSchema: ExplainDeFiConceptInputSchema,
    outputSchema: ExplainDeFiConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
