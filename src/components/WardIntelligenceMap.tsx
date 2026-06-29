"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { IssueDoc } from "@/lib/types/collections";

// Leaflet plugins (leaflet.markercluster, leaflet.heat) are CommonJS UMD bundles
// that read window.L at execution time. ES module imports are hoisted, so we
// can't set window.L before a static `import "leaflet.markercluster"`.
// Using require() here is NOT hoisted, so window.L is already assigned first.
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).L = L;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("leaflet.markercluster");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("leaflet.heat");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type MapMode = "standard" | "cluster" | "heatmap";

interface Props {
  issues: IssueDoc[];
  selectedId: string | null;
  onSelectIssue: (id: string | null) => void;
  mapMode: MapMode;
  radiusFilter: { center: [number, number]; radiusKm: number } | null;
  drawMode: boolean;
  onMapClick: (latlng: [number, number]) => void;
}

// ─── Marker creation ──────────────────────────────────────────────────────────

const SEV_CFG = {
  critical: { color: "#FF4D4D", glow: "rgba(255,77,77,0.7)",  size: 14, pulse: true  },
  high:     { color: "#FF8C42", glow: "rgba(255,140,66,0.5)", size: 11, pulse: false },
  medium:   { color: "#FFB020", glow: "rgba(255,176,32,0.4)", size: 10, pulse: false },
  low:      { color: "#39E88C", glow: "rgba(57,232,140,0.4)", size: 9,  pulse: false },
  resolved: { color: "#4A9EFF", glow: "rgba(74,158,255,0.3)", size: 8,  pulse: false },
} as const;

function createMarkerIcon(severity: string, status: string): L.DivIcon {
  const isResolved = status === "resolved" || status === "closed" || status === "rejected";
  const key = (isResolved ? "resolved" : severity?.toLowerCase()) as keyof typeof SEV_CFG;
  const cfg = SEV_CFG[key] ?? SEV_CFG.medium;
  const wrap = cfg.size + 8;

  return L.divIcon({
    className: "",
    html: `<div style="width:${wrap}px;height:${wrap}px;display:flex;align-items:center;justify-content:center;position:relative;">
      ${cfg.pulse ? `<div class="cs-pulse" style="position:absolute;inset:0;border-radius:50%;border:1.5px solid ${cfg.color};animation:cs-pulse 1.6s ease-out infinite;"></div>
      <div class="cs-pulse" style="position:absolute;inset:3px;border-radius:50%;border:1px solid ${cfg.color};opacity:0.4;animation:cs-pulse 1.6s ease-out 0.5s infinite;"></div>` : ""}
      <div style="width:${cfg.size}px;height:${cfg.size}px;border-radius:50%;background:${cfg.color};border:1.5px solid rgba(255,255,255,0.35);box-shadow:0 0 10px ${cfg.glow},0 0 20px ${cfg.glow};position:relative;z-index:1;"></div>
    </div>`,
    iconSize: [wrap, wrap],
    iconAnchor: [wrap / 2, wrap / 2],
  });
}

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const n = cluster.getChildCount();
  const size = n > 50 ? 52 : n > 20 ? 44 : 36;
  const fontSize = n > 99 ? 10 : 12;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(0,191,255,0.1);border:1.5px solid rgba(0,191,255,0.55);display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:${fontSize}px;font-weight:bold;color:#00BFFF;box-shadow:0 0 18px rgba(0,191,255,0.25),inset 0 0 18px rgba(0,191,255,0.06);">${n > 99 ? "99+" : n}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── InvalidateSizeEffect ─────────────────────────────────────────────────────

// Leaflet reads the container dimensions at init. If the container isn't fully
// laid out yet (e.g. inside an animating panel), tiles won't fill the viewport.
// Calling invalidateSize() on the next tick forces a correct recalculation.
function InvalidateSizeEffect() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize({ animate: false }), 0);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

// ─── MapController ────────────────────────────────────────────────────────────

