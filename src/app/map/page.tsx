"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  IndianRupee,
  Users,
  Building2,
  Camera,
  Filter,
  Search,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";

type IssueMarker = {
  id: number;
  cx: number;
  cy: number;
  type: string;
  location: string;
  ward: string;
  severity: "critical" | "medium" | "resolved";
  dept: string;
  economic: string;
  affectedCitizens: number;
  riskScore: number;
  time: string;
  status: string;
};

const markers: IssueMarker[] = [
  { id: 1, cx: 100, cy: 90, type: "Road Pothole", location: "MG Road, Indiranagar", ward: "Ward 14", severity: "critical", dept: "PWD", economic: "₹52K/day", affectedCitizens: 3200, riskScore: 91, time: "2h ago", status: "In Progress" },
  { id: 2, cx: 220, cy: 160, type: "Waterlogging", location: "HSR Layout 5th Sector", ward: "Ward 21", severity: "critical", dept: "BBMP", economic: "₹38K/day", affectedCitizens: 2100, riskScore: 84, time: "3h ago", status: "Assigned" },
  { id: 3, cx: 340, cy: 100, type: "Bridge Crack", location: "Whitefield Main Road", ward: "Ward 35", severity: "critical", dept: "BBMP-E", economic: "₹78K/day", affectedCitizens: 5000, riskScore: 97, time: "6h ago", status: "Pending" },
  { id: 4, cx: 160, cy: 260, type: "Broken Streetlight", location: "Koramangala 6th Block", ward: "Ward 22", severity: "medium", dept: "BESCOM", economic: "₹12K/day", affectedCitizens: 800, riskScore: 58, time: "8h ago", status: "Assigned" },
  { id: 5, cx: 80, cy: 200, type: "Garbage Dump", location: "Shivajinagar Bus Stand", ward: "Ward 7", severity: "medium", dept: "BBMP-S", economic: "₹9K/day", affectedCitizens: 600, riskScore: 52, time: "12h ago", status: "In Progress" },
  { id: 6, cx: 300, cy: 220, type: "Sewage Leak", location: "Bellandur Lake Road", ward: "Ward 31", severity: "medium", dept: "BWSSB", economic: "₹22K/day", affectedCitizens: 1400, riskScore: 73, time: "5h ago", status: "Assigned" },
  { id: 7, cx: 140, cy: 340, type: "Road Pothole", location: "JP Nagar 3rd Phase", ward: "Ward 42", severity: "resolved", dept: "PWD", economic: "₹18K/day", affectedCitizens: 1100, riskScore: 0, time: "1d ago", status: "Resolved" },
  { id: 8, cx: 260, cy: 310, type: "Tree Fall", location: "Jayanagar 4th Block", ward: "Ward 39", severity: "resolved", dept: "BBMP-H", economic: "₹8K/day", affectedCitizens: 400, riskScore: 0, time: "2d ago", status: "Resolved" },
  { id: 9, cx: 380, cy: 260, type: "Power Outage", location: "Electronic City Phase 1", ward: "Ward 56", severity: "resolved", dept: "BESCOM", economic: "₹45K/day", affectedCitizens: 8000, riskScore: 0, time: "3d ago", status: "Resolved" },
  { id: 10, cx: 50, cy: 310, type: "Water Main Break", location: "Rajajinagar 2nd Block", ward: "Ward 9", severity: "medium", dept: "BWSSB", economic: "₹31K/day", affectedCitizens: 2200, riskScore: 76, time: "4h ago", status: "Pending" },
  { id: 11, cx: 430, cy: 150, type: "Signal Failure", location: "Marathahalli Bridge", ward: "Ward 48", severity: "critical", dept: "BBMP-T", economic: "₹29K/day", affectedCitizens: 4500, riskScore: 88, time: "1h ago", status: "Pending" },
];

const wardZones = [
  { x: 20, y: 20, w: 180, h: 140, ward: "Ward 14", score: 78, color: "#7A9E6E" },
  { x: 220, y: 20, w: 160, h: 130, ward: "Ward 35", score: 42, color: "#D4726A" },
  { x: 20, y: 180, w: 140, h: 160, ward: "Ward 9", score: 64, color: "#C8A87A" },
  { x: 180, y: 160, w: 160, h: 170, ward: "Ward 22", score: 71, color: "#C8A87A" },
  { x: 360, y: 20, w: 120, h: 380, ward: "Ward 48", score: 39, color: "#D4726A" },
  { x: 20, y: 360, w: 340, h: 120, ward: "Ward 42", score: 85, color: "#7A9E6E" },
];

