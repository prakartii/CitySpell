// Google Geocoding adapter.
// Primary: Google Geocoding API (if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set).
// Fallback: Nominatim (no key, always available).
// Callers never see the difference.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { loadGoogleMaps } from './mapsAdapter';
import { capabilities } from '../services/capabilities';
import type { ResolvedLocation } from '../services/geocodingService';

// ── Google Geocoding ──────────────────────────────────────────────────────────

/** Reverse geocodes via Google Geocoding API. Returns null if unavailable or on error. */
export async function reverseGeocodeGoogle(
  lat: number,
  lng: number,
): Promise<ResolvedLocation | null> {
  if (!capabilities.geocodingGoogle) return null;
  const ready = await loadGoogleMaps();
  if (!ready) return null;

  const G = (window as any).google?.maps;
  if (!G) return null;

  return new Promise((resolve) => {
    try {
      const geocoder = new G.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status !== 'OK' || !results?.[0]) { resolve(null); return; }
          resolve(parseGoogleResult(lat, lng, results[0]));
        },
      );
    } catch { resolve(null); }
  });
}

/** Forward geocodes a text query via Google. Returns null if unavailable. */
export async function forwardGeocodeGoogle(
  query: string,
): Promise<{ lat: number; lng: number; address: string } | null> {
  if (!capabilities.geocodingGoogle) return null;
  const ready = await loadGoogleMaps();
  if (!ready) return null;

  const G = (window as any).google?.maps;
  if (!G) return null;

  return new Promise((resolve) => {
    try {
      const geocoder = new G.Geocoder();
      geocoder.geocode({ address: query }, (results: any[], status: string) => {
        if (status !== 'OK' || !results?.[0]) { resolve(null); return; }
        const loc = results[0].geometry.location;
        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
          address: results[0].formatted_address,
        });
      });
    } catch { resolve(null); }
  });
}

function parseGoogleResult(lat: number, lng: number, result: any): ResolvedLocation {
  const comps: Record<string, string> = {};
  (result.address_components ?? []).forEach((c: any) => {
    c.types?.forEach((t: string) => { comps[t] = c.long_name; });
  });

  const locality =
    comps.sublocality_level_1 ?? comps.sublocality ?? comps.neighborhood ?? comps.political ?? '';
  const city = comps.locality ?? comps.administrative_area_level_2 ?? '';
  const ward = locality || city;
  const slug = ward.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const cityCode = city.slice(0, 3).toUpperCase() || 'XX';

  return {
    lat,
    lng,
    address: result.formatted_address ?? `${lat}, ${lng}`,
    wardId: `${cityCode}_${slug || 'general'}`,
    wardName: ward || 'General Ward',
  };
}

// ── Nominatim (no-key fallback) ───────────────────────────────────────────────

/** Reverse geocodes via OpenStreetMap Nominatim. Always works without an API key. */
export async function reverseGeocodeNominatim(
  lat: number,
  lng: number,
): Promise<ResolvedLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'CitySpell-App/1.0' } },
    );
    if (!res.ok) return null;

    const data: any = await res.json();
    const a = data.address ?? {};
    const locality = a.suburb ?? a.neighbourhood ?? a.city_district ?? '';
    const city = a.city ?? a.town ?? a.village ?? '';
    const ward = a.ward ?? a.suburb ?? a.city_district ?? locality;
    const road = a.road ? `${a.road}, ` : '';
    const address =
      `${road}${locality}${locality && city ? ', ' : ''}${city}`.replace(/^,\s*/, '').trim() ||
      data.display_name;

    const slug = ward.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const cityCode = city.slice(0, 3).toUpperCase() || 'XX';

    return { lat, lng, address, wardId: `${cityCode}_${slug || 'general'}`, wardName: ward || 'General Ward' };
  } catch {
    return null;
  }
}

/**
 * Best-effort reverse geocoding: Google first → Nominatim → hardcoded Bengaluru fallback.
 * Never throws.
 */
export async function reverseGeocodeBest(
  lat: number,
  lng: number,
): Promise<ResolvedLocation> {
  const google = await reverseGeocodeGoogle(lat, lng).catch(() => null);
  if (google) return google;

  const osm = await reverseGeocodeNominatim(lat, lng).catch(() => null);
  if (osm) return osm;

  return { lat, lng, address: 'Bengaluru, Karnataka', wardId: 'BLR_general', wardName: 'General Ward' };
}
