
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
import { getFirebaseAdmin } from "@/lib/firebase-server";

// This function relies on a properly configured server environment.
// getFirebaseAdmin() will throw an error during initialization if the service account key is missing or invalid,
// which is the desired behavior to prevent a broken function from being deployed.

/**
 * Creates a custom Firebase auth token for the given wallet address.
 * The address is used as the user's UID in Firebase Auth.
 */
exports.createCustomToken = onCall(async (request) => {
  const { auth, isFirebaseEnabled } = getFirebaseAdmin();

  if (!isFirebaseEnabled || !auth) {
    logger.error("Firebase Admin SDK is not initialized. Cannot create custom token. Check server logs for details.");
    throw new HttpsError('internal', 'The server is not configured correctly to handle authentication.');
  }

  const address = request.data.address;
  if (!address || typeof address !== "string" || address.length === 0) {
    logger.warn("Request to createCustomToken missing address parameter.");
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a non-empty 'address' argument."
    );
  }

  // The wallet address becomes the user's unique ID in Firebase
  const uid = address;

  try {
    const customToken = await auth.createCustomToken(uid);
    logger.info(`Successfully created custom token for address: ${address}`);
    return { token: customToken };
  } catch (error: any) {
    logger.error(`Error creating custom token for ${address}:`, error);
    // Throw a specific error that can be caught by the caller
    throw new HttpsError(
      "internal",
      error.message || "An unexpected error occurred while creating the custom token."
    );
  }
});
