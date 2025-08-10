// src/lib/firebase-server.ts
import admin from 'firebase-admin';
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';

interface FirebaseAdmin {
  app: App;
  db: Firestore;
  auth: Auth;
  isFirebaseEnabled: boolean;
}

let adminInstance: FirebaseAdmin | null = null;

export function getFirebaseAdmin(): FirebaseAdmin {
  if (adminInstance) {
    return adminInstance;
  }

  const isFirebaseEnabled = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!isFirebaseEnabled) {
    // This will be caught by the API route and a proper error will be sent.
    throw new Error('Firebase is not configured on the server.');
  }
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
    );
    
    const app = getApps().length > 0
        ? getApp()
        : initializeApp({
            credential: cert(serviceAccount),
          });

    const db = getFirestore(app);
    const auth = getAdminAuth(app);

    adminInstance = { app, db, auth, isFirebaseEnabled: true };
    return adminInstance;

  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // Throw an error that can be caught by the caller (API route).
    throw new Error('Firebase Admin SDK failed to initialize.');
  }
}

export const formatTimestamp = (timestamp: admin.firestore.Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
}
