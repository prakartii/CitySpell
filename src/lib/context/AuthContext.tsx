'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  sendPasswordReset,
  onAuthChange,
} from '../firebase/auth';
import { createUser, subscribeToUser } from '../services/userService';
import type { UserDoc, UserRole } from '../types/collections';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SignUpPayload {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  wardId: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  isAuthenticated: boolean;
  isCitizen: boolean;
  isAuthority: boolean;
  isAdmin: boolean;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub: (() => void) | undefined;

    const authUnsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      profileUnsub?.();
      profileUnsub = undefined;

      if (firebaseUser) {
        profileUnsub = subscribeToUser(firebaseUser.uid, (doc) => {
          setProfile(doc);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      profileUnsub?.();
    };
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const { email, password, displayName, role, wardId, phone } = payload;
    const firebaseUser = await signUpWithEmail(email, password, displayName);
    await createUser(firebaseUser.uid, {
      uid: firebaseUser.uid,
      email,
      displayName,
      role,
      wardId,
      phone,
      verified: false,
      notificationPreferences: { email: true, push: true, sms: false },
      stats: { issuesReported: 0, issuesResolved: 0, reputationScore: 0 },
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signInGoogle = useCallback(async () => {
    const firebaseUser = await signInWithGoogle();
    // Create profile only if first sign-in (no existing profile)
    const existing = profile;
    if (!existing) {
      await createUser(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        role: 'citizen',
        wardId: '',
        avatarUrl: firebaseUser.photoURL ?? undefined,
        verified: true,
        notificationPreferences: { email: true, push: true, sms: false },
        stats: { issuesReported: 0, issuesResolved: 0, reputationScore: 0 },
      });
    }
  }, [profile]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordReset(email);
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isCitizen: profile?.role === 'citizen',
    isAuthority: profile?.role === 'authority',
    isAdmin: profile?.role === 'admin',
    signUp,
    signIn,
    signInGoogle,
    signOut: handleSignOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
