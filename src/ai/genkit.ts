import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// In a serverless environment like Vercel, environment variables are available
// at runtime. This direct configuration is the most reliable approach.

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    'CRITICAL: GEMINI_API_KEY is not defined. Genkit AI features will fail.'
  );
}

// Configure Genkit with the Google AI plugin.
// This single configuration will be used across the application.
genkit({
  plugins: [
    googleAI(), // This plugin requires GEMINI_API_KEY to be set in the environment.
  ],
});


// Export the configured genkit instance as 'ai' for consistent use in other files.
export {genkit as ai};
