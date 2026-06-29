// Dynamic Firebase Messaging service worker.
// Served at /api/firebase-messaging-sw with Service-Worker-Allowed: / so it can control the full origin.
// Injects Firebase config from server-side env vars — no secrets (all NEXT_PUBLIC_).

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const cfg = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? '',
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? '',
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? '',
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '',
  };

  const hasConfig = !!cfg.apiKey && cfg.apiKey.length > 4;

  const sw = `
// CitySpell AI — Firebase Cloud Messaging Service Worker
// Auto-generated — do not edit directly.
// Firebase JS SDK compat v10

${hasConfig ? `
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp(${JSON.stringify(cfg)});
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function(payload) {
    const notif  = payload.notification || {};
    const title  = notif.title || 'CitySpell AI';
    const body   = notif.body  || 'You have a new update.';
    const icon   = notif.icon  || '/icons/icon-192.png';
    const data   = payload.data || {};

    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icons/badge-72.png',
      data,
      tag: data.issueId || 'cs-notification',
      requireInteraction: false,
      actions: [
        { action: 'view',    title: 'View Issue' },
        { action: 'dismiss', title: 'Dismiss'    },
      ],
    });
  });

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    var data     = event.notification.data || {};
    var action   = event.action;
    var issueId  = data.issueId;

    var url = '/citizen-dashboard';
    if (action === 'view' && issueId) {
      url = '/issues/' + issueId;
    }

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cls) {
        for (var i = 0; i < cls.length; i++) {
          if (cls[i].url.indexOf(self.location.origin) === 0 && 'focus' in cls[i]) {
            return cls[i].focus().then(function(c) { return c.navigate(url); });
          }
        }
        return clients.openWindow(url);
      })
    );
  });
} catch(e) {
  console.warn('[FCM SW] Init failed:', e.message);
}
` : `
// Firebase not configured — FCM disabled.
// Add NEXT_PUBLIC_FIREBASE_API_KEY + NEXT_PUBLIC_FCM_VAPID_KEY to enable push notifications.
console.info('[FCM SW] Firebase not configured. Push notifications disabled.');
`}
`.trim();

  return new Response(sw, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
