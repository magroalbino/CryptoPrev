
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut, signInWithCustomToken } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { getFunctions, httpsCallable } from 'firebase/functions';

const USDC_MINT_ADDRESS_SOLANA = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_CONTRACT_ADDRESS_ETHEREUM = "0x94a9D9AC8a22534E3FaCa4E4343A41133453d586";

const SOLANA_RPC_ENDPOINTS = [
    'https://rpc.ankr.com/solana',
    'https://mainnet.helius-rpc.com/?api-key=01a7471c-13a5-4871-a472-a4421b593633',
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
    setUser(null);
    localStorage.removeItem('walletType');
    localStorage.removeItem('walletAddress');
    
    if (isFirebaseEnabled && app) {
      const auth = getAuth(app);
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    }
  }, []);

  const signInWithFirebase = async (address: string) => {
    if (!isFirebaseEnabled || !app) throw new Error("Firebase is not enabled.");
    
    try {
      const functions = getFunctions(app);
      const createCustomToken = httpsCallable(functions, 'createCustomToken');
      const result = await createCustomToken({ address });
      
      const { token } = result.data as { token: string };
      if (!token) {
        throw new Error('Failed to get custom token from Firebase Function.');
      }
      
      const auth = getAuth(app);
      const userCredential = await signInWithCustomToken(auth, token);
      setUser(userCredential.user);
    } catch (error) {
      console.error('Firebase custom sign-in failed:', error);
      await cleanUpState();
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
            const resp = onlyIfTrusted ? await provider.connect({ onlyIfTrusted: true }) : await provider.connect();
            address = resp?.publicKey?.toString() ?? null;
        } else if (type === 'ethereum') {
            const provider = getMetamaskProvider();
            if (!provider) throw new Error('MetaMask wallet is not installed.');
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
              address = accounts[0];
            }
        }
        
        if (address) {
          await signInWithFirebase(address);
          await fetchUsdcBalance(address, type);
          setWeb3UserAddress(address);
          setWalletType(type);
          localStorage.setItem('walletType', type);
          localStorage.setItem('walletAddress', address);
        } else if (!onlyIfTrusted) {
            await cleanUpState();
        }
    } catch (error: any) {
      console.error(`Failed to connect to ${type} wallet:`, error.message);
      await cleanUpState();
    } finally {
        setLoading(false);
    }
  }, [cleanUpState, fetchUsdcBalance]);

  const signOut = useCallback(async () => {
    setLoading(true);
    const connectedWalletType = localStorage.getItem('walletType');
    if (connectedWalletType === 'solana') {
        const provider = getPhantomProvider();
        if (provider?.isConnected) {
            try {
              await provider.disconnect();
            } catch (e) {
              console.error("Error disconnecting from Phantom:", e);
            }
        }
    }
    await cleanUpState();
    setLoading(false);
  }, [cleanUpState]);
  
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
  }, [connectWallet]);

  useEffect(() => {
    if (!isFirebaseEnabled || !app) {
        setLoading(false);
        return;
    }
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        if (!firebaseUser && web3UserAddress) {
            signOut();
        }
    });
    return () => unsubscribe();
  }, [app, isFirebaseEnabled, web3UserAddress, signOut]);

  useEffect(() => {
      const ethProvider = getMetamaskProvider();
      if (ethProvider?.on) {
          const handleAccountsChanged = (accounts: string[]) => {
              if (accounts.length === 0) {
                  signOut();
              } else if (web3UserAddress && accounts[0] !== web3UserAddress) {
                  signOut().then(() => connectWallet('ethereum'));
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
  }, [connectWallet, signOut, web3UserAddress]);


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
