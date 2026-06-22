'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange } from '../firebase/auth';
import { subscribeToUser } from '../services/userService';
import type { UserDoc } from '../types/collections';

export interface AuthState {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  isAuthenticated: boolean;
  isCitizen: boolean;
  isAuthority: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub: (() => void) | undefined;

    const authUnsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);

      // Clean up previous profile subscription
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

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isCitizen: profile?.role === 'citizen',
    isAuthority: profile?.role === 'authority',
    isAdmin: profile?.role === 'admin',
  };
}