function severityColor(s: IssueMarker["severity"]) {
  return s === "critical" ? "#D4726A" : s === "medium" ? "#C8A87A" : "#7A9E6E";
}

function DetailCard({ marker, onClose }: { marker: IssueMarker; onClose: () => void }) {
  const color = severityColor(marker.severity);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.2 }}
      className="glass rounded-2xl p-5 w-72 shadow-xl shadow-black/12 border border-white/80"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <AlertTriangle size={14} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1C] leading-tight">{marker.type}</p>
            <p className="text-[10px] text-[#9A9AA4]">{marker.ward}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#F0EDE8] transition-all text-[#9A9AA4] hover:text-[#5A5A62]"
        >
          <X size={13} />
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 mb-4 text-[11px] text-[#5A5A62]">
        <MapPin size={11} className="text-[#9A9AA4] flex-shrink-0" />
        <span className="truncate">{marker.location}</span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: `${color}18`, color }}
        >
          {marker.status}
        </span>
        <span className="text-[10px] text-[#9A9AA4]">{marker.time}</span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: IndianRupee, label: "Economic Loss", value: marker.economic, color: "#C8A87A" },
          { icon: Users, label: "Affected", value: `${(marker.affectedCitizens / 1000).toFixed(1)}K`, color: "#6A88AA" },
          { icon: Zap, label: "Risk Score", value: marker.severity === "resolved" ? "—" : `${marker.riskScore}`, color: marker.severity === "resolved" ? "#7A9E6E" : color },
          { icon: Building2, label: "Department", value: marker.dept, color: "#9A9C5E" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-[#F8F7F4] rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Icon size={10} style={{ color: m.color }} />
                <span className="text-[9px] text-[#9A9AA4] font-medium uppercase tracking-wide">{m.label}</span>
              </div>
              <p className="text-sm font-bold text-[#1A1A1C]">{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {marker.severity !== "resolved" && (
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1A1A1C] text-white text-xs font-semibold hover:bg-[#2C2C2E] transition-all">
          <Camera size={12} />
          Report Update
          <ChevronRight size={12} />
        </button>
      )}
    </motion.div>
  );
}

function WardMap({ onSelectMarker }: { onSelectMarker: (m: IssueMarker) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const cityBlocks = [
    { x: 30, y: 30, w: 60, h: 50 }, { x: 110, y: 30, w: 80, h: 35 },
    { x: 230, y: 30, w: 50, h: 70 }, { x: 300, y: 30, w: 70, h: 50 },
    { x: 30, y: 100, w: 50, h: 70 }, { x: 100, y: 90, w: 100, h: 55 },
    { x: 230, y: 120, w: 60, h: 60 }, { x: 310, y: 100, w: 60, h: 80 },
    { x: 390, y: 30, w: 80, h: 60 }, { x: 390, y: 110, w: 80, h: 90 },
    { x: 30, y: 190, w: 80, h: 80 }, { x: 130, y: 170, w: 70, h: 70 },
    { x: 220, y: 200, w: 80, h: 60 }, { x: 320, y: 200, w: 60, h: 70 },
    { x: 390, y: 220, w: 80, h: 70 }, { x: 30, y: 290, w: 120, h: 80 },
    { x: 170, y: 270, w: 80, h: 90 }, { x: 270, y: 290, w: 100, h: 70 },
    { x: 390, y: 310, w: 80, h: 90 }, { x: 30, y: 380, w: 200, h: 90 },
    { x: 250, y: 380, w: 150, h: 90 }, { x: 30, y: 480, w: 440, h: 40 },
  ];

  return (
    <svg viewBox="0 0 480 530" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="markerGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.12)" />
        </filter>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="480" height="530" fill="#FAF9F6" />

      {/* Grid */}
      {Array.from({ length: 13 }).map((_, i) => (
        <g key={i}>
          <line x1={i * 40} y1="0" x2={i * 40} y2="530" stroke="#EDEAE4" strokeWidth="0.5" />
          <line x1="0" y1={i * 40} x2="480" y2={i * 40} stroke="#EDEAE4" strokeWidth="0.5" />
        </g>
      ))}

      {/* Ward zones */}
      {wardZones.map((z, i) => (
        <rect
          key={i}
          x={z.x}
          y={z.y}
          width={z.w}
          height={z.h}
          rx="4"
          fill={z.color}
          opacity="0.06"
          stroke={z.color}
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="4 4"
        />
      ))}

      {/* Ward labels */}
      {wardZones.map((z, i) => (
        <text
          key={`label-${i}`}
          x={z.x + z.w / 2}
          y={z.y + 14}
          textAnchor="middle"
          fontSize="7"
          fill={z.color}
          opacity="0.7"
          fontWeight="600"
          fontFamily="system-ui"
        >
          {z.ward}
        </text>
      ))}

      {/* City blocks */}
      {cityBlocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="4"
          fill="#EDE9E0"
          stroke="#E0DCD4"
          strokeWidth="0.5"
        />
      ))}

      {/* Main roads */}
      <rect x="200" y="0" width="22" height="530" fill="#FAF9F6" />
      <rect x="0" y="200" width="480" height="22" fill="#FAF9F6" />
      <rect x="0" y="380" width="480" height="14" fill="#FAF9F6" />
      <rect x="380" y="0" width="14" height="530" fill="#FAF9F6" />

      {/* Markers */}
      {markers.map((m) => {
        const color = severityColor(m.severity);
        const isHovered = hovered === m.id;
        return (
          <g
            key={m.id}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectMarker(m)}
          >
            {/* Pulse ring for critical */}
            {m.severity === "critical" && (
              <circle cx={m.cx} cy={m.cy} r={isHovered ? 14 : 10} fill={color} opacity="0.12" />
            )}
            {/* Main dot */}
            <circle
              cx={m.cx}
              cy={m.cy}
              r={isHovered ? 9 : 7}
              fill={color}
              filter={isHovered ? "url(#markerGlow)" : undefined}
              style={{ transition: "r 0.15s ease" }}
            />
            <circle cx={m.cx} cy={m.cy} r={isHovered ? 4 : 3} fill="white" opacity="0.6" />

            {/* Hover label */}
            {isHovered && (
              <g filter="url(#shadow)">
                <rect
                  x={m.cx - 50}
                  y={m.cy - 28}
                  width="100"
                  height="18"
                  rx="5"
                  fill="white"
                />
                <text
                  x={m.cx}
                  y={m.cy - 16}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#1A1A1C"
                  fontWeight="600"
                  fontFamily="system-ui"
                >
                  {m.type}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<IssueMarker | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "medium" | "resolved">("all");
  const [search, setSearch] = useState("");

  const filteredMarkers = markers.filter((m) => {
    const matchFilter = filter === "all" || m.severity === filter;
    const matchSearch = !search || m.type.toLowerCase().includes(search.toLowerCase()) || m.location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    critical: markers.filter((m) => m.severity === "critical").length,
    medium: markers.filter((m) => m.severity === "medium").length,
    resolved: markers.filter((m) => m.severity === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <Navbar />

      <div className="flex-1 pt-20 flex flex-col">
        {/* Top controls */}
        <div className="px-6 py-4 bg-white border-b border-[#E4E2DC] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#7A9E6E]" />
            <h1 className="text-sm font-semibold text-[#1A1A1C]">Ward Intelligence Map</h1>
            <span className="text-[10px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-0.5 rounded-full">Bengaluru</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-xs text-[#1A1A1C] placeholder-[#B0ACA4] focus:outline-none focus:ring-2 focus:ring-[#7A9E6E]/20 focus:border-[#7A9E6E] transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-[#9A9AA4]" />
            {(["all", "critical", "medium", "resolved"] as const).map((f) => {
              const color = f === "critical" ? "#D4726A" : f === "medium" ? "#C8A87A" : f === "resolved" ? "#7A9E6E" : "#5A5A62";
              const bg = f === "critical" ? "#FAECEA" : f === "medium" ? "#FAF0E0" : f === "resolved" ? "#EAF2E6" : "";
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filter === f
                      ? "shadow-sm"
                      : "hover:bg-[#F5F4F1] text-[#9A9AA4]"
                  }`}
                  style={filter === f ? { background: bg || "#F5F4F1", color } : {}}
                >
                  {f !== "all" && (
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  )}
                  <span className="capitalize">{f}</span>
                  {f !== "all" && (
                    <span className="text-[9px] opacity-70">
                      ({f === "critical" ? counts.critical : f === "medium" ? counts.medium : counts.resolved})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-[10px] text-[#7A9E6E] font-medium">LIVE</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F4F1] text-xs text-[#5A5A62] hover:bg-[#EDE9E0] transition-all">
              <Layers size={12} />
              Layers
            </button>
            <Link
              href="/report"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1A1C] text-white text-xs font-medium hover:bg-[#2C2C2E] transition-all"
            >
              <Camera size={12} />
              Report Issue
            </Link>
          </div>
        </div>

        {/* Map area + sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative bg-[#F5F4F1] overflow-hidden">
            <div className="w-full h-full p-4">
              <WardMap onSelectMarker={setSelectedMarker} />
            </div>

            {/* Detail card overlay */}
            <AnimatePresence>
              {selectedMarker && (
                <div className="absolute bottom-6 left-6 z-20">
                  <DetailCard marker={selectedMarker} onClose={() => setSelectedMarker(null)} />
                </div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute top-6 right-6 glass rounded-2xl px-4 py-3 flex flex-col gap-2.5 z-10">
              <span className="text-[9px] font-semibold text-[#9A9AA4] uppercase tracking-wider">Legend</span>
              {[
                { color: "#D4726A", label: "Critical", count: counts.critical },
                { color: "#C8A87A", label: "Medium", count: counts.medium },
                { color: "#7A9E6E", label: "Resolved", count: counts.resolved },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-[10px] text-[#5A5A62] font-medium">{l.label}</span>
                  <span className="ml-auto text-[10px] font-bold" style={{ color: l.color }}>{l.count}</span>
                </div>
              ))}
            </div>

            {/* Ward health scores overlay */}
            <div className="absolute bottom-6 right-6 glass rounded-2xl p-3 z-10 max-w-[160px]">
              <p className="text-[9px] font-semibold text-[#9A9AA4] uppercase tracking-wider mb-2">Ward Health</p>
              {wardZones.map((z) => (
                <div key={z.ward} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] text-[#5A5A62] flex-1 truncate">{z.ward}</span>
                  <div
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${z.color}18`,
                      color: z.color,
                    }}
                  >
                    {z.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues sidebar */}
          <div className="w-72 bg-white border-l border-[#E4E2DC] flex flex-col overflow-hidden hidden lg:flex">
            <div className="px-4 py-3 border-b border-[#E4E2DC]">
              <span className="text-xs font-semibold text-[#1A1A1C]">Active Issues</span>
              <span className="ml-2 text-[10px] text-[#9A9AA4]">{filteredMarkers.length} shown</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#F5F4F1]">
              {filteredMarkers.map((m) => {
                const color = severityColor(m.severity);
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setSelectedMarker(m)}
                    whileHover={{ backgroundColor: "#FAFAF8" }}
                    className={`w-full px-4 py-3.5 flex items-start gap-3 text-left transition-colors ${
                      selectedMarker?.id === m.id ? "bg-[#F8FAF6]" : ""
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${color}18` }}
                    >
                      <AlertTriangle size={12} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1A1C] truncate">{m.type}</p>
                      <p className="text-[10px] text-[#9A9AA4] truncate">{m.location}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}18`, color }}
                        >
                          {m.ward}
                        </span>
                        <span className="text-[9px] text-[#B0ACA4]">{m.time}</span>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-[#D0CCC8] flex-shrink-0 mt-1" />
                  </motion.button>
                );
              })}
            </div>

            {/* Bottom summary */}
            <div className="p-4 border-t border-[#E4E2DC]">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Critical", value: counts.critical, color: "#D4726A" },
                  { label: "Open", value: counts.medium, color: "#C8A87A" },
                  { label: "Done", value: counts.resolved, color: "#7A9E6E" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] text-[#9A9AA4]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
