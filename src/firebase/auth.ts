import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  signOut,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { app } from './config';

// Mutable flag — set true before createUserWithEmailAndPassword to prevent
// AuthContext from processing the auto sign-in that Firebase triggers internally.
// AuthContext resets it after the first signed-in onAuthStateChanged event.
export const authFlags = { skipNextSignIn: false };

// On native Capacitor (iOS/Android), use indexedDBLocalPersistence explicitly
// to avoid WKWebView hanging on auth state initialization.
export const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] })
  : getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    // Use native Firebase Authentication plugin (SPM-compatible, reads GoogleService-Info.plist)
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(
      result.credential?.idToken ?? null,
      result.credential?.accessToken ?? null,
    );
    return signInWithCredential(auth, credential);
  }
  return signInWithPopup(auth, googleProvider);
};

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name?.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return cred;
};

export const signInAsGuest = () => signInAnonymously(auth);

export const signOutUser = () => signOut(auth);
