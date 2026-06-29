// Google Places Autocomplete + Details adapter.
// Returns empty results / null when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is absent.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { loadGoogleMaps } from './mapsAdapter';
import { capabilities } from '../services/capabilities';

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

let _autocomplete: any = null;
let _placesService: any = null;

async function autocompleteService(): Promise<any> {
  if (!capabilities.places) return null;
  const ready = await loadGoogleMaps();
  if (!ready) return null;
  if (_autocomplete) return _autocomplete;
  try {
    _autocomplete = new (window as any).google.maps.places.AutocompleteService();
    return _autocomplete;
  } catch { return null; }
}

async function placesService(): Promise<any> {
  if (!capabilities.places) return null;
  const ready = await loadGoogleMaps();
  if (!ready) return null;
  if (_placesService) return _placesService;
  try {
    const div = document.createElement('div');
    _placesService = new (window as any).google.maps.places.PlacesService(div);
    return _placesService;
  } catch { return null; }
}

/**
 * Returns autocomplete suggestions for a text query.
 * Returns [] if the Places API is unavailable.
 */
export async function getPlaceSuggestions(
  query: string,
  countryCode = 'IN',
): Promise<PlaceSuggestion[]> {
  if (!query.trim()) return [];
  const svc = await autocompleteService();
  if (!svc) return [];

  return new Promise((resolve) => {
    try {
      svc.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: countryCode },
          types: ['geocode', 'establishment'],
        },
        (predictions: any[], status: string) => {
          if (status !== 'OK' || !Array.isArray(predictions)) { resolve([]); return; }
          resolve(
            predictions.map((p: any) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting?.main_text ?? p.description,
              secondaryText: p.structured_formatting?.secondary_text ?? '',
            }))
          );
        },
      );
    } catch { resolve([]); }
  });
}

/**
 * Fetches detailed location info (lat/lng + formatted address) for a placeId.
 * Returns null if unavailable.
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const svc = await placesService();
  if (!svc) return null;

  return new Promise((resolve) => {
    try {
      svc.getDetails(
        { placeId, fields: ['name', 'formatted_address', 'geometry'] },
        (place: any, status: string) => {
          if (status !== 'OK' || !place) { resolve(null); return; }
          resolve({
            placeId,
            name: place.name ?? '',
            address: place.formatted_address ?? '',
            lat: place.geometry?.location?.lat() ?? 0,
            lng: place.geometry?.location?.lng() ?? 0,
          });
        },
      );
    } catch { resolve(null); }
  });
}
