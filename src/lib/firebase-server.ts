
// src/lib/firebase-server.ts
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

interface FirebaseAdmin {
  app: App | null;
  db: Firestore | null;
  auth: Auth | null;
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
  if (adminInstance) {
    return adminInstance;
  }

  const serviceAccount = parseServiceAccount();
  const isFirebaseEnabled = !!serviceAccount;

  if (!isFirebaseEnabled) {
     adminInstance = {
        app: null,
        db: null,
        auth: null,
        isFirebaseEnabled: false
     };
     return adminInstance;
  }
  
  try {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount!),
        });

    const db = getFirestore(app);
    const auth = getAdminAuth(app);

    adminInstance = { app, db, auth, isFirebaseEnabled: true };
    return adminInstance;

  } catch (error: unknown) {
    console.error('Firebase Admin SDK initialization error:', error);
    adminInstance = {
        app: null,
        db: null,
        auth: null,
        isFirebaseEnabled: false
    };
    return adminInstance;
  }
}
