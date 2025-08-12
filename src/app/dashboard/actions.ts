// src/app/dashboard/actions.ts
'use server';

import { z } from 'zod';
import { getFirebaseAdmin } from '@/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getDynamicApy } from '@/lib/apy';

const depositSchema = z.object({
  amount: z.number().min(1, 'Deposit amount must be greater than 0.'),
  userId: z.string().min(1, 'User ID is required.'),
});

const MOCK_BTC_PRICE = 65000;
const MOCK_BNB_PRICE = 580; // Mock BNB price

export async function handleDeposit(userId: string, amount: number) {
  const { db, isFirebaseEnabled } = getFirebaseAdmin();
  const validated = depositSchema.safeParse({ amount, userId });

  if (!validated.success || !isFirebaseEnabled) {
    console.error('Validation failed or Firebase is not enabled.');
    return { success: false, error: 'Invalid data or server misconfiguration.' };
  }

  const { amount: depositAmount } = validated.data;
  // New allocation: 25% BNB, 15% BTC, 60% Stablecoin
  const bnbAllocation = depositAmount * 0.25; 
  const btcAllocation = depositAmount * 0.15;
  const stablecoinAllocation = depositAmount * 0.60;

  const bnbAmount = bnbAllocation / MOCK_BNB_PRICE;
  const btcAmount = btcAllocation / MOCK_BTC_PRICE;

  try {
    const userRef = db.collection('users').doc(userId);

    // Use a transaction to ensure atomic updates
    await db.runTransaction(async (transaction) => {
      transaction.set(
        userRef,
        {
          currentBalance: FieldValue.increment(stablecoinAllocation),
          bitcoinReserve: FieldValue.increment(btcAmount),
          bnbReserve: FieldValue.increment(bnbAmount),
        },
        { merge: true }
      );
    });

    // Revalidate paths to show updated data
    revalidatePath('/');
    revalidatePath('/proof-of-funds');

    return { success: true };
  } catch (error) {
    console.error('Error handling deposit:', error);
    return { success: false, error: 'Failed to process deposit.' };
  }
}

export async function handleUpdateLockupPeriod(userId: string, newPeriod: number) {
     const { db, isFirebaseEnabled } = getFirebaseAdmin();
     if (!isFirebaseEnabled) {
        return { success: false, error: 'Server misconfiguration.' };
    }
     try {
        const userRef = db.collection('users').doc(userId);
        const newApy = getDynamicApy(newPeriod);

        await userRef.update({
            lockupPeriod: newPeriod,
            activeProtocol: 'CryptoPrev Strategy',
            activeProtocolApy: newApy,
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating lockup period:', error);
        return { success: false, error: 'Failed to update plan.' };
    }
}

export async function getUserData(userId: string) {
    const { db, isFirebaseEnabled } = getFirebaseAdmin();
    if (!isFirebaseEnabled) return null;
    
    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            // Create a default user document if it doesn't exist
            const defaultLockup = 12;
            const defaultApy = getDynamicApy(defaultLockup);

            const newUser = {
                currentBalance: 0,
                bitcoinReserve: 0,
                bnbReserve: 0,
                lockupPeriod: defaultLockup,
                activeProtocol: 'CryptoPrev Strategy',
                activeProtocolApy: defaultApy,
                transactions: [],
                achievements: [],
            };
            await userRef.set(newUser);
            return newUser;
        }
        
        const data = doc.data();
        if (!data) return null;
        
        // Ensure default values for older documents
        const lockupPeriod = data.lockupPeriod || 12;
        const apy = data.activeProtocolApy || getDynamicApy(lockupPeriod);

        const accumulatedRewards = (data.currentBalance || 0) * apy;
        const monthlyYield = accumulatedRewards / 12;


        return {
            ...data,
            currentBalance: data.currentBalance || 0,
            bitcoinReserve: data.bitcoinReserve || 0,
            bnbReserve: data.bnbReserve || 0,
            accumulatedRewards: accumulatedRewards,
            monthlyYield: monthlyYield,
            activeProtocol: data.activeProtocol || 'CryptoPrev Strategy',
            activeProtocolApy: apy,
            lockupPeriod: lockupPeriod,
            transactions: data.transactions || [],
            achievements: data.achievements || [],
        };

    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}
