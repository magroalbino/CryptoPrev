
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
    try {
      // Use the official Solana helper to get a reliable RPC endpoint.
      const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      const ownerPublicKey = new PublicKey(address);

      // This is the correct method to get all token accounts for a specific mint (USDC)
      // owned by the user.
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
        mint: USDC_MINT_ADDRESS,
      });

      if (tokenAccounts.value.length > 0) {
        // Get the first token account (usually users have only one for a given mint).
        const accountInfo = tokenAccounts.value[0].account;
        const balance = accountInfo.data.parsed.info.tokenAmount.uiAmount;
        setUsdcBalance(balance);
      } else {
        // User has no USDC token account.
        setUsdcBalance(0);
      }
    } catch (e) {
      console.error("Failed to fetch real USDC balance:", e);
      // Fallback to 0 if there's any error with the RPC call.
      setUsdcBalance(0); 
    }
  }


  const signInWithWeb3 = async () => {
    // Phantom wallet is expected to be available on the window object
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
        alert('Phantom wallet is not installed. Please install it to use this feature.');
        console.error("Phantom wallet not found");
        return;
    }

    try {
        setLoading(true);
        const resp = await provider.connect({ onlyIfTrusted: false });
        const address = resp.publicKey.toString();
        
        if (address) {
            setWeb3UserAddress(address);
            await fetchUsdcBalance(address);
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
    const provider = window.solana;
    if (provider && provider.isConnected) {
        await provider.disconnect();
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
    solana?: {
      isPhantom: boolean;
      connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
      request: (params: { method: string, params?: any[] }) => Promise<any>;
    };
  }
}
