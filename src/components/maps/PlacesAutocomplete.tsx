'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getPlaceSuggestions, getPlaceDetails, type PlaceSuggestion } from '@/lib/google/placesAdapter';
import { capabilities } from '@/lib/services/capabilities';
import { MapPin, Search, X, Loader2 } from 'lucide-react';

export interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
}

interface PlacesAutocompleteProps {
  value?: string;
  onSelect: (place: SelectedPlace) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  countryCode?: string;
  disabled?: boolean;
}

export default function PlacesAutocomplete({
  value = '',
  onSelect,
  placeholder = 'Search location…',
  className = '',
  inputClassName = '',
  countryCode = 'IN',
  disabled = false,
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAvailable = capabilities.places;

  const search = useCallback(async (q: string) => {
    if (!q.trim() || !isAvailable) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const results = await getPlaceSuggestions(q, countryCode);
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [isAvailable, countryCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.description);
    setOpen(false);
    setSuggestions([]);
    const details = await getPlaceDetails(s.placeId);
    if (details) {
      onSelect({ address: details.address, lat: details.lat, lng: details.lng });
    } else {
      onSelect({ address: s.description, lat: 0, lng: 0 });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  // Click-outside closes the dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9AA4] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-9 pr-8 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A9E6E]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${inputClassName}`}
        />
        {loading ? (
          <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A9E6E] animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9AA4] hover:text-[#5A5A62] transition-colors"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E2DC] rounded-xl shadow-lg z-[100] overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              onClick={() => handleSelect(s)}
              className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-[#F5F4F1] text-left transition-colors border-b border-[#F8F7F4] last:border-0"
            >
              <MapPin size={13} className="text-[#9A9AA4] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1A1A1C] leading-tight truncate">{s.mainText}</p>
                {s.secondaryText && (
                  <p className="text-[11px] text-[#9A9AA4] mt-0.5 truncate">{s.secondaryText}</p>
                )}
              </div>
            </button>
          ))}
          <div className="px-3 py-2 flex items-center justify-end gap-1 bg-[#FAFAF8]">
            <span className="text-[9px] text-[#C0BDB6]">Powered by</span>
            <span className="text-[9px] font-semibold text-[#4285F4]">Google</span>
          </div>
        </div>
      )}

      {/* Graceful degradation notice */}
      {!isAvailable && (
        <p className="flex items-center gap-1 text-[10px] text-[#B0ACA4] mt-1.5">
          <MapPin size={9} />
          Location search unavailable — GPS will be used automatically
        </p>
      )}
    </div>
  );
}
