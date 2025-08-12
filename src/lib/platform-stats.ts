// src/lib/platform-stats.ts
'use server';

import { getFirebaseAdmin } from './firebase-server';

interface PlatformStats {
  tvl: number;
  totalBtcReserves: number;
  totalBnbReserves: number;
  activeUsers: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const { db, auth, isFirebaseEnabled } = getFirebaseAdmin();

  if (!isFirebaseEnabled) {
    // Return mock data if Firebase is not enabled
    return {
      tvl: 0,
      totalBtcReserves: 0,
      totalBnbReserves: 0,
      activeUsers: 0,
    };
  }

  try {
    // 1. Get total active users
    const listUsersResult = await auth.listUsers();
    const activeUsers = listUsersResult.users.length;

    // 2. Get TVL and reserves from Firestore
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();

    let tvl = 0;
    let totalBtcReserves = 0;
    let totalBnbReserves = 0;

    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        const data = doc.data();
        tvl += data.currentBalance || 0;
        totalBtcReserves += data.bitcoinReserve || 0;
        totalBnbReserves += data.bnbReserve || 0;
      });
    }

    return {
      tvl,
      totalBtcReserves,
      totalBnbReserves,
      activeUsers,
    };

  } catch (error) {
    console.error("Error fetching platform stats:", error);
    // Return safe defaults in case of an error
    return {
      tvl: 0,
      totalBtcReserves: 0,
      totalBnbReserves: 0,
      activeUsers: 0,
    };
  }
}
