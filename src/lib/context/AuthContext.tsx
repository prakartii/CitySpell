'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  sendPasswordReset,
  onAuthChange,
  sendPhoneOTP,
  confirmPhoneOTP,
  clearRecaptchaVerifier,
  parseFirebaseError,
} from '../firebase/auth';
import { DEMO_MODE } from '../firebase/config';
import {
  getDemoProfileForEmail,
  getDemoProfileForPhone,
  isDemoOtpValid,
} from '../firebase/demo';
import {
  createUser,
  getUser,
  getUserByPhone,
  subscribeToUser,
  updateLastLogin,
} from '../services/userService';
import { uploadUserAvatar } from '../firebase/storage';
import type { UserDoc, UserRole } from '../types/collections';
import { useToast } from './ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  wardId: string;
  ward?: string;
  photoFile?: File | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isCitizen: boolean;
  isAuthority: boolean;
  isAdmin: boolean;
  demoMode: boolean;

  // Sign-in
  signIn: (email: string, password: string) => Promise<UserDoc>;
  sendOTP: (phone: string, containerId: string) => Promise<ConfirmationResult>;
  verifyOTP: (result: ConfirmationResult, otp: string) => Promise<UserDoc>;

  // Registration
  signUp: (payload: SignUpPayload) => Promise<void>;

  // Guest
  continueAsGuest: () => void;

  // Sign-out & utils
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Guest session key
const GUEST_KEY = 'cs_guest';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Tracks a pending phone OTP lookup phone number
  const pendingPhoneRef = useRef<string | null>(null);

  // ── Boot: guest flag + Firebase auth listener ──────────────────────────────
  useEffect(() => {
    const guestFlag =
      typeof window !== 'undefined' && sessionStorage.getItem(GUEST_KEY) === '1';
    if (guestFlag) {
      setIsGuest(true);
      setLoading(false);
    }

    if (DEMO_MODE) {
      if (!guestFlag) setLoading(false);
      return;
    }

    let profileUnsub: (() => void) | undefined;

    const authUnsub = onAuthChange(async (fbUser) => {
      setUser(fbUser);
      profileUnsub?.();
      profileUnsub = undefined;

      if (fbUser) {
        if (typeof window !== 'undefined') sessionStorage.removeItem(GUEST_KEY);
        setIsGuest(false);

        const isPhoneUser = fbUser.providerData[0]?.providerId === 'phone';

        if (isPhoneUser) {
          // Phone auth: look up Firestore by the pending phone number
          const phone = pendingPhoneRef.current ?? fbUser.phoneNumber ?? '';
          try {
            const doc = await getUserByPhone(phone);
            setProfile(doc);
            if (doc) {
              void updateLastLogin(doc.uid);
            }
          } catch {
            setProfile(null);
          } finally {
            setLoading(false);
          }
        } else {
          // Email auth: subscribe by UID
          try {
            profileUnsub = subscribeToUser(fbUser.uid, (doc) => {
              setProfile(doc);
              setLoading(false);
            });
            void updateLastLogin(fbUser.uid);
          } catch {
            setLoading(false);
          }
        }
      } else {
        setProfile(null);
        if (!guestFlag) setLoading(false);
      }
    });

    return () => {
      authUnsub();
      profileUnsub?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Email / password sign-in ───────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<UserDoc> => {
      if (DEMO_MODE) {
        const mockProfile = getDemoProfileForEmail(email);
        const doc: UserDoc = {
          ...mockProfile,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['createdAt'],
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['updatedAt'],
        };
        setProfile(doc);
        setIsGuest(false);
        toast(`Welcome back, ${doc.name}!`, 'success');
        return doc;
      }

      try {
        const fbUser = await signInWithEmail(email, password);
        const doc = await getUser(fbUser.uid);
        if (!doc) throw new Error('Profile not found. Please contact support.');
        void updateLastLogin(fbUser.uid);
        toast(`Welcome back, ${doc.name ?? doc.displayName}!`, 'success');
        return doc;
      } catch (err) {
        const msg = parseFirebaseError(err);
        toast(msg, 'error');
        throw new Error(msg);
      }
    },
    [toast],
  );

  // ── Phone OTP – send ───────────────────────────────────────────────────────
  const sendOTP = useCallback(
    async (phone: string, containerId: string): Promise<ConfirmationResult> => {
      if (DEMO_MODE) {
        toast('OTP sent (demo mode). Enter any 6 digits.', 'info');
        pendingPhoneRef.current = phone;
        // Return a fake ConfirmationResult
        return { verificationId: 'demo' } as unknown as ConfirmationResult;
      }

      try {
        const result = await sendPhoneOTP(phone, containerId);
        pendingPhoneRef.current = phone;
        toast('OTP sent to your phone.', 'info');
        return result;
      } catch (err) {
        const msg = parseFirebaseError(err);
        toast(msg, 'error');
        throw new Error(msg);
      }
    },
    [toast],
  );

  // ── Phone OTP – verify ─────────────────────────────────────────────────────
  const verifyOTP = useCallback(
    async (result: ConfirmationResult, otp: string): Promise<UserDoc> => {
      const phone = pendingPhoneRef.current ?? '';

      if (DEMO_MODE) {
        if (!isDemoOtpValid(otp)) {
          toast('Invalid OTP. Enter any 6-digit code in demo mode.', 'error');
          throw new Error('Invalid OTP.');
        }
        const mockProfile = getDemoProfileForPhone(phone);
        const doc: UserDoc = {
          ...mockProfile,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['createdAt'],
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['updatedAt'],
        };
        setProfile(doc);
        setIsGuest(false);
        toast(`Welcome back, ${doc.name}!`, 'success');
        pendingPhoneRef.current = null;
        return doc;
      }

      try {
        const fbUser = await confirmPhoneOTP(result, otp);
        const doc = await getUserByPhone(phone);
        if (!doc) throw new Error('No account linked to this phone number. Please register.');
        void updateLastLogin(doc.uid);
        toast(`Welcome back, ${doc.name ?? doc.displayName}!`, 'success');
        pendingPhoneRef.current = null;
        return doc;
      } catch (err) {
        const msg = parseFirebaseError(err);
        toast(msg, 'error');
        throw new Error(msg);
      }
    },
    [toast],
  );

  // ── Registration ───────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (payload: SignUpPayload): Promise<void> => {
      const { name, email, password, phone, wardId, ward, photoFile } = payload;

      if (DEMO_MODE) {
        toast('Account created! (demo mode)', 'success');
        const doc: UserDoc = {
          uid: `demo-new-${Date.now()}`,
          email,
          name,
          displayName: name,
          role: 'citizen',
          wardId,
          ward,
          phone,
          photoURL: undefined,
          avatarUrl: undefined,
          verified: false,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['createdAt'],
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as UserDoc['updatedAt'],
          notificationPreferences: { email: true, push: true, sms: false },
          stats: { issuesReported: 0, issuesResolved: 0, reputationScore: 0 },
        };
        setProfile(doc);
        setIsGuest(false);
        return;
      }

      try {
        const fbUser = await signUpWithEmail(email, password, name);

        let photoURL: string | undefined;
        if (photoFile) {
          try {
            photoURL = await uploadUserAvatar(fbUser.uid, photoFile);
          } catch {
            // Photo upload failure is non-fatal
          }
        }

        const userData: Parameters<typeof createUser>[1] = {
          uid: fbUser.uid,
          email,
          name,
          displayName: name,
          role: 'citizen' as UserRole,
          wardId,
          ward,
          phone,
          photoURL,
          avatarUrl: photoURL,
          verified: false,
          notificationPreferences: { email: true, push: true, sms: false },
          stats: { issuesReported: 0, issuesResolved: 0, reputationScore: 0 },
        };

        await createUser(fbUser.uid, userData);
        toast('Account created successfully! Welcome to CitySpell.', 'success');
      } catch (err) {
        const msg = parseFirebaseError(err);
        toast(msg, 'error');
        throw new Error(msg);
      }
    },
    [toast],
  );

  // ── Guest ──────────────────────────────────────────────────────────────────
  const continueAsGuest = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
  }, []);

  // ── Sign-out ───────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setProfile(null);
    clearRecaptchaVerifier();
    if (!DEMO_MODE) {
      try {
        await signOutUser();
      } catch {
        // ignore
      }
    }
    setUser(null);
    toast('Signed out successfully.', 'info');
  }, [toast]);

  // ── Reset password ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(
    async (email: string) => {
      if (DEMO_MODE) {
        toast('Password reset email sent (demo mode).', 'info');
        return;
      }
      try {
        await sendPasswordReset(email);
        toast('Password reset email sent. Check your inbox.', 'success');
      } catch (err) {
        const msg = parseFirebaseError(err);
        toast(msg, 'error');
        throw new Error(msg);
      }
    },
    [toast],
  );

  // ── Context value ──────────────────────────────────────────────────────────
  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAuthenticated: !!user || (DEMO_MODE && !!profile),
    isGuest,
    isCitizen: profile?.role === 'citizen',
    isAuthority: profile?.role === 'authority',
    isAdmin: profile?.role === 'admin',
    demoMode: DEMO_MODE,
    signIn,
    sendOTP,
    verifyOTP,
    signUp,
    continueAsGuest,
    signOut: handleSignOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}

// Backward-compat alias
export const useAuth = useAuthContext;
