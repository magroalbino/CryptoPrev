import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let db: admin.firestore.Firestore;
let isFirebaseEnabled = false;

if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
    );
    
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
    
    db = getFirestore();
    isFirebaseEnabled = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Using mock data.");
}


// A simple helper function to format Firestore Timestamps
export const formatTimestamp = (timestamp: admin.firestore.Timestamp) => {
    return timestamp.toDate().toISOString().split('T')[0];
}

export { db, admin, isFirebaseEnabled };
