
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app, isFirebaseEnabled } from './firebase-client'; // Use the initialized 'app'
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
    if (!isFirebaseEnabled || !app) {
      setLoading(false);
      // For a non-Firebase setup, we can simulate a logged-out state.
      setUser(null);
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

// This is a placeholder for a real signOut.
export const signOutFirebase = async () => {
    console.log("User signed out (simulation).");
};


declare global {
    interface Window {
        ethereum?: any;
    }
}
