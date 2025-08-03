
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// USDC Contract Address on Solana Mainnet
const USDC_MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

interface AuthContextType {
  user: User | null;
  web3UserAddress: string | null;
  usdcBalance: number | null;
  loading: boolean;
  signInWithWeb3: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  web3UserAddress: null,
  usdcBalance: null,
  loading: true,
  signInWithWeb3: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [web3UserAddress, setWeb3UserAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled || !app) {
      setLoading(false);
      return;
    }
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const fetchUsdcBalance = async (address: string) => {
    // Simulate fetching a balance to avoid RPC issues in a prototype environment
    // Use the wallet address to generate a deterministic, pseudo-random balance
    try {
        const seed = parseInt(address.substring(2, 10), 16);
        const pseudoRandomBalance = (seed % 10000) * 1.25; // Generate a balance up to 12,500
        setUsdcBalance(pseudoRandomBalance);
    } catch(e) {
        console.error("Failed to generate mock balance", e);
        setUsdcBalance(0); // Default to 0 on error
    }
  }

  const signInWithWeb3 = async () => {
    if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
        alert('Phantom wallet is not installed. Please install it to use this feature.');
        console.error("Phantom wallet not found");
        return;
    }

    try {
        setLoading(true);
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        
        if (address) {
            setWeb3UserAddress(address);
            await fetchUsdcBalance(address);
            // Here you would typically call a backend endpoint to get a custom Firebase token
            // For now, we are just simulating the login by setting the address.
        }
    } catch (error) {
        console.error("Failed to connect to Phantom wallet:", error);
        alert("Failed to connect to Phantom. Please try again.");
    } finally {
        setLoading(false);
    }
  };


  const signOut = async () => {
    if (isFirebaseEnabled && app) {
      const auth = getAuth(app);
      await firebaseSignOut(auth);
    }
    if (window.solana && window.solana.isConnected) {
        await window.solana.disconnect();
    }
    setWeb3UserAddress(null); // Also clear the web3 address
    setUsdcBalance(null); // Clear the balance
    console.log("User signed out.");
  };

  return (
    <AuthContext.Provider value={{ user, web3UserAddress, usdcBalance, loading, signInWithWeb3, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}
