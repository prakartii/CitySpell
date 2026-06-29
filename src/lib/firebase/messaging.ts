// Firebase Cloud Messaging (FCM) adapter.
// Requires NEXT_PUBLIC_FCM_VAPID_KEY — silently no-ops if absent, unsupported, or permission denied.

import type { MessagePayload, Messaging } from 'firebase/messaging';
import { capabilities } from '../services/capabilities';

const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? '';

let _messaging: Messaging | null = null;
let _initTried = false;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!capabilities.fcm || typeof window === 'undefined') return null;
  if (_messaging) return _messaging;
  if (_initTried) return null;
  _initTried = true;
  try {
    const [{ getMessaging, isSupported }, { app }] = await Promise.all([
      import('firebase/messaging'),
      import('./config'),
    ]);
    if (!(await isSupported())) return null;
    _messaging = getMessaging(app);
    return _messaging;
  } catch {
    return null;
  }
}

/**
 * Registers the FCM service worker, requests notification permission,
 * and returns an FCM token. Returns null if unavailable or denied.
 */
export async function requestFCMPermission(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging || !VAPID_KEY) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const registration = await navigator.serviceWorker.register('/api/firebase-messaging-sw', {
      scope: '/',
    });

    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Subscribes to foreground push messages.
 * Returns an unsubscribe function (no-op if FCM is unavailable).
 */
export async function onForegroundMessage(
  callback: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  try {
    const { onMessage } = await import('firebase/messaging');
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}

/** Returns true if FCM is supported in this browser environment. */
export async function isFCMSupported(): Promise<boolean> {
  if (!capabilities.fcm || typeof window === 'undefined') return false;
  try {
    const { isSupported } = await import('firebase/messaging');
    return await isSupported();
  } catch {
    return false;
  }
}

/** Returns the currently stored FCM token from localStorage (if any). */
export function getStoredFCMToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('cs_fcm_token'); }
  catch { return null; }
}

/** Persists the FCM token to localStorage. */
export function storeFCMToken(token: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('cs_fcm_token', token); }
  catch { /* ignore */ }
}
