'use client';

import { useEffect, useRef, useState } from 'react';
import { createMap, addMarker, openInfoWindow, type GMap } from '@/lib/google/mapsAdapter';
import { capabilities } from '@/lib/services/capabilities';
import { analytics } from '@/lib/firebase/analytics';
import { MapPin } from 'lucide-react';

export interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
  color?: string;
  label?: string;
  infoContent?: string;
}

interface GoogleMapEmbedProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
  dark?: boolean;
  /** Custom fallback rendered when Google Maps is unavailable. */
  fallback?: React.ReactNode;
  /** Called once the map is successfully initialized. */
  onMapReady?: (map: GMap) => void;
}

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

export default function GoogleMapEmbed({
  center = DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  height = '320px',
  className = '',
  dark = false,
  fallback,
  onMapReady,
}: GoogleMapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GMap | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    if (!capabilities.googleMaps || !containerRef.current) {
      setStatus('failed');
      void analytics.mapViewed('svg_fallback');
      return;
    }

    let cancelled = false;

    createMap(containerRef.current, center, zoom, dark)
      .then((m) => {
        if (cancelled || !m) { setStatus('failed'); return; }
        mapRef.current = m;
        setStatus('ready');
        onMapReady?.(m);
        void analytics.mapViewed('google');

        // Add all markers
        markers.forEach((mk) => {
          const marker = addMarker(m, { lat: mk.lat, lng: mk.lng }, {
            title: mk.title, color: mk.color, label: mk.label,
          });
          if (marker && mk.infoContent) {
            try {
              (window as any).google.maps.event.addListener(marker, 'click', () => {
                openInfoWindow(m, marker, mk.infoContent!);
              });
            } catch { /* ignore */ }
          }
        });
      })
      .catch(() => { if (!cancelled) setStatus('failed'); });

    return () => { cancelled = true; };
    // Intentionally shallow — re-init only on center/zoom change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, zoom, dark]);

  // Update markers when they change without re-creating the map
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    markers.forEach((mk) => {
      addMarker(mapRef.current!, { lat: mk.lat, lng: mk.lng }, {
        title: mk.title, color: mk.color, label: mk.label,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, status]);

  if (status === 'failed') {
    if (fallback) return <>{fallback}</>;
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-[#F5F4F1] rounded-2xl border border-[#E4E2DC] ${className}`}
        style={{ height }}
      >
        <MapPin size={22} className="text-[#B0ACA4]" />
        <p className="text-xs font-medium text-[#9A9AA4]">Map unavailable</p>
        <p className="text-[10px] text-[#C0BDB6] text-center px-4">
          Add <code className="bg-[#F0EDE8] px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable Google Maps
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F4F1]">
          <div className="w-5 h-5 border-2 border-[#7A9E6E] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
