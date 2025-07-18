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
  concept: z.string().describe('The DeFi concept to be explained.'),
});
export type ExplainDeFiConceptInput = z.infer<typeof ExplainDeFiConceptInputSchema>;

const ExplainDeFiConceptOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A clear and concise explanation of the DeFi concept, suitable for a beginner.'),
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
  prompt: `You are a DeFi (Decentralized Finance) expert with a talent for explaining complex topics in a simple, easy-to-understand way.

A user wants to understand the following concept: {{{concept}}}

Provide a clear and concise explanation that a beginner could easily grasp. Avoid jargon where possible, or explain it if you must use it. Use an analogy if it helps to clarify the concept. The response should be in plain text.`,
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
