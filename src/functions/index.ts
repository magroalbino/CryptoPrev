
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/onCall";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from 'firebase-admin';

// Initialize the app directly in the function's global scope.
// This is a more stable pattern for Cloud Functions.
try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } else {
        logger.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin features will be disabled.");
    }
} catch (error) {
    logger.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error);
}


/**
 * Creates a custom Firebase auth token for the given wallet address.
 * The address is used as the user's UID in Firebase Auth.
 */
exports.createCustomToken = onCall(async (request) => {
  // Check if the Admin SDK was initialized.
  if (!admin.apps.length) {
    logger.error("Firebase Admin SDK is not initialized. This usually means the FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid in the function's environment variables.");
    throw new HttpsError('internal', 'The server is not configured correctly to handle authentication. Please check the server logs.');
  }

  const address = request.data.address;
  if (!address || typeof address !== "string" || address.length === 0) {
    logger.warn("Request to createCustomToken missing or has an invalid 'address' parameter.");
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a non-empty 'address' argument."
    );
  }

  // The wallet address becomes the user's unique ID in Firebase
  const uid = address;

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    logger.info(`Successfully created custom token for address: ${uid}`);
    return { token: customToken };
  } catch (error: any) {
    logger.error(`Error creating custom token for ${uid}:`, error);
    // Throw a specific error that can be caught by the caller
    throw new HttpsError(
      "internal",
      error.message || "An unexpected error occurred while creating the custom token."
    );
  }
});
