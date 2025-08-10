// src/lib/firebase-server.ts
import admin from 'firebase-admin';
import { getApps as getAdminApps, initializeApp as initializeAdminApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let db: admin.firestore.Firestore;
let isFirebaseEnabled = false;

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
    // @ts-ignore
    db = {}; // Assign a dummy object to satisfy TypeScript
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK is not initialized.");
  // @ts-ignore
  db = {}; // Assign a dummy object to satisfy TypeScript
}

export const formatTimestamp = (timestamp: admin.firestore.Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
}


export { db, admin, isFirebaseEnabled };
