
// src/lib/firebase-server.ts
import admin from 'firebase-admin';
import { initializeApp, getApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminInstance: admin.app.App;
let firestoreInstance: admin.firestore.Firestore;
let isFirebaseEnabled = false;

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminInstance = getApp();
    firestoreInstance = getFirestore(adminInstance);
    isFirebaseEnabled = true;
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
      adminInstance = initializeApp({
        credential: cert(serviceAccount),
      });
      firestoreInstance = getFirestore(adminInstance);
      isFirebaseEnabled = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (e) {
      console.error('Firebase Admin SDK initialization error', e);
      isFirebaseEnabled = false;
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin features will be disabled.');
    isFirebaseEnabled = false;
  }
}

// Initialize on first import.
initializeFirebaseAdmin();

export const getFirebaseAdmin = () => {
    if (!adminInstance) {
        initializeFirebaseAdmin();
    }
    return { admin, db: firestoreInstance, isFirebaseEnabled };
};

export const formatTimestamp = (timestamp: admin.firestore.Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
}


export { firestoreInstance as db, admin, isFirebaseEnabled };
