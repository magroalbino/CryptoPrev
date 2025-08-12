
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, signInWithCustomToken } from 'firebase/auth';
import { app, auth as firebaseAuth, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeUser } from '@/app/dashboard/actions';


// ============================================================================
// Constants & Types
// ============================================================================

const USDC_MINT_ADDRESS_SOLANA = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_CONTRACT_ADDRESS_ETHEREUM = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC

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

// ============================================================================
// Context Definition
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Wallet Provider Helpers
// ============================================================================

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
};

// ============================================================================
// AuthProvider Component
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [web3UserAddress, setWeb3UserAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Utility to clean up all state ---
  const cleanUpState = useCallback(() => {
    setUser(null);
    setWeb3UserAddress(null);
    setWalletType(null);
    setUsdcBalance(null);
    try {
      localStorage.removeItem('walletType');
      localStorage.removeItem('walletAddress');
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
    }
  }, []);
  
  // --- Main Sign Out Logic ---
  const signOut = useCallback(async () => {
    console.log('🔌 Disconnecting wallet...');
    setLoading(true);
    
    const provider = getPhantomProvider();
    if (provider?.isConnected) {
        try { await provider.disconnect(); } catch (e) { console.error('Phantom disconnect error:', e); }
    }
    
    if (isFirebaseEnabled && firebaseAuth.currentUser) {
      try { await firebaseAuth.signOut(); } catch (e) { console.error('Firebase sign out error:', e); }
    }

    cleanUpState();
    setLoading(false);
    console.log('✅ Disconnect complete.');
  }, [cleanUpState]);

  // --- New, Decoupled Wallet Connection Logic ---
  const connectWallet = useCallback(async (type: WalletType) => {
    setLoading(true);
    let address: string | null = null;
    
    try {
      if (type === 'solana') {
        const provider = getPhantomProvider();
        if (!provider) throw new Error('Phantom wallet is not installed.');
        const resp = await provider.connect({ onlyIfTrusted: false });
        address = resp.publicKey.toString();
      } else if (type === 'ethereum') {
        const provider = getMetamaskProvider();
        if (!provider) throw new Error('MetaMask wallet is not installed.');
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) throw new Error('No accounts returned from MetaMask.');
        address = accounts[0];
      }

      if (!address) throw new Error('Could not get wallet address.');
      
      console.log(`✅ Wallet connected: ${address}`);
      
      // Set client-side state immediately for a responsive UI
      setWeb3UserAddress(address);
      setWalletType(type);
      localStorage.setItem('walletType', type);
      localStorage.setItem('walletAddress', address);
      
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error.message);
      await signOut(); // Cleanup on failure
    } finally {
      setLoading(false);
    }
  }, [signOut]);
  
  // --- Effect to handle post-connection logic (Firebase Auth, Balance Fetch) ---
  useEffect(() => {
    const handlePostConnection = async (address: string, type: WalletType) => {
      // 1. Authenticate with Firebase in the background
      if (isFirebaseEnabled && app && firebaseAuth && (!firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== address)) {
          try {
              const functions = getFunctions(app);
              const createCustomToken = httpsCallable(functions, 'createCustomToken');
              const result = await createCustomToken({ address }) as any;
              
              if (!result?.data?.token) {
                throw new Error('Failed to retrieve custom token from server.');
              }
              
              const userCredential = await signInWithCustomToken(firebaseAuth, result.data.token);
              setUser(userCredential.user);
              console.log(`✅ Firebase signed in: ${userCredential.user.uid}`);
              await initializeUser(userCredential.user.uid);
              console.log(`✅ User document initialized for: ${userCredential.user.uid}`);
          } catch (error: any) {
            console.error(`Firebase sign-in failed: ${error.message}`);
            // IMPORTANT: Don't sign out. The wallet is connected, only Firebase auth failed.
            // The app can continue in a "wallet-connected" state.
            setUser(null);
          }
      }

      // 2. Fetch balance
      try {
        let balance = 0;
        if (type === 'solana') {
          const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
          const publicKey = new PublicKey(address);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: USDC_MINT_ADDRESS_SOLANA });
          balance = tokenAccounts?.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
        } else if (type === 'ethereum') {
          const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
          const contract = new ethers.Contract(USDC_CONTRACT_ADDRESS_ETHEREUM, ['function balanceOf(address) view returns (uint256)'], provider);
          const balanceResult = await contract.balanceOf(address);
          balance = parseFloat(ethers.formatUnits(balanceResult, 6));
        }
        setUsdcBalance(balance);
        console.log(`✅ Balance fetched: ${balance} USDC`);
      } catch(balanceError) {
         console.warn("Failed to fetch real USDC balance, providing mock balance:", balanceError);
         setUsdcBalance(1000.00); // Mock balance on failure for demo purposes.
      }
    };

    // This effect runs whenever the wallet address is set
    if (web3UserAddress && walletType) {
        handlePostConnection(web3UserAddress, walletType);
    }
  }, [web3UserAddress, walletType]);


  // --- Effect for auto-connecting from localStorage on page load ---
  useEffect(() => {
    const autoConnect = async () => {
        setLoading(true);
        const savedAddress = localStorage.getItem('walletAddress');
        const savedType = localStorage.getItem('walletType') as WalletType | null;

        if(savedAddress && savedType){
            console.log(`🔄 Found saved wallet, restoring session for ${savedAddress}`);
            setWeb3UserAddress(savedAddress);
            setWalletType(savedType);
        }
        setLoading(false);
    };
    
    autoConnect();
  }, []);

  // --- Wallet Event Listeners ---
  useEffect(() => {
    const provider = getMetamaskProvider();
    if (walletType === 'ethereum' && provider?.on) {
        const handleAccountsChanged = (accounts: string[]) => {
            console.log("MetaMask account changed.");
            if (accounts.length === 0 || accounts[0].toLowerCase() !== web3UserAddress?.toLowerCase()) {
                signOut();
            }
        };
        provider.on('accountsChanged', handleAccountsChanged);
        return () => {
            provider.removeListener('accountsChanged', handleAccountsChanged);
        };
    }
  }, [walletType, web3UserAddress, signOut]);


  const value: AuthContextType = { user, web3UserAddress, walletType, usdcBalance, loading, connectWallet, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Global Window Types
// ============================================================================

declare global {
  interface Window {
    solana?: any;
    ethereum?: any;
  }
}
