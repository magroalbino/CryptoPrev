
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut, signInWithCustomToken } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { getFunctions, httpsCallable } from 'firebase/functions';

const USDC_MINT_ADDRESS_SOLANA = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_CONTRACT_ADDRESS_ETHEREUM = "0x94a9D9AC8a22534E3FaCa4E4343A41133453d586";

const SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=01a7471c-13a5-4871-a472-a4421b593633';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [web3UserAddress, setWeb3UserAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanUpState = useCallback(async () => {
    const auth = getAuth(app!);
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setWeb3UserAddress(null);
    setWalletType(null);
    setUsdcBalance(null);
    localStorage.removeItem('walletType');
    localStorage.removeItem('walletAddress');
    console.log('State cleaned up.');
  }, []);

  const signInWithFirebase = useCallback(async (address: string) => {
    if (!isFirebaseEnabled || !app) {
      console.warn("Firebase not enabled, skipping sign-in.");
      return null;
    }
    try {
      const functions = getFunctions(app);
      const createCustomToken = httpsCallable(functions, 'createCustomToken');
      const result = await createCustomToken({ address });
      const token = (result.data as { token: string }).token;
      
      const auth = getAuth(app);
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential.user;
    } catch (error: any) {
      console.error('Firebase sign-in failed:', error.message || error);
      await cleanUpState();
      throw new Error('Failed to sign in with Firebase.');
    }
  }, [cleanUpState]);
  
  const fetchUsdcBalance = useCallback(async (address: string, type: WalletType) => {
    try {
      if (type === 'solana') {
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        const publicKey = new PublicKey(address);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: USDC_MINT_ADDRESS_SOLANA });
        const balance = tokenAccounts?.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
        return balance;
      } else if (type === 'ethereum') {
        const provider = getMetamaskProvider();
        if (!provider) return 0;
        const ethersProvider = new ethers.BrowserProvider(provider);
        const contract = new ethers.Contract(USDC_CONTRACT_ADDRESS_ETHEREUM, ['function balanceOf(address) view returns (uint256)'], ethersProvider);
        const balanceResult = await contract.balanceOf(address);
        return parseFloat(ethers.formatUnits(balanceResult, 6));
      }
      return 0;
    } catch (error) {
        console.error(`Failed to fetch USDC balance for ${type}:`, error);
        return 0; // Return a default value in case of error
    }
  }, []);

  const connectWallet = useCallback(async (type: WalletType, { onlyIfTrusted = false } = {}) => {
    setLoading(true);
    try {
      let provider;
      let address: string | null = null;
      
      if (type === 'solana') {
        provider = getPhantomProvider();
        if (!provider) throw new Error('Phantom wallet is not installed.');
        const resp = await provider.connect({ onlyIfTrusted });
        address = resp.publicKey.toString();
      } else if (type === 'ethereum') {
        provider = getMetamaskProvider();
        if (!provider) throw new Error('MetaMask wallet is not installed.');
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
      }

      if (address) {
        const firebaseUser = await signInWithFirebase(address);
        const balance = await fetchUsdcBalance(address, type);

        setUser(firebaseUser);
        setWeb3UserAddress(address);
        setWalletType(type);
        setUsdcBalance(balance);

        localStorage.setItem('walletType', type);
        localStorage.setItem('walletAddress', address);
      }
    } catch (error: any) {
      console.error(`Failed to connect to ${type} wallet:`, error.message);
      await cleanUpState();
    } finally {
      setLoading(false);
    }
  }, [cleanUpState, signInWithFirebase, fetchUsdcBalance]);

  const signOut = useCallback(async () => {
    setLoading(true);
    const type = walletType;
    if (type === 'solana') {
      const provider = getPhantomProvider();
      if (provider?.isConnected) {
        await provider.disconnect();
      }
    }
    await cleanUpState();
    setLoading(false);
  }, [walletType, cleanUpState]);

  useEffect(() => {
    const autoConnect = async () => {
      const savedWalletType = localStorage.getItem('walletType') as WalletType | null;
      if (savedWalletType) {
        console.log(`Attempting to auto-connect with ${savedWalletType}`);
        await connectWallet(savedWalletType, { onlyIfTrusted: true });
      } else {
        setLoading(false);
      }
    };
    autoConnect();
  }, [connectWallet]);
  
  // Event listeners for wallet changes
  useEffect(() => {
    const metamaskProvider = getMetamaskProvider();
    if (walletType === 'ethereum' && metamaskProvider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0 || accounts[0] !== web3UserAddress) {
          console.log('MetaMask account changed or disconnected.');
          signOut();
        }
      };
      metamaskProvider.on('accountsChanged', handleAccountsChanged);
      return () => {
        metamaskProvider.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }

    const phantomProvider = getPhantomProvider();
    if (walletType === 'solana' && phantomProvider?.on) {
       const handleAccountChanged = (publicKey: PublicKey | null) => {
          if (!publicKey || publicKey.toString() !== web3UserAddress) {
              console.log('Phantom account changed or disconnected.');
              signOut();
          }
       };
       phantomProvider.on('accountChanged', handleAccountChanged);
       return () => {
          phantomProvider.removeListener?.('accountChanged', handleAccountChanged);
       }
    }
  }, [walletType, web3UserAddress, signOut]);

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
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
