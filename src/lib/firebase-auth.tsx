
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut, signInWithCustomToken } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { getFunctions, httpsCallable } from 'firebase/functions';


// USDC Contract Address on Solana Mainnet
const USDC_MINT_ADDRESS_SOLANA = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
// Using Sepolia testnet for Ethereum development
const USDC_CONTRACT_ADDRESS_ETHEREUM = "0x94a9D9AC8a22534E3FaCa4E4343A41133453d586"; 

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
    setWeb3UserAddress(null);
    setWalletType(null);
    setUsdcBalance(null);
    localStorage.removeItem('walletType');
    localStorage.removeItem('walletAddress');
    
    if (isFirebaseEnabled && app) {
      const auth = getAuth(app);
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    }
  }, []);

  // Signs in with Firebase using the wallet address by calling a Firebase Function
  const signInWithFirebase = async (address: string) => {
    if (!isFirebaseEnabled || !app) return;
    try {
      const functions = getFunctions(app);
      const createCustomToken = httpsCallable(functions, 'createCustomToken');
      const result = await createCustomToken({ address });
      
      const { token } = result.data as { token: string };
      if (!token) {
        throw new Error('Failed to get custom token from Firebase Function.');
      }
      
      const auth = getAuth(app);
      await signInWithCustomToken(auth, token);

    } catch (error) {
      console.error('Firebase custom sign-in failed:', error);
      throw error;
    }
  };
  
  const fetchUsdcBalance = useCallback(async (address: string, type: WalletType) => {
    try {
      if (type === 'solana') {
          const connection = await getWorkingSolanaConnection();
          if (!connection) throw new Error("Could not establish a Solana connection.");
          const publicKey = new PublicKey(address);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
              mint: USDC_MINT_ADDRESS_SOLANA,
          });
          const balance = tokenAccounts.value.length > 0
              ? tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
              : 0;
          setUsdcBalance(balance);
      } else if (type === 'ethereum') {
          const provider = getMetamaskProvider();
          if (!provider) throw new Error("MetaMask provider is not available.");
          const ethersProvider = new ethers.BrowserProvider(provider);
          const contract = new ethers.Contract(
              USDC_CONTRACT_ADDRESS_ETHEREUM,
              ['function balanceOf(address) view returns (uint256)'],
              ethersProvider
          );
          const balance = await contract.balanceOf(address);
          setUsdcBalance(parseFloat(ethers.formatUnits(balance, 6)));
      }
    } catch (error) {
       console.error(`Failed to fetch ${type} balance:`, error);
       setUsdcBalance(0);
    }
  }, []);

  const connectWallet = useCallback(async (type: WalletType, { onlyIfTrusted = false } = {}) => {
    setLoading(true);
    try {
        let address: string | null = null;
        if (type === 'solana') {
            const provider = getPhantomProvider();
            if (!provider) throw new Error('Phantom wallet is not installed.');
            const resp = await provider.connect( onlyIfTrusted ? { onlyIfTrusted } : undefined );
            address = resp.publicKey.toString();
        } else if (type === 'ethereum') {
            const provider = getMetamaskProvider();
            if (!provider) throw new Error('MetaMask wallet is not installed.');
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
              address = accounts[0];
            }
        }
        
        if (address) {
          setWeb3UserAddress(address);
          setWalletType(type);
          localStorage.setItem('walletType', type);
          localStorage.setItem('walletAddress', address);
          await signInWithFirebase(address);
          await fetchUsdcBalance(address, type);
        } else if (!onlyIfTrusted) {
            await cleanUpState();
        }
    } catch (error: any) {
      console.error(`Failed to connect to ${type} wallet:`, error);
      await cleanUpState();
    } finally {
        setLoading(false);
    }
  }, [cleanUpState, fetchUsdcBalance]);

  const signOut = useCallback(async () => {
    const connectedWalletType = localStorage.getItem('walletType');
    if (connectedWalletType === 'solana') {
        const provider = getPhantomProvider();
        if (provider?.isConnected) {
            await provider.disconnect();
        }
    }
    await cleanUpState();
  }, [cleanUpState]);
  
  // Try to auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
        const savedWalletType = localStorage.getItem('walletType') as WalletType | null;
        if (savedWalletType) {
            await connectWallet(savedWalletType, { onlyIfTrusted: true });
        } else {
            setLoading(false);
        }
    };
    autoConnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    if (!isFirebaseEnabled || !app) {
        setLoading(false);
        return;
    }
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        if (!firebaseUser) {
           const savedWalletType = localStorage.getItem('walletType');
           if (!savedWalletType) {
             cleanUpState();
           }
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [cleanUpState]);

  // Wallet event listeners
  useEffect(() => {
      const ethProvider = getMetamaskProvider();
      if (ethProvider?.on) {
          const handleAccountsChanged = (accounts: string[]) => {
              if (accounts.length === 0) {
                  signOut();
              } else {
                  connectWallet('ethereum');
              }
          };
          
          const handleChainChanged = () => {
              signOut();
          };

          ethProvider.on('accountsChanged', handleAccountsChanged);
          ethProvider.on('chainChanged', handleChainChanged);

          return () => {
              if (ethProvider.removeListener) {
                  ethProvider.removeListener('accountsChanged', handleAccountsChanged);
                  ethProvider.removeListener('chainChanged', handleChainChanged);
              }
          };
      }
  }, [connectWallet, signOut]);


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
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

    