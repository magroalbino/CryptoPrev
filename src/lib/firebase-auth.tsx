
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut, signInWithCustomToken } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

// USDC Contract Address on Solana Mainnet
const USDC_MINT_ADDRESS = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Pool of public RPC endpoints to increase reliability
const SOLANA_RPC_ENDPOINTS = [
    'https://rpc.ankr.com/solana',
    'https://mainnet.helius-rpc.com/?api-key=01a7471c-13a5-4871-a472-a4421b593633', // Helius is generally reliable
];

type WalletType = 'solana' | 'ethereum';

interface AuthContextType {
  user: User | null;
  web3UserAddress: string | null;
  walletType: WalletType | null;
  usdcBalance: number | null;
  loading: boolean;
  connectWallet: (type: WalletType) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  web3UserAddress: null,
  walletType: null,
  usdcBalance: null,
  loading: true,
  connectWallet: async () => {},
  signOut: async () => {},
});

// Function to get a working connection from the pool by actively testing it
const getWorkingSolanaConnection = async (): Promise<Connection | null> => {
    for (const endpoint of SOLANA_RPC_ENDPOINTS) {
        try {
            const connection = new Connection(endpoint, 'confirmed');
            await connection.getVersion();
            return connection;
        } catch (e) {
            console.warn(`Failed to connect or get version from ${endpoint}, trying next...`);
        }
    }
    return null;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [web3UserAddress, setWeb3UserAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsdcBalance = useCallback(async (address: string) => {
    const connection = await getWorkingSolanaConnection();
    if (!connection) {
        setUsdcBalance(0);
        return;
    }

    try {
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
        console.error("Failed to fetch Solana balance even with a working connection:", error);
        setUsdcBalance(0);
    }
  }, []);

  useEffect(() => {
    if (web3UserAddress && walletType === 'solana') {
      fetchUsdcBalance(web3UserAddress);
    } else {
      setUsdcBalance(null);
    }
  }, [web3UserAddress, walletType, fetchUsdcBalance]);

  // Handle Firebase auth state changes
  useEffect(() => {
    if (!isFirebaseEnabled || !app) {
      setLoading(false);
      return;
    }
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Stop loading once we have auth state
    });
    return () => unsubscribe();
  }, []);
  
  const getPhantomProvider = () => {
    if (typeof window !== 'undefined' && 'solana' in window) {
      const provider = window.solana;
      if (provider && typeof provider === 'object' && 'isPhantom' in provider && provider.isPhantom) {
        return provider as any;
      }
    }
    return undefined;
  };

  const getMetamaskProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        return window.ethereum;
    }
    return undefined;
  }
  
  // Signs in with Firebase using the wallet address
  const signInWithWallet = async (address: string) => {
    if (!isFirebaseEnabled || !app) return;
    try {
      const response = await fetch('/api/create-custom-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get custom token');
      }
      
      const auth = getAuth(app);
      await signInWithCustomToken(auth, data.token);

    } catch (error) {
      console.error('Firebase custom sign-in failed:', error);
    }
  };


  const connectWallet = async (type: WalletType) => {
    let address: string | null = null;
    try {
        setLoading(true);
        if (type === 'solana') {
            const provider = getPhantomProvider();
            if (!provider) throw new Error('Phantom wallet is not installed.');
            const resp = await provider.connect();
            address = resp.publicKey.toString();
            setWeb3UserAddress(address);
            setWalletType('solana');
            localStorage.setItem('walletType', 'solana');
            localStorage.setItem('walletAddress', address);
        } else if (type === 'ethereum') {
            const provider = getMetamaskProvider();
            if (!provider) throw new Error('MetaMask wallet is not installed.');
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            address = accounts[0];
            setWeb3UserAddress(address);
            setWalletType('ethereum');
            localStorage.setItem('walletType', 'ethereum');
            localStorage.setItem('walletAddress', address);
        }
        
        if (address) {
          await signInWithWallet(address);
        }

    } catch (error: any) {
      if (error.code === 4001) {
        console.log('User rejected connection request.');
      } else {
        console.error(`Failed to connect to ${type} wallet:`, error);
      }
      setWeb3UserAddress(null);
      setWalletType(null);
      setUsdcBalance(null);
      localStorage.removeItem('walletType');
      localStorage.removeItem('walletAddress');
    } finally {
        setLoading(false);
    }
  }


  const signOut = async () => {
    const connectedWalletType = localStorage.getItem('walletType');
    if (connectedWalletType === 'solana') {
        const provider = getPhantomProvider();
        if (provider && provider.isConnected) {
            await provider.disconnect();
        }
    }
    
    if (isFirebaseEnabled && app) {
      const auth = getAuth(app);
      await firebaseSignOut(auth);
    }

    setWeb3UserAddress(null);
    setWalletType(null);
    setUsdcBalance(null);
    localStorage.removeItem('walletType');
    localStorage.removeItem('walletAddress');
    console.log("User signed out.");
  };
  
  // Try to auto-connect to the wallet after Firebase auth is resolved
  useEffect(() => {
    // Only run this if initial loading is done and we don't have a user
    if (loading) {
      return;
    }

    const autoConnect = async () => {
      let address: string | null = null;
      try {
        const savedWalletType = localStorage.getItem('walletType') as WalletType | null;

        if (savedWalletType === 'solana') {
            const provider = getPhantomProvider();
            if (provider) {
                const resp = await provider.connect({ onlyIfTrusted: true });
                address = resp.publicKey.toString();
                setWeb3UserAddress(address);
                setWalletType('solana');
            }
        } else if (savedWalletType === 'ethereum') {
            const provider = getMetamaskProvider();
            if (provider) {
                const accounts = await provider.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    address = accounts[0];
                    setWeb3UserAddress(address);
                    setWalletType('ethereum');
                }
            }
        }
        
        // If we got an address from the wallet and we still don't have a firebase user, sign in
        if (address && !user) {
          await signInWithWallet(address);
        }

      } catch (error) {
         console.log("Could not auto-connect wallet:", error);
      }
    };
    
    autoConnect();
  // We run this effect when Firebase loading is complete
  }, [loading, user]);

  return (
    <AuthContext.Provider value={{ user, web3UserAddress, walletType, usdcBalance, loading, connectWallet, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
    };
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
