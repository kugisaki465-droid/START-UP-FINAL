/**
 * Firebase Auth Context
 * Supports: Email/Password + Google Sign-In
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const AuthContext    = createContext(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session automatically on page refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUser({
          uid:        firebaseUser.uid,
          email:      firebaseUser.email,
          full_name:  profile?.full_name || firebaseUser.displayName || 'User',
          photo_url:  firebaseUser.photoURL || null,
          role:       profile?.role || 'user',
          created_at: profile?.created_at || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── Email / Password Sign Up ──────────────────────────────────────────────
  async function signup(fullName, email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser     = credential.user;

    await updateProfile(fbUser, { displayName: fullName });

    await setDoc(doc(db, 'users', fbUser.uid), {
      full_name:  fullName,
      email:      email.toLowerCase(),
      role:       'user',
      provider:   'email',
      created_at: serverTimestamp(),
      last_login: serverTimestamp(),
    });
  }

  // ─── Email / Password Login ────────────────────────────────────────────────
  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await setDoc(
      doc(db, 'users', credential.user.uid),
      { last_login: serverTimestamp() },
      { merge: true }
    );
  }

  // ─── Google Sign-In ────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    const credential = await signInWithPopup(auth, googleProvider);
    const fbUser     = credential.user;

    // Create/update Firestore profile (first time or returning)
    await setDoc(
      doc(db, 'users', fbUser.uid),
      {
        full_name:  fbUser.displayName || 'Google User',
        email:      fbUser.email,
        photo_url:  fbUser.photoURL || null,
        role:       'user',
        provider:   'google',
        last_login: serverTimestamp(),
      },
      { merge: true } // don't overwrite created_at on returning users
    );

    // Set created_at only on first login
    const snap = await getDoc(doc(db, 'users', fbUser.uid));
    if (!snap.data()?.created_at) {
      await setDoc(
        doc(db, 'users', fbUser.uid),
        { created_at: serverTimestamp() },
        { merge: true }
      );
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

async function fetchProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
