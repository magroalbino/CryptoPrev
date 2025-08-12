
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
  isFirebaseEnabled: true;
}

interface FirebaseAdminDisabled {
  app: null;
  db: null;
  auth: null;
  isFirebaseEnabled: false;
}

// Function to safely parse the service account key
function parseServiceAccount(): object {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("Firebase Admin: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Server-side Firebase features will be disabled.");
  }
  try {
    // The key is often Base64 encoded in CI/CD environments
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    return JSON.parse(decodedKey);
  } catch (e) {
    throw new Error("Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string, correctly Base64 encoded if needed.", { cause: e });
  }
}

// Singleton instance to avoid re-initialization
let adminInstance: FirebaseAdmin | FirebaseAdminDisabled | null = null;

export function getFirebaseAdmin(): FirebaseAdmin | FirebaseAdminDisabled {
  if (adminInstance) {
    return adminInstance;
  }

  try {
    const serviceAccount = parseServiceAccount();
    
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
        });

    const db = getFirestore(app);
    const auth = getAdminAuth(app);

    adminInstance = { app, db, auth, isFirebaseEnabled: true };
    return adminInstance;

  } catch (error: unknown) {
    // Log the detailed error during initialization
    console.error('CRITICAL: Firebase Admin SDK initialization failed.', error);
    
    // Return a disabled instance so the app can know the status
    adminInstance = {
        app: null,
        db: null,
        auth: null,
        isFirebaseEnabled: false
    };
    return adminInstance;
  }
}
