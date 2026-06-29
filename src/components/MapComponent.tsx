"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Fix default leaflet marker icon references to prevent 404s
useEffect; // dummy references to keep imports

function formatINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${Math.round(amount / 1_000)}K`;
  return `₹${amount}`;
}

interface Issue {
  id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  imageUrl?: string;
  images?: string[];
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
    wardName?: string;
  };
  locationAddress?: string;
  economicImpact?: {
    estimatedLossINR?: number;
  };
}

interface MapComponentProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string | null) => void;
}

// Custom HTML Markers matching CitySpell severity theme
const createCustomIcon = (severity: string, status: string) => {
  const isResolved = status?.toLowerCase() === "resolved" || status?.toLowerCase() === "closed";
  
  let color = "#7A9E6E"; // Green for resolved
  if (!isResolved) {
    if (severity?.toLowerCase() === "critical") {
      color = "#D4726A"; // Red for critical
    } else if (severity?.toLowerCase() === "high" || severity?.toLowerCase() === "medium") {
      color = "#C8A87A"; // Orange for high/medium
    } else {
      color = "#5E9E9E"; // Teal for low
    }
  }

  const isCritical = severity?.toLowerCase() === "critical" && !isResolved;

  const html = `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      ${isCritical ? `
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.4;
          animation: leaflet-ping 1.6s ease-in-out infinite;
        "></div>
      ` : ""}
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transition: transform 0.15s ease;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: "custom-leaflet-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const getCategoryEmoji = (cat: string) => {
  switch (cat?.toLowerCase()) {
    case "pothole": return "🕳️";
    case "water":
    case "waterlogging": 
      return "💧";
    case "streetlight":
    case "light": 
      return "💡";
    case "garbage": return "🗑️";
    case "sewage": return "🌊";
    case "road": return "🛣️";
    case "park": return "🌳";
    default: return "⚠️";
  }
};

const getStatusStyle = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "resolved" || normalized === "closed") {
    return { color: "#7A9E6E", bgColor: "#EAF2E6" };
  }
  if (normalized === "in_progress" || normalized === "in progress") {
    return { color: "#C8A87A", bgColor: "#FAF0E0" };
  }
  if (normalized === "assigned") {
    return { color: "#6A88AA", bgColor: "#E8EFF6" };
  }
  return { color: "#5E9E9E", bgColor: "#E4F2F2" };
};

export default function MapComponent({ issues, selectedIssueId, onSelectIssue }: MapComponentProps) {
  // Inject keyframe animation for the critical pulse
  useEffect(() => {
    const styleId = "leaflet-marker-ping-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes leaflet-ping {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const center: [number, number] = [12.9716, 77.5946]; // Bengaluru default center

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: "100%", width: "100%", borderRadius: "24px" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => {
          const lat = Number(issue.location?.lat ?? 12.9716);
          const lng = Number(issue.location?.lng ?? 77.5946);
          
          // Basic coordinate sanity check
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

          const position: [number, number] = [lat, lng];
          const customIcon = createCustomIcon(issue.severity, issue.status);
          const emoji = getCategoryEmoji(issue.category);
          const statusStyle = getStatusStyle(issue.status);
          const imageToShow = issue.imageUrl || issue.images?.[0];

          return (
            <Marker 
              key={issue.id} 
              position={position} 
              icon={customIcon}
              eventHandlers={{
                click: () => onSelectIssue(issue.id),
                popupclose: () => onSelectIssue(null)
              }}
            >
              <Popup className="cityspell-map-popup">
                <div style={{ width: "220px", display: "flex", flexDirection: "column", gap: "8px", fontFamily: "system-ui" }}>
                  {/* Photo Preview */}
                  {imageToShow && (
                    <div style={{ width: "100%", height: "90px", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={imageToShow} 
                        alt={issue.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}

                  {/* Header details */}
                  <div>
                    <h4 style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#1A1A1C", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>{emoji}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{issue.title}</span>
                    </h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#9A9AA4" }}>
                      {issue.location?.address || issue.locationAddress || "Unknown location"}
                    </p>
                  </div>

                  {/* Status row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      color: statusStyle.color,
                      backgroundColor: statusStyle.bgColor,
                      textTransform: "capitalize"
                    }}>
                      {issue.status}
                    </span>
                    {issue.economicImpact?.estimatedLossINR && (
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#C8A87A" }}>
                        Loss: {formatINR(issue.economicImpact.estimatedLossINR)}/day
                      </span>
                    )}
                  </div>

                  {/* CTA link */}
                  <Link 
                    href={`/issues/${issue.id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "#1A1A1C",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "6px 0",
                      borderRadius: "8px",
                      textDecoration: "none",
                      marginTop: "2px",
                      transition: "background 0.2s"
                    }}
                  >
                    View Details & Discuss
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
