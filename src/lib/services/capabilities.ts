// Central registry for all optional Google / Firebase services.
// NEXT_PUBLIC_ vars are inlined at build time, so this works on both client and server.
// Never crashes — every check is a simple boolean.

export interface ServiceCapabilities {
  // Firebase core (requires FIREBASE_API_KEY)
  firebase: boolean;
  // Firebase Analytics (requires MEASUREMENT_ID)
  analytics: boolean;
  // Firebase Cloud Functions (requires Firebase)
  cloudFunctions: boolean;
  // Firebase Cloud Messaging push (requires VAPID key)
  fcm: boolean;

  // Google Maps JS API (one key covers all four)
  googleMaps: boolean;
  places: boolean;
  geocodingGoogle: boolean;
  directions: boolean;

  // Gemini Vision — always true client-side; server falls back to mock if key absent
  geminiVision: boolean;
}

function isSet(v: string | undefined): boolean {
  return !!v && v.trim().length > 4 && v !== 'demo' && v !== 'YOUR_API_KEY';
}

const FB_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const MAPS_KEY  = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
const MEAS_ID   = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const hasFirebase = isSet(FB_KEY);
const hasMapsKey  = isSet(MAPS_KEY);

export const capabilities: ServiceCapabilities = {
  firebase:         hasFirebase,
  analytics:        hasFirebase && isSet(MEAS_ID),
  cloudFunctions:   hasFirebase,
  fcm:              hasFirebase && isSet(VAPID_KEY),

  googleMaps:       hasMapsKey,
  places:           hasMapsKey,
  geocodingGoogle:  hasMapsKey,
  directions:       hasMapsKey,

  geminiVision:     true,
};

export function hasCapability(cap: keyof ServiceCapabilities): boolean {
  return capabilities[cap];
}

/** Returns a human-readable summary of enabled services (useful for debug UIs). */
export function getCapabilitySummary(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(capabilities).map(([k, v]) => [k, v ? 'enabled' : 'disabled'])
  );
}
