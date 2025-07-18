'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, signInWithCustomToken, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase'; // Use the initialized 'app'
import { ethers } from 'ethers';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled) {
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

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const signInWithWeb3 = async () => {
  if (!isFirebaseEnabled) {
    alert("Firebase is not configured. Cannot sign in.");
    return;
  }
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    const signer = await provider.getSigner();
    
    // In a real app, you would get this nonce from your backend to prevent replay attacks
    const message = `Sign this message to log into CryptoPrev. Nonce: ${Date.now()}`;
    const signature = await signer.signMessage(message);

    // In a real app, you would send the address and signature to your backend,
    // which would verify the signature and create a custom Firebase token.
    // For this demo, we'll simulate this process on the client-side, which is NOT secure for production.
    // The backend would use firebase-admin to create the token.
    // e.g., const customToken = await admin.auth().createCustomToken(address);
    //
    // Since we don't have a backend function, we can't create a real custom token.
    // This is a placeholder for the concept. A real implementation requires a backend.
    
    console.log("Address:", address);
    console.log("Signature:", signature);

    // This part will fail without a backend to create a custom token.
    // const auth = getAuth(app);
    // await signInWithCustomToken(auth, customToken);
    
    alert(`Logged in with address: ${address}. (Note: Real Firebase Auth token generation requires a backend and is simulated here)`);

  } catch (error) {
    console.error("Error signing in with Web3:", error);
    alert("Failed to sign in. See console for details.");
  }
};

export const signOutFirebase = async () => {
  if (!isFirebaseEnabled) {
    alert("Firebase is not configured.");
    return;
  }
  const auth = getAuth(app);
  await signOut(auth);
};

declare global {
    interface Window {
        ethereum?: any;
    }
}
