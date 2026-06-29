// Google Directions API adapter.
// Returns null when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is absent.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { loadGoogleMaps } from './mapsAdapter';
import { capabilities } from '../services/capabilities';
import type { GMap } from './mapsAdapter';

export interface DirectionsResult {
  distance: string;             // e.g. "2.3 km"
  duration: string;             // e.g. "8 mins"
  steps: string[];              // stripped HTML turn-by-turn
  polyline: { lat: number; lng: number }[];
  rawResult: any;
}

export type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

/**
 * Gets directions between two points.
 * Returns null if the Directions API is unavailable or the route fails.
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: TravelMode = 'DRIVING',
): Promise<DirectionsResult | null> {
  if (!capabilities.directions) return null;
  const ready = await loadGoogleMaps();
  if (!ready) return null;

  const G = (window as any).google?.maps;
  if (!G) return null;

  return new Promise((resolve) => {
    try {
      const service = new G.DirectionsService();
      service.route(
        { origin, destination, travelMode: G.TravelMode[mode] },
        (result: any, status: string) => {
          if (status !== 'OK' || !result?.routes?.[0]) { resolve(null); return; }

          const leg = result.routes[0].legs?.[0];
          if (!leg) { resolve(null); return; }

          const steps: string[] = (leg.steps ?? []).map(
            (s: any) => s.instructions?.replace(/<[^>]+>/g, '') ?? '',
          );

          const polyline: { lat: number; lng: number }[] = (
            result.routes[0].overview_path ?? []
          ).map((p: any) => ({ lat: p.lat(), lng: p.lng() }));

          resolve({
            distance: leg.distance?.text ?? '',
            duration: leg.duration?.text ?? '',
            steps,
            polyline,
            rawResult: result,
          });
        },
      );
    } catch { resolve(null); }
  });
}

/**
 * Renders a directions polyline on a Google Map.
 * No-op if map or result is unavailable.
 */
export function renderDirectionsPolyline(
  map: GMap,
  result: DirectionsResult,
  color = '#7A9E6E',
): any | null {
  try {
    const G = (window as any).google?.maps;
    if (!G || !result.polyline.length) return null;
    return new G.Polyline({
      path: result.polyline,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map,
    });
  } catch { return null; }
}

/**
 * Returns a Google Maps directions URL (always works — no API key required).
 * Useful as a fallback link when Directions API is unavailable.
 */
export function getDirectionsURL(
  destination: { lat: number; lng: number },
  label = '',
): string {
  const dest = encodeURIComponent(label || `${destination.lat},${destination.lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
