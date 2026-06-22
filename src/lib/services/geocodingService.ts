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

/** Reverse-geocodes coordinates via OpenStreetMap Nominatim (no key required). */
export async function reverseGeocode(lat: number, lng: number): Promise<ResolvedLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'CitySpell-App/1.0' },
  });

  if (!res.ok) throw new Error('Reverse geocode failed');

  const data = await res.json() as {
    display_name: string;
    address: {
      road?: string;
      suburb?: string;
      city_district?: string;
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      postcode?: string;
      ward?: string;
      neighbourhood?: string;
    };
  };

  const a = data.address;
  const locality = a.suburb ?? a.neighbourhood ?? a.city_district ?? '';
  const city = a.city ?? a.town ?? a.village ?? '';
  const road = a.road ? `${a.road}, ` : '';
  const ward = a.ward ?? a.suburb ?? a.city_district ?? locality;
  const address = `${road}${locality}${locality && city ? ', ' : ''}${city}`.replace(/^,\s*/, '').trim() || data.display_name;

  // Derive a stable wardId from postcode + locality slug
  const slug = ward.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const cityCode = city.toLowerCase().slice(0, 3).toUpperCase();
  const wardId = `${cityCode || 'XX'}_${slug || 'general'}`;

  return { lat, lng, address, wardId, wardName: ward || 'General Ward' };
}
