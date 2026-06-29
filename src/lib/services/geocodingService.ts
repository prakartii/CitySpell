export interface GpsCoords {
  lat: number;
  lng: number;
}

export interface ResolvedLocation {
  lat: number;
  lng: number;
  address: string;
  wardId: string;
  wardName: string;
}

/** Promisified wrapper around navigator.geolocation with a 10-second timeout. */
export function captureGPS(): Promise<GpsCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/**
 * Reverse geocodes coordinates.
 * Uses Google Geocoding API when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set,
 * falls back to OpenStreetMap Nominatim (no key required), then to a hardcoded fallback.
 * Never throws.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ResolvedLocation> {
  // Dynamic import keeps the geocoding adapter out of the SSR bundle
  try {
    const { reverseGeocodeBest } = await import('../google/geocodingAdapter');
    return await reverseGeocodeBest(lat, lng);
  } catch {
    return { lat, lng, address: 'Bengaluru, Karnataka', wardId: 'BLR_general', wardName: 'General Ward' };
  }
}
