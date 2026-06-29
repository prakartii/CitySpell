'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from '@/lib/firebase/analytics';
import { capabilities } from '@/lib/services/capabilities';

/**
 * Lightweight component that tracks page views via Firebase Analytics.
 * Renders nothing — purely side-effect. Safe to mount at layout level.
 * No-op if analytics is not configured.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!capabilities.analytics) return;
    void logPageView(pathname);
  }, [pathname]);

  return null;
}
