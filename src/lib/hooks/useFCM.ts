'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  requestFCMPermission,
  onForegroundMessage,
  isFCMSupported,
  getStoredFCMToken,
  storeFCMToken,
} from '../firebase/messaging';
import { capabilities } from '../services/capabilities';

export interface FCMState {
  supported: boolean;
  token: string | null;
  permissionStatus: NotificationPermission | 'unsupported';
  requesting: boolean;
  requestPermission: () => Promise<string | null>;
}

/**
 * Hook for Firebase Cloud Messaging.
 * All operations are no-ops if FCM is unavailable — never throws.
 */
export function useFCM(): FCMState {
  const [supported, setSupported] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!capabilities.fcm) return;

    // Check support + restore stored token
    isFCMSupported().then((ok) => {
      setSupported(ok);
      if (ok) {
        const stored = getStoredFCMToken();
        if (stored) setToken(stored);
        if ('Notification' in window) {
          setPermissionStatus(Notification.permission);
        }
      }
    });
  }, []);

  // Listen for foreground messages and show a toast / update state
  useEffect(() => {
    if (!supported) return;
    let unsub = () => {};
    onForegroundMessage((payload) => {
      // Dispatch a custom event so ToastContext or any listener can pick it up
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cs:fcm-message', { detail: payload }),
        );
      }
    }).then((fn) => { unsub = fn; });
    return () => unsub();
  }, [supported]);

  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!supported) return null;
    setRequesting(true);
    try {
      const t = await requestFCMPermission();
      if (t) {
        setToken(t);
        storeFCMToken(t);
        setPermissionStatus('granted');
      } else {
        setPermissionStatus(
          typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
        );
      }
      return t;
    } finally {
      setRequesting(false);
    }
  }, [supported]);

  return { supported, token, permissionStatus, requesting, requestPermission };
}