function MapController({ issues, mapMode, selectedId, onSelectIssue, drawMode, onMapClick, radiusFilter }: Props) {
  const map = useMap();
  const clusterRef = useRef<L.FeatureGroup | null>(null);
  const heatRef = useRef<L.Layer | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Inject animation keyframes + tile invert filter once
  useEffect(() => {
    const id = "cs-map-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes cs-pulse { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.4);opacity:0} }
      .leaflet-control-attribution { background:rgba(6,10,18,0.8)!important; color:#3A4E6A!important; font-size:9px!important; }
      .leaflet-control-attribution a { color:#3A4E6A!important; }
      .leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) brightness(0.85) contrast(0.85) saturate(0.75); }
    `;
    document.head.appendChild(s);
  }, []);

  // Cluster / marker layer
  useEffect(() => {
    if (clusterRef.current) { map.removeLayer(clusterRef.current); clusterRef.current = null; }
    if (mapMode === "heatmap") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasCluster = typeof (L as any).markerClusterGroup === "function";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const group: L.FeatureGroup = hasCluster ? (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: mapMode === "cluster" ? 80 : 50,
      disableClusteringAtZoom: mapMode === "cluster" ? undefined : 15,
      iconCreateFunction: createClusterIcon,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true,
      chunkInterval: 60,
    }) : L.featureGroup();

    issues.forEach((issue) => {
      const lat = Number(issue.location?.lat ?? 0);
      const lng = Number(issue.location?.lng ?? 0);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng], { icon: createMarkerIcon(issue.severity, issue.status) });
      marker.on("click", (e) => { L.DomEvent.stopPropagation(e); onSelectIssue(issue.id); });
      group.addLayer(marker);
    });

    group.addTo(map);
    clusterRef.current = group;

    return () => { if (clusterRef.current) { map.removeLayer(clusterRef.current); clusterRef.current = null; } };
  }, [issues, mapMode, map, onSelectIssue]);

  // Heatmap layer
  useEffect(() => {
    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; }
    if (mapMode !== "heatmap") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (L as any).heatLayer !== "function") return;

    const pts = issues.flatMap((issue) => {
      const lat = Number(issue.location?.lat ?? 0);
      const lng = Number(issue.location?.lng ?? 0);
      if (!lat || !lng) return [];
      const w = issue.severity === "critical" ? 1.0 : issue.severity === "high" ? 0.75 : issue.severity === "medium" ? 0.5 : 0.25;
      return [[lat, lng, w]] as [number, number, number][];
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heat = (L as any).heatLayer(pts, {
      radius: 38, blur: 28, maxZoom: 17, max: 1.0,
      gradient: { 0.25: "#1a4d6e", 0.5: "#FFB020", 0.75: "#FF8C42", 1.0: "#FF4D4D" },
    });
    heat.addTo(map);
    heatRef.current = heat;

    return () => { if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; } };
  }, [issues, mapMode, map]);

  // Radius circle
  useEffect(() => {
    if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; }
    if (!radiusFilter) return;

    const circle = L.circle(radiusFilter.center, {
      radius: radiusFilter.radiusKm * 1000,
      color: "#00BFFF",
      fillColor: "#00BFFF",
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: "5 4",
    });
    circle.addTo(map);
    circleRef.current = circle;
    map.fitBounds(circle.getBounds(), { padding: [50, 50] });

    return () => { if (circleRef.current) { map.removeLayer(circleRef.current); circleRef.current = null; } };
  }, [radiusFilter, map]);

  // Fly to selected issue
  useEffect(() => {
    if (!selectedId) return;
    const issue = issues.find((i) => i.id === selectedId);
    const lat = Number(issue?.location?.lat ?? 0);
    const lng = Number(issue?.location?.lng ?? 0);
    if (!lat || !lng) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 1.0, easeLinearity: 0.3 });
  }, [selectedId, issues, map]);

  useMapEvents({
    click: (e) => {
      if (drawMode) { onMapClick([e.latlng.lat, e.latlng.lng]); }
      else { onSelectIssue(null); }
    },
  });

  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function WardIntelligenceMap(props: Props) {
  const handleClick = useCallback((latlng: [number, number]) => props.onMapClick(latlng), [props]);

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#3A4E6A">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <InvalidateSizeEffect />
      <MapController {...props} onMapClick={handleClick} />
    </MapContainer>
  );
}
