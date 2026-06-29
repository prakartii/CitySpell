// Firebase Cloud Functions callable adapter.
// Wraps httpsCallable — returns null if Firebase is unavailable (DEMO_MODE or no key).
// Never throws to callers.

import { capabilities } from '../services/capabilities';

/** Calls a Cloud Function by name. Returns null if unavailable or on error. */
export async function callCloudFunction<I = unknown, O = unknown>(
  name: string,
  data?: I,
): Promise<O | null> {
  if (!capabilities.cloudFunctions) return null;
  try {
    const [{ httpsCallable }, { functions }] = await Promise.all([
      import('firebase/functions'),
      import('./config'),
    ]);
    const fn = httpsCallable<I, O>(functions, name);
    const result = await fn(data as I);
    return result.data;
  } catch (err) {
    console.warn(`[cloudFunctions] '${name}' failed:`, err);
    return null;
  }
}

// ── Typed wrappers for known Cloud Functions ──────────────────────────────────

/** Triggers AI ward health recalculation for a given ward. */
export function recalculateWardHealth(wardId: string): Promise<{ score: number } | null> {
  return callCloudFunction<{ wardId: string }, { score: number }>('recalculateWardHealth', { wardId });
}

/** Requests AI-optimized department assignment for an issue. */
export function optimizeDeptAssignment(issueId: string): Promise<{ dept: string } | null> {
  return callCloudFunction<{ issueId: string }, { dept: string }>('optimizeDeptAssignment', { issueId });
}

/** Sends a push notification to a user via Cloud Function (server-side FCM). */
export async function sendServerNotification(params: {
  userId: string;
  title: string;
  body: string;
  issueId?: string;
  data?: Record<string, string>;
}): Promise<boolean> {
  const result = await callCloudFunction<typeof params, { success: boolean }>(
    'sendPushNotification',
    params,
  );
  return result?.success ?? false;
}

/** Triggers economic impact recalculation for a ward. */
export function recalculateEconomicImpact(wardId: string): Promise<{ totalLossINR: number } | null> {
  return callCloudFunction<{ wardId: string }, { totalLossINR: number }>(
    'recalculateEconomicImpact',
    { wardId },
  );
}

/** Generates an AI summary report for a ward. */
export function generateWardReport(wardId: string): Promise<{ reportId: string } | null> {
  return callCloudFunction<{ wardId: string }, { reportId: string }>('generateWardReport', { wardId });
}
