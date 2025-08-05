
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';

// USDC Contract Address on Solana Mainnet
const USDC_MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOLANA_RPC_ENDPOINT = "https://rpc.ankr.com/solana";

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

  const fetchUsdcBalance = useCallback(async (address: string) => {
    try {
        const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
        const publicKey = new PublicKey(address);
        
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: USDC_MINT_ADDRESS,
        });

        if (tokenAccounts.value.length > 0) {
            const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info;
            setUsdcBalance(tokenAccountInfo.tokenAmount.uiAmount);
        } else {
            setUsdcBalance(0);
        }
    } catch (error) {
        console.error("Failed to fetch balance, falling back to simulated data:", error);
        setUsdcBalance(0); // Fallback to 0 on error
    }
  }, []);

  useEffect(() => {
    if (web3UserAddress) {
      fetchUsdcBalance(web3UserAddress);
    }
  }, [web3UserAddress, fetchUsdcBalance]);

  useEffect(() => {
    if (!isFirebaseEnabled || !app) {
      setLoading(false);
      return;
    }
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Keep loading true until we check for a wallet connection
      // setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const getProvider = (): {
      isPhantom: boolean;
      connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
    } | undefined => {
    if (typeof window !== 'undefined' && 'solana' in window) {
      const provider = window.solana;
      if (provider && typeof provider === 'object' && 'isPhantom' in provider && provider.isPhantom) {
        return provider as any;
      }
    }
    return undefined;
  };


  const signInWithWeb3 = async () => {
    const provider = getProvider();
    if (!provider) {
      alert('Phantom wallet is not installed. Please install it to use this feature.');
      console.error('Phantom wallet not found');
      return;
    }
    setLoading(true);
    try {
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      setWeb3UserAddress(address);
    } catch (error) {
      console.error('Failed to connect to Phantom wallet:', error);
      alert('Failed to connect to Phantom. Please try again.');
      setWeb3UserAddress(null);
      setUsdcBalance(null);
    } finally {
      setLoading(false);
    }
  };


  const signOut = async () => {
    const provider = getProvider();
    if (provider && provider.isConnected) {
        await provider.disconnect();
    }
    if (isFirebaseEnabled && app) {
      const auth = getAuth(app);
      await firebaseSignOut(auth);
    }
    setWeb3UserAddress(null);
    setUsdcBalance(null);
    console.log("User signed out.");
  };
  
  // This effect checks for an already-connected wallet on page load
  useEffect(() => {
    const autoConnect = async () => {
      const provider = getProvider();
      if (provider) {
        try {
          // onlyIfTrusted will connect silently if the user has already approved the site
          const resp = await provider.connect({ onlyIfTrusted: true });
          setWeb3UserAddress(resp.publicKey.toString());
        } catch (error) {
           // Silently fail if the user is not already connected
          console.log("Phantom not connected or user chose not to connect.");
        }
      }
      setLoading(false); // We're done with the initial auth flow
    };
    
    autoConnect();
  }, []);

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
