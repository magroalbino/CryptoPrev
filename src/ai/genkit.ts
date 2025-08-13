import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    'WARNING: GEMINI_API_KEY is not defined in environment variables. Genkit AI features will fail.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});
