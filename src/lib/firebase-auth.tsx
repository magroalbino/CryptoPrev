
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client';
import { ethers } from 'ethers';

interface AuthContextType {
  user: User | null;
  web3UserAddress: string | null;
  loading: boolean;
  signInWithWeb3: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  web3UserAddress: null,
  loading: true,
  signInWithWeb3: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [web3UserAddress, setWeb3UserAddress] = useState<string | null>(null);
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
  
  const signInWithWeb3 = async () => {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install it to use this feature.');
        console.error("MetaMask not found");
        return;
    }

    try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        
        if (accounts && accounts.length > 0) {
            setWeb3UserAddress(accounts[0]);
            // Here you would typically call a backend endpoint to get a custom Firebase token
            // For now, we are just simulating the login by setting the address.
        }
    } catch (error) {
        console.error("Failed to connect to MetaMask:", error);
        alert("Failed to connect to MetaMask. Please try again.");
    } finally {
        setLoading(false);
    }
  };


  const signOut = async () => {
    if (isFirebaseEnabled && app) {
      const auth = getAuth(app);
      await firebaseSignOut(auth);
    }
    setWeb3UserAddress(null); // Also clear the web3 address
    console.log("User signed out.");
  };

  return (
    <AuthContext.Provider value={{ user, web3UserAddress, loading, signInWithWeb3, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

declare global {
  interface Window {
    ethereum?: any;
  }
}
