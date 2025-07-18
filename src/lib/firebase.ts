import admin from 'firebase-admin';
import { initializeApp as initializeClientApp, getApps as getClientApps, getApp } from 'firebase/app';
import { getApps as getAdminApps, initializeApp as initializeAdminApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase/auth';

// --- Client-side Firebase config ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- Server-side Firebase Admin config ---
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let db: admin.firestore.Firestore;
let isFirebaseEnabled = false;

// Initialize Firebase Admin SDK for server-side operations
if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
    );
    
    if (!getAdminApps().length) {
      initializeAdminApp({
        credential: cert(serviceAccount),
      });
    }
    
    db = getFirestore();
    isFirebaseEnabled = true;
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Using mock data for server-side operations.");
}

// Initialize Firebase Client SDK for client-side operations (e.g., Auth)
const app = !getClientApps().length ? initializeClientApp(firebaseConfig) : getApp();
const auth = isFirebaseEnabled ? getAuth(app) : null;

// A simple helper function to format Firestore Timestamps
export const formatTimestamp = (timestamp: admin.firestore.Timestamp) => {
    return timestamp.toDate().toISOString().split('T')[0];
}

export { db, admin, app, auth, isFirebaseEnabled };
