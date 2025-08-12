
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

// This function is self-contained. It initializes the admin SDK internally
// to ensure it has the correct credentials for each invocation.
exports.createCustomToken = onCall(async (request) => {
  const address = request.data.address;
  if (!address || typeof address !== "string" || address.length === 0) {
    logger.warn("Request to createCustomToken missing or has an invalid 'address' parameter.");
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a non-empty 'address' argument."
    );
  }

  try {
    // Initialize admin SDK if it hasn't been already
    if (!admin.apps.length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        logger.error("CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is not set in the function's environment variables.");
        throw new HttpsError('internal', 'The server is not configured correctly to handle authentication.');
      }
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    // The wallet address becomes the user's unique ID in Firebase
    const uid = address;
    const customToken = await admin.auth().createCustomToken(uid);
    logger.info(`Successfully created custom token for address: ${uid}`);
    return { token: customToken };

  } catch (error: any) {
    logger.error(`Error creating custom token for ${address}:`, error);
    // If the error is already an HttpsError, rethrow it. Otherwise, wrap it.
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      error.message || "An unexpected error occurred while creating the custom token."
    );
  }
});
