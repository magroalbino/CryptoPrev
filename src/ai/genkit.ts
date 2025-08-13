import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Note: The 'ai' object is exported directly. The Google AI plugin
// is configured lazily below to ensure that environment variables
// are available in the Vercel serverless environment.

let isPluginConfigured = false;

function ensurePluginConfigured() {
  if (!isPluginConfigured) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        'CRITICAL: GEMINI_API_KEY is not defined. Genkit AI features will fail.'
      );
      // Even if the key is not present, we mark as configured to avoid re-checking.
      // The features will fail gracefully with an error message.
    }
    
    // Configure the Google AI plugin. This happens only once.
    genkit.config({
      plugins: [
        googleAI(),
      ],
    });
    
    isPluginConfigured = true;
    console.log("Genkit Google AI plugin configured.");
  }
}

// Wrap the genkit object to ensure configuration happens on first use.
const lazyAi = new Proxy(genkit, {
  get(target, prop, receiver) {
    ensurePluginConfigured();
    return Reflect.get(target, prop, receiver);
  },
});

export { lazyAi as ai };
