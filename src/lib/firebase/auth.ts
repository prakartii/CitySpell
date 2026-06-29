import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
  type UserCredential,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from './config';
import type { UnsubscribeFn } from '../types/collections';

export type { ConfirmationResult };

// ─── Error messages ───────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid credentials. Check your email and password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/invalid-phone-number': 'Invalid phone number. Use format: +91XXXXXXXXXX',
  'auth/invalid-verification-code': 'Incorrect OTP. Please try again.',
  'auth/code-expired': 'OTP has expired. Please request a new one.',
  'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
  'auth/captcha-check-failed': 'Captcha verification failed. Please retry.',
  'auth/missing-phone-number': 'Please enter your phone number.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
  'auth/requires-recent-login': 'Please sign in again to perform this action.',
};

export function parseFirebaseError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return ERROR_MESSAGES[code] ?? `Sign-in failed (${code}).`;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

// ─── Email / Password ─────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ─── Phone OTP ────────────────────────────────────────────────────────────────

let _recaptchaVerifier: RecaptchaVerifier | null = null;

export function clearRecaptchaVerifier(): void {
  try {
    _recaptchaVerifier?.clear();
  } catch {
    // ignore — already cleared
  }
  _recaptchaVerifier = null;
}

export async function sendPhoneOTP(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  clearRecaptchaVerifier();
  _recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  return signInWithPhoneNumber(auth, phoneNumber, _recaptchaVerifier);
}

export async function confirmPhoneOTP(
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<User> {
  const credential: UserCredential = await confirmationResult.confirm(otp);
  return credential.user;
}

// ─── Google ───────────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  clearRecaptchaVerifier();
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void): UnsubscribeFn {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
