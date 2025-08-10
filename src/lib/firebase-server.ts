// src/lib/firebase-server.ts
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

interface FirebaseAdmin {
  app: App;
  db: Firestore;
  auth: Auth;
  isFirebaseEnabled: boolean;
}

// Function to safely parse the service account key
function parseServiceAccount(): object | null {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error("Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    return null;
  }
  try {
    // The key is Base64 encoded, so we need to decode it first
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    return JSON.parse(decodedKey);
  } catch (e) {
    console.error("Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string and correctly Base64 encoded.", e);
    return null;
  }
}

// Singleton instance to avoid re-initialization
let adminInstance: FirebaseAdmin | null = null;

export function getFirebaseAdmin(): FirebaseAdmin {
  // Return the cached instance if it exists
  if (adminInstance) {
    return adminInstance;
  }

  const serviceAccount = parseServiceAccount();

  // Check if Firebase should be enabled
  const isFirebaseEnabled = !!serviceAccount;

  if (!isFirebaseEnabled) {
    // Provide a more specific error if config is missing/invalid
    throw new Error('Firebase Admin SDK is not configured. Check server environment variables.');
  }
  
  try {
    // Initialize the app if it hasn't been already
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
        });

    const db = getFirestore(app);
    const auth = getAdminAuth(app);

    // Cache the instance
    adminInstance = { app, db, auth, isFirebaseEnabled };
    return adminInstance;

  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // Throw a specific error that can be caught by the caller (API route)
    throw new Error('Firebase Admin SDK failed to initialize.');
  }
}
