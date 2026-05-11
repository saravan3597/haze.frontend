import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isGuest: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = useCallback(async (u: User) => {
    if (u.isAnonymous) return;
    const ref = doc(db, 'users', u.uid, 'profile', 'data');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: u.displayName ?? '',
        email: u.email ?? '',
        createdAt: serverTimestamp(),
        preferredStyle: 'gradient',
        palette: 'auto',
      });
    }
    // Back-fill displayName if missing (email/password sign-up)
    if (!u.displayName && u.email) {
      await updateProfile(u, { displayName: u.email.split('@')[0] });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          await ensureProfile(u);
        } catch {
          // Don't block auth loading if profile sync fails
        }
      }
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [ensureProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, isGuest: !!user?.isAnonymous }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
