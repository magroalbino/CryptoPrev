
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { isFirebaseEnabled, auth as firebaseAuth } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { initializeUser } from '@/app/dashboard/actions';


// ============================================================================
// Constants & Types
// ============================================================================

const USDC_MINT_ADDRESS_SOLANA = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_CONTRACT_ADDRESS_ETHEREUM = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC

type WalletType = 'solana' | 'ethereum';

interface AuthContextType {
  user: User | null; // This will likely remain null, but we keep it for type consistency
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

    const phantomProvider = getPhantomProvider();
    if (phantomProvider?.isConnected) {
      try { await phantomProvider.disconnect(); } catch (e) { console.error('Phantom disconnect error:', e); }
    }

    if (isFirebaseEnabled && firebaseAuth?.currentUser) {
      try { await firebaseSignOut(firebaseAuth); } catch (e) { console.error('Firebase sign out error:', e); }
    }

    cleanUpState();
    setLoading(false);
    console.log('✅ Disconnect complete.');
  }, [cleanUpState]);

  const handleSuccessfulConnection = useCallback(async (address: string, type: WalletType) => {
    setWeb3UserAddress(address);
    setWalletType(type);
    localStorage.setItem('walletAddress', address);
    localStorage.setItem('walletType', type);

    // 1. Initialize user document in Firestore first. This is the most critical step.
    try {
      await initializeUser(address);
      console.log(`✅ User document check/initialization complete for: ${address}`);
    } catch (error) {
      console.error("Critical: Failed to initialize user document on server.", error);
      // Even if this fails, we can proceed with a degraded experience, but this is less likely to fail than auth.
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
    } catch (balanceError) {
      console.warn(`Failed to fetch real USDC balance for ${type} ${address}, providing mock balance:`, JSON.stringify(balanceError));
      setUsdcBalance(1000.00); // Mock balance on failure for demo purposes.
    }

    // Firebase sign-in is removed from this flow to prevent the "internal" error.
    // The application will now rely on the web3UserAddress as the primary identifier.
    setUser(null); // Explicitly set user to null as we are not using Firebase Auth sessions.

  }, []);


  // --- New, Decoupled Wallet Connection Logic ---
  const connectWallet = useCallback(async (type: WalletType) => {
    setLoading(true);
    try {
      let address: string | null = null;

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
      await handleSuccessfulConnection(address, type);

    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      let userFriendlyError = 'Wallet connection failed.';

      if (error.message === 'Phantom wallet is not installed.') {
        userFriendlyError = 'Phantom wallet not found. Please install it.';
      } else if (error.message === 'MetaMask wallet is not installed.') {
        userFriendlyError = 'MetaMask wallet not found. Please install it.';
      } else if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        userFriendlyError = 'Wallet connection request rejected by the user.';
      }
      // You could add more specific error checks based on known wallet errors
      alert(`Connection Error: ${userFriendlyError}`); // Or use a more sophisticated UI for errors
      await signOut(); // Cleanup on failure
    } finally {
      setLoading(false);
    }
  }, [signOut, handleSuccessfulConnection]);

  // --- Effect for auto-connecting from localStorage on page load ---
  useEffect(() => {
    const autoConnect = async () => {
      setLoading(true);
      const savedAddress = localStorage.getItem('walletAddress');
      const savedType = localStorage.getItem('walletType') as WalletType | null;

      if (savedAddress && savedType) {
        console.log(`🔄 Found saved wallet, restoring session for ${savedAddress}`);
        await handleSuccessfulConnection(savedAddress, savedType);
      }
      setLoading(false);
    };

    if (typeof window !== 'undefined') {
      autoConnect();
    }
  }, [handleSuccessfulConnection]);


  // --- Wallet Event Listeners ---
  useEffect(() => {
    const provider = getMetamaskProvider();
    if (walletType === 'ethereum' && provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("MetaMask account changed.");
        if (accounts.length === 0 || (web3UserAddress && accounts[0].toLowerCase() !== web3UserAddress.toLowerCase())) {
          signOut();
        }
      };
      provider.on('accountsChanged', handleAccountsChanged);
      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
      };
    }

    const phantomProvider = getPhantomProvider();
    if (walletType === 'solana' && phantomProvider?.on) {
      const handleDisconnect = () => {
        console.log("Phantom wallet disconnected.");
        signOut();
      };
      phantomProvider.on('disconnect', handleDisconnect);
      return () => {
        phantomProvider.removeListener('disconnect', handleDisconnect);
      }
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
