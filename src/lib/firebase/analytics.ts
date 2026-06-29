// Firebase Analytics adapter.
// Silently no-ops if NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is absent, in SSR, or on init failure.

import type { Analytics } from 'firebase/analytics';
import { capabilities } from '../services/capabilities';

let _analytics: Analytics | null = null;
let _initTried = false;

async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (!capabilities.analytics || typeof window === 'undefined') return null;
  if (_analytics) return _analytics;
  if (_initTried) return null;
  _initTried = true;
  try {
    const [{ getAnalytics, isSupported }, { app }] = await Promise.all([
      import('firebase/analytics'),
      import('./config'),
    ]);
    if (!(await isSupported())) return null;
    _analytics = getAnalytics(app);
    return _analytics;
  } catch {
    return null;
  }
}

/** Log a custom event. No-op if Analytics is unavailable. */
export async function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    const a = await getAnalyticsInstance();
    if (!a) return;
    const { logEvent: fbLogEvent } = await import('firebase/analytics');
    fbLogEvent(a, eventName, params ?? {});
  } catch { /* analytics failures are always silent */ }
}

/** Track a page view. Typically called on route change. */
export async function logPageView(path: string): Promise<void> {
  await logEvent('page_view', { page_path: path });
}

// ── Typed event helpers ───────────────────────────────────────────────────────

export const analytics = {
  /** Called when a user reports an issue. */
  issueReported: (category: string, severity: string, wardId: string) =>
    logEvent('issue_reported', { category, severity, ward_id: wardId }),

  /** Called when a user views an issue detail page. */
  issueViewed: (issueId: string) =>
    logEvent('issue_viewed', { issue_id: issueId }),

  /** Called when a user upvotes an issue. */
  issueUpvoted: (issueId: string) =>
    logEvent('issue_upvoted', { issue_id: issueId }),

  /** Called after successful sign-in. */
  login: (method: 'email' | 'phone' | 'google') =>
    logEvent('login', { method }),

  /** Called after successful account creation. */
  signUp: (method: 'email' | 'phone') =>
    logEvent('sign_up', { method }),

  /** Called when Gemini analysis completes (or falls back). */
  analysisComplete: (category: string, confidence: number, usedGemini: boolean) =>
    logEvent('analysis_complete', { category, confidence, used_gemini: usedGemini }),

  /** Called when a map is shown (Google vs SVG fallback). */
  mapViewed: (mapType: 'google' | 'svg_fallback') =>
    logEvent('map_viewed', { map_type: mapType }),

  /** Called when FCM permission is granted. */
  fcmPermissionGranted: () =>
    logEvent('fcm_permission_granted'),
};
