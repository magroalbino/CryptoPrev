
// src/lib/firebase-server.ts
import admin from 'firebase-admin';
import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let isFirebaseEnabled = false;

// A robust way to initialize Firebase Admin SDK in Next.js server environments
if (serviceAccountKey) {
  if (!getApps().length) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
      initializeApp({
        credential: cert(serviceAccount),
      });
      isFirebaseEnabled = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (e) {
      console.error('Firebase Admin SDK initialization error', e);
    }
  } else {
    isFirebaseEnabled = true; // Already initialized
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin features will be disabled.');
}

const db = isFirebaseEnabled ? getFirestore() : ({} as admin.firestore.Firestore);

export const formatTimestamp = (timestamp: admin.firestore.Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
}


export { db, admin, isFirebaseEnabled };
