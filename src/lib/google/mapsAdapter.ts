// Google Maps JavaScript API loader.
// All exports return null/false if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is absent.
// Loads the script once and caches the result.

/* eslint-disable @typescript-eslint/no-explicit-any */

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type LoadState = 'idle' | 'loading' | 'ready' | 'failed';
let _state: LoadState = 'idle';
let _promise: Promise<boolean> | null = null;

/** Lazily loads the Google Maps JS API (with Places library). Resolves to false if unavailable. */
export function loadGoogleMaps(): Promise<boolean> {
  if (!MAPS_KEY) return Promise.resolve(false);
  if (_state === 'ready') return Promise.resolve(true);
  if (_state === 'failed') return Promise.resolve(false);
  if (_promise) return _promise;

  _state = 'loading';
  _promise = new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') { _state = 'failed'; resolve(false); return; }
    if ((window as any).google?.maps) { _state = 'ready'; resolve(true); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload  = () => { _state = 'ready';  resolve(true);  };
    script.onerror = () => { _state = 'failed'; resolve(false); };
    document.head.appendChild(script);
  });
  return _promise;
}

/** Returns true synchronously if the Maps API is already loaded. */
export function isMapsLoaded(): boolean {
  return _state === 'ready' && !!(window as any).google?.maps;
}

// ── Map instance ──────────────────────────────────────────────────────────────

export type GMap     = any;
export type GMarker  = any;
export type GPolygon = any;

/** Creates a Google Map in the given container. Returns null if unavailable. */
export async function createMap(
  container: HTMLElement,
  center: { lat: number; lng: number },
  zoom = 13,
  dark = false,
): Promise<GMap | null> {
  const ready = await loadGoogleMaps();
  if (!ready) return null;
  try {
    const G = (window as any).google.maps;
    return new G.Map(container, {
      center,
      zoom,
      mapTypeId: 'roadmap',
      gestureHandling: 'cooperative',
      styles: dark ? DARK_STYLE : LIGHT_STYLE,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
  } catch { return null; }
}

/** Adds a pin marker to a map. Returns null if unavailable. */
export function addMarker(
  map: GMap,
  position: { lat: number; lng: number },
  opts: { title?: string; color?: string; label?: string } = {},
): GMarker | null {
  try {
    const G = (window as any).google?.maps;
    if (!G) return null;
    return new G.Marker({
      map,
      position,
      title: opts.title,
      label: opts.label
        ? { text: opts.label, color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        : undefined,
      icon: {
        path: G.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: opts.color ?? '#D4726A',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
  } catch { return null; }
}

/** Opens an InfoWindow attached to a marker. No-op if unavailable. */
export function openInfoWindow(map: GMap, marker: GMarker, content: string): void {
  try {
    const G = (window as any).google?.maps;
    if (!G) return;
    const iw = new G.InfoWindow({ content });
    iw.open(map, marker);
  } catch { /* ignore */ }
}

/** Draws a circle around a position. Returns null if unavailable. */
export function addCircle(
  map: GMap,
  center: { lat: number; lng: number },
  radiusMeters: number,
  color = '#7A9E6E',
): any | null {
  try {
    const G = (window as any).google?.maps;
    if (!G) return null;
    return new G.Circle({
      map, center, radius: radiusMeters,
      fillColor: color, fillOpacity: 0.08,
      strokeColor: color, strokeWeight: 1.5,
    });
  } catch { return null; }
}

// ── Map styles ────────────────────────────────────────────────────────────────

const LIGHT_STYLE: any[] = [
  { featureType: 'poi',             elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                                           stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road',            elementType: 'geometry',         stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial',   elementType: 'geometry',         stylers: [{ color: '#f5f4f1' }] },
  { featureType: 'road',            elementType: 'geometry.stroke',  stylers: [{ color: '#e4e2dc' }] },
  { featureType: 'landscape',                                         stylers: [{ color: '#f9f8f5' }] },
  { featureType: 'water',                                             stylers: [{ color: '#c5d8e8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#5a5a62' }] },
];

const DARK_STYLE: any[] = [
  { elementType: 'geometry',         stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road',            elementType: 'geometry',         stylers: [{ color: '#383838' }] },
  { featureType: 'road.highway',    elementType: 'geometry',         stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'landscape',                                         stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'water',                                             stylers: [{ color: '#0d0d0d' }] },
  { featureType: 'poi',             elementType: 'labels',           stylers: [{ visibility: 'off' }] },
];
