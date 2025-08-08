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
import i18n from '@/lib/i18n';

const ExplainDeFiConceptInputSchema = z.object({
  conceptKey: z.string().describe('The translation key for the DeFi concept to be explained (e.g., "whatIsDeFi").'),
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
  // Ensure i18next is initialized before using it on the server
  if (!i18n.isInitialized) {
    await i18n.init();
  }
  // Get the English concept text from the key
  const englishConcept = i18n.t(`faq.topics.${input.conceptKey}`, { lng: 'en' });

  return explainDeFiConceptFlow({ concept: englishConcept });
}

// Internal prompt schema, not exported
const InternalPromptInputSchema = z.object({
    concept: z.string().describe('The DeFi concept or question to be explained.'),
});


const prompt = ai.definePrompt({
  name: 'explainDeFiConceptPrompt',
  input: {schema: InternalPromptInputSchema},
  output: {schema: ExplainDeFiConceptOutputSchema},
  prompt: `You are a helpful assistant for a decentralized finance (DeFi) application called CryptoPrev.
CryptoPrev is an AI-powered platform that helps users plan for retirement by maximizing yield on their stablecoin investments. It offers tools like an AI Oracle to find the best DeFi protocols, and an AI Planner to create personalized retirement strategies.

A user has a question from the FAQ section. Your task is to provide a clear, concise, and easy-to-understand explanation for the following question. Avoid jargon where possible, or explain it if you must use it. Use an analogy if it helps.

User's Question: "{{{concept}}}"`,
});

const explainDeFiConceptFlow = ai.defineFlow(
  {
    name: 'explainDeFiConceptFlow',
    inputSchema: InternalPromptInputSchema,
    outputSchema: ExplainDeFiConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
