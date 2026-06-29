"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAllIssues } from "@/lib/hooks/useIssues";
import { useAuthContext } from "@/lib/context/AuthContext";
import {
  Search, X, MapPin, ArrowRight, Layers, Activity, ArrowLeft,
  Camera, ChevronLeft, ChevronRight, Sliders, SlidersHorizontal,
  AlertCircle, CheckCircle2, Clock, IndianRupee, Circle, Crosshair,
  Trash2, Filter,
} from "lucide-react";
import type { IssueDoc } from "@/lib/types/collections";
import type { MapMode } from "@/components/WardIntelligenceMap";

// ─── Lazy map import (no SSR) ─────────────────────────────────────────────────

const WardIntelligenceMap = dynamic(() => import("@/components/WardIntelligenceMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center gap-3" style={{ background: "#060A12" }}>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00BFFF" }} />
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#3A4E6A", letterSpacing: "0.2em" }}>
        INITIALIZING INTELLIGENCE MAP
      </span>
    </div>
  ),
});

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: "#060A12", panel: "#090C14", card: "#0D1220",
  border: "#1A2640", borderDim: "#0F1925",
  accent: "#00BFFF", accentBg: "rgba(0,191,255,0.1)",
  green: "#39E88C", red: "#FF4D4D", orange: "#FF8C42", amber: "#FFB020",
  text: "#E2EBF6", mid: "#6B82A0", dim: "#3A4E6A",
};

const SEV = {
  critical: { color: C.red,    label: "CRITICAL" },
  high:     { color: C.orange, label: "HIGH"     },
  medium:   { color: C.amber,  label: "MEDIUM"   },
  low:      { color: C.green,  label: "LOW"       },
} as const;

const STATUS_LABELS: Record<string, string> = {
  open: "OPEN", assigned: "ASSIGNED", in_progress: "IN PROGRESS",
  resolved: "RESOLVED", closed: "CLOSED", rejected: "REJECTED",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${Math.round(n / 1e3)}K`;
  return `₹${n}`;
}

function relTime(ts: IssueDoc["reportedAt"] | undefined): string {
  if (!ts) return "—";
  const d = typeof (ts as { toDate?: () => Date }).toDate === "function"
    ? (ts as { toDate: () => Date }).toDate()
    : new Date(ts as unknown as string);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLon = (b[1] - a[1]) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function isoLike(ts: IssueDoc["reportedAt"] | undefined): number {
  if (!ts) return 0;
  const d = typeof (ts as { toDate?: () => Date }).toDate === "function"
    ? (ts as { toDate: () => Date }).toDate()
    : new Date(ts as unknown as string);
  return d.getTime();
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({ active, onClick, label, accent = C.accent, count }: {
  active: boolean; onClick: () => void; label: string; accent?: string; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded transition-all"
      style={{
        border: `1px solid ${active ? accent : C.border}`,
        background: active ? `${accent}18` : "transparent",
        color: active ? accent : C.dim,
        fontFamily: "monospace",
        fontSize: 9,
        fontWeight: "bold",
        letterSpacing: "0.1em",
      }}
    >
      {active && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />}
      {label}
      {count !== undefined && (
        <span style={{ color: active ? accent : C.borderDim, opacity: active ? 1 : 0.5 }}>({count})</span>
      )}
    </button>
  );
}

// ─── Issue Intel Card ─────────────────────────────────────────────────────────

function IssueIntelCard({ issue, onClose }: { issue: IssueDoc; onClose: () => void }) {
  const router = useRouter();
  const img = issue.imageUrl || issue.images?.[0];
  const sevCfg = SEV[issue.severity as keyof typeof SEV] ?? SEV.medium;
  const isActive = !["resolved", "closed", "rejected"].includes(issue.status ?? "");
  const cost = issue.economicImpact?.estimatedLossINR || issue.aiAnalysis?.estimatedCost || 0;
  const confidence = Math.round((issue.aiAnalysis?.confidence ?? 0.8) * 100);
  const priority = (issue.aiAnalysis?.priority ?? 5) * 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-3 top-3 bottom-3 z-20 flex flex-col"
      style={{ width: 268, pointerEvents: "auto" }}
    >
      <div className="flex-1 overflow-y-auto rounded-xl border shadow-2xl" style={{ background: C.card, borderColor: "#1E3050", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
        {/* Photo */}
        <div className="relative h-36 flex-shrink-0" style={{ background: "#050810" }}>
          {img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={img} alt={issue.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera size={28} style={{ color: C.borderDim }} />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(13,18,32,0.95))" }} />

          {/* Badges */}
          {isActive && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ background: "rgba(255,77,77,0.18)", border: "1px solid rgba(255,77,77,0.4)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.red }} />
              <span style={{ fontFamily: "monospace", fontSize: 8, color: C.red, fontWeight: "bold", letterSpacing: "0.2em" }}>LIVE</span>
            </div>
          )}
          <button onClick={onClose} className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(6,10,18,0.7)", border: `1px solid ${C.border}` }}>
            <X size={11} style={{ color: C.mid }} />
          </button>
          <div className="absolute bottom-2 right-2 rounded px-1.5 py-0.5" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: C.accent }}>#{issue.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* Data */}
        <div className="p-4">
          <p style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.25em", color: C.dim, marginBottom: 4 }}>INCIDENT INTELLIGENCE FILE</p>
          <h3 className="text-sm font-semibold leading-snug mb-1" style={{ color: C.text }}>{issue.title}</h3>
          <p className="flex items-center gap-1 mb-3" style={{ fontSize: 10, color: C.dim }}>
            <MapPin size={9} style={{ flexShrink: 0 }} />
            <span className="truncate">{issue.location?.address || issue.locationAddress || "Location unknown"}</span>
          </p>

          {/* Chips */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="rounded px-1.5 py-0.5" style={{ fontFamily: "monospace", fontSize: 8, fontWeight: "bold", color: sevCfg.color, border: `1px solid ${sevCfg.color}50`, background: `${sevCfg.color}18` }}>
              ■ {sevCfg.label}
            </span>
            {(issue.department || issue.assignedTo) && (
              <span className="rounded px-1.5 py-0.5 truncate max-w-[110px]" style={{ fontFamily: "monospace", fontSize: 8, fontWeight: "bold", color: C.accent, border: `1px solid ${C.accent}40`, background: `${C.accent}12` }}>
                {issue.department || issue.assignedTo}
              </span>
            )}
            <span className="rounded px-1.5 py-0.5" style={{ fontFamily: "monospace", fontSize: 8, fontWeight: "bold", color: "#4A9EFF", border: "1px solid rgba(74,158,255,0.3)", background: "rgba(74,158,255,0.1)" }}>
              {STATUS_LABELS[issue.status] ?? issue.status?.toUpperCase()}
            </span>
          </div>

          {/* Data grid 2x2 */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { label: "DAILY LOSS", value: fmtINR(cost), color: C.amber },
              { label: "REPORTED",   value: relTime(issue.reportedAt), color: C.text },
              { label: "AFFECTED",   value: `${(issue.economicImpact?.affectedResidents ?? 0).toLocaleString("en-IN")}+`, color: C.green },
              { label: "AI PRIORITY",value: `${priority}/100`, color: sevCfg.color },
            ].map((d) => (
              <div key={d.label} className="rounded-lg p-2" style={{ background: "#070B14", border: `1px solid ${C.borderDim}` }}>
                <p style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.15em", color: C.dim, marginBottom: 2 }}>{d.label}</p>
                <p style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "bold", color: d.color }}>{d.value}</p>
              </div>
            ))}
          </div>

          {/* Reporter */}
          <p className="mb-2" style={{ fontFamily: "monospace", fontSize: 9, color: C.dim }}>
            REPORTER · <span style={{ color: C.accent }}>#{(issue.reportedBy || "ANON").slice(0, 8).toUpperCase()}</span>
          </p>

          {/* AI confidence bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>AI CONFIDENCE</span>
              <span style={{ fontFamily: "monospace", fontSize: 7, color: C.accent }}>{confidence}%</span>
            </div>
            <div className="h-px rounded-full" style={{ background: C.border }}>
              <div className="h-px rounded-full" style={{ width: `${confidence}%`, background: `linear-gradient(to right, ${C.accent}, ${C.green})` }} />
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push(`/issues/${issue.id}`)}
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={{ border: `1px solid ${C.accent}40`, background: `${C.accent}12`, fontFamily: "monospace", fontSize: 10, fontWeight: "bold", color: C.accent, letterSpacing: "0.1em" }}
          >
            OPEN INSPECTION FILE <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Filters {
  severities: Set<string>;
  statuses: Set<string>;
  departments: Set<string>;
  dateRange: "all" | "today" | "week" | "month";
  search: string;
}

const INIT_FILTERS: Filters = {
  severities: new Set(),
  statuses: new Set(),
  departments: new Set(),
  dateRange: "all",
  search: "",
};

export default function MapPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { issues, loading: issuesLoading } = useAllIssues();

  const [filters, setFilters] = useState<Filters>(INIT_FILTERS);
  const [mapMode, setMapMode] = useState<MapMode>("standard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [drawMode, setDrawMode] = useState(false);
  const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(3);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, authLoading, router]);

  // Derived data
  const departments = useMemo(() => {
    const s = new Set<string>();
    issues.forEach((i) => { if (i.department) s.add(i.department); });
    return Array.from(s).sort();
  }, [issues]);

  const radiusFilter = useMemo(() =>
    radiusCenter ? { center: radiusCenter, radiusKm } : null,
    [radiusCenter, radiusKm]
  );

  const filteredIssues = useMemo(() => {
    const now = Date.now(), day = 86_400_000;
    return issues.filter((issue) => {
      if (filters.severities.size > 0 && !filters.severities.has(issue.severity)) return false;
      if (filters.statuses.size > 0 && !filters.statuses.has(issue.status)) return false;
      if (filters.departments.size > 0 && !filters.departments.has(issue.department ?? "")) return false;
      if (filters.dateRange !== "all") {
        const cutoff = filters.dateRange === "today" ? now - day : filters.dateRange === "week" ? now - 7 * day : now - 30 * day;
        if (isoLike(issue.reportedAt) < cutoff) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${issue.title} ${issue.category} ${issue.department} ${issue.location?.address} ${issue.ward}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (radiusFilter) {
        const lat = Number(issue.location?.lat ?? 0), lng = Number(issue.location?.lng ?? 0);
        if (!lat || !lng) return false;
        if (haversine(radiusFilter.center, [lat, lng]) > radiusFilter.radiusKm) return false;
      }
      return true;
    });
  }, [issues, filters, radiusFilter]);

  const counts = useMemo(() => ({
    critical: issues.filter((i) => i.severity === "critical" && !["resolved", "closed"].includes(i.status)).length,
    high:     issues.filter((i) => i.severity === "high" && !["resolved", "closed"].includes(i.status)).length,
    medium:   issues.filter((i) => i.severity === "medium" && !["resolved", "closed"].includes(i.status)).length,
    low:      issues.filter((i) => i.severity === "low" && !["resolved", "closed"].includes(i.status)).length,
    open:     issues.filter((i) => i.status === "open").length,
    assigned: issues.filter((i) => i.status === "assigned").length,
    inProg:   issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => ["resolved", "closed"].includes(i.status)).length,
  }), [issues]);

  const activeFilterCount = filters.severities.size + filters.statuses.size + filters.departments.size +
    (filters.dateRange !== "all" ? 1 : 0) + (radiusFilter ? 1 : 0);

  const selectedIssue = useMemo(() => issues.find((i) => i.id === selectedId), [issues, selectedId]);

  const toggle = useCallback(<K extends keyof Filters>(key: K, val: string) => {
    setFilters((prev) => {
      const s = new Set(prev[key] as Set<string>);
      s.has(val) ? s.delete(val) : s.add(val);
      return { ...prev, [key]: s };
    });
  }, []);

  const handleMapClick = useCallback((latlng: [number, number]) => {
    setRadiusCenter(latlng);
    setDrawMode(false);
  }, []);

  const clearRadius = useCallback(() => { setRadiusCenter(null); setDrawMode(false); }, []);
  const clearAll = useCallback(() => { setFilters(INIT_FILTERS); clearRadius(); }, [clearRadius]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center gap-3" style={{ background: C.bg }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
        <span style={{ fontFamily: "monospace", fontSize: 10, color: C.dim, letterSpacing: "0.2em" }}>VERIFYING CREDENTIALS</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif" }}>

      {/* ── TOP INTELLIGENCE BAR ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 border-b" style={{ height: 48, background: C.panel, borderColor: C.border }}>
        {/* Panel toggle */}
        <button onClick={() => setPanelOpen((p) => !p)}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{ border: `1px solid ${C.border}`, background: panelOpen ? `${C.accent}12` : "transparent", color: panelOpen ? C.accent : C.dim }}>
          {panelOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.accent }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: "bold", color: C.text, letterSpacing: "0.15em" }}>CITYSPELL</span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: C.dim, letterSpacing: "0.1em" }}>INTELLIGENCE</span>
          <span className="rounded-full px-2 py-0.5" style={{ fontFamily: "monospace", fontSize: 8, color: C.accent, border: `1px solid ${C.accent}40`, background: `${C.accent}10`, letterSpacing: "0.1em" }}>BLR</span>
        </div>

        {/* Stat pills */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          {[
            { label: "CRITICAL", val: counts.critical, color: C.red },
            { label: "ACTIVE",   val: counts.open + counts.assigned + counts.inProg, color: C.amber },
            { label: "RESOLVED", val: counts.resolved, color: C.green },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1 rounded px-2 py-0.5" style={{ border: `1px solid ${s.color}30`, background: `${s.color}0D` }}>
              <span style={{ fontFamily: "monospace", fontSize: 8, color: s.color, letterSpacing: "0.1em" }}>{s.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: "bold", color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs relative ml-2">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.dim }} />
          <input
            type="text"
            placeholder="SEARCH INCIDENTS..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg focus:outline-none"
            style={{
              background: C.card, border: `1px solid ${filters.search ? C.accent : C.border}`,
              color: C.text, fontFamily: "monospace", fontSize: 10, letterSpacing: "0.05em",
              caretColor: C.accent,
            }}
          />
          {filters.search && (
            <button onClick={() => setFilters((p) => ({ ...p, search: "" }))}
              className="absolute right-2 top-1/2 -translate-y-1/2"><X size={11} style={{ color: C.dim }} /></button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Map mode toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {(["standard", "cluster", "heatmap"] as const).map((m, i) => (
              <button key={m} onClick={() => setMapMode(m)}
                className="px-2.5 py-1 transition-all"
                style={{
                  background: mapMode === m ? `${C.accent}18` : "transparent",
                  color: mapMode === m ? C.accent : C.dim,
                  fontFamily: "monospace", fontSize: 9, fontWeight: "bold", letterSpacing: "0.1em",
                  borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                }}>
                {m === "standard" ? "STD" : m === "cluster" ? "CLSTR" : "HEAT"}
              </button>
            ))}
          </div>

          {/* Draw radius */}
          <button onClick={() => { setDrawMode(true); setPanelOpen(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
            style={{
              border: `1px solid ${drawMode ? C.accent : C.border}`,
              background: drawMode ? `${C.accent}18` : "transparent",
              color: drawMode ? C.accent : C.dim,
              fontFamily: "monospace", fontSize: 9, fontWeight: "bold", letterSpacing: "0.1em",
            }}>
            <Crosshair size={11} />
            RADIUS
          </button>

          {/* Active filter badge */}
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
              style={{ border: `1px solid ${C.amber}40`, background: `${C.amber}12`, color: C.amber, fontFamily: "monospace", fontSize: 9, fontWeight: "bold" }}>
              <Filter size={10} />
              {activeFilterCount}
              <X size={9} />
            </button>
          )}

          <Link href="/citizen-dashboard" className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all"
            style={{ border: `1px solid ${C.border}`, color: C.dim, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em" }}>
            <ArrowLeft size={10} />
            EXIT
          </Link>
        </div>
      </div>

      {/* ── MAIN AREA ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 flex flex-col overflow-hidden"
              style={{ borderRight: `1px solid ${C.border}`, background: C.panel }}
            >
              <div className="flex-1 overflow-y-auto" style={{ minWidth: 256 }}>

                {/* ── Filters section ── */}
                <div className="p-3 border-b" style={{ borderColor: C.borderDim }}>
                  <p className="mb-2" style={{ fontFamily: "monospace", fontSize: 8, color: C.dim, letterSpacing: "0.2em" }}>OPERATIONAL FILTERS</p>

                  {/* Severity */}
                  <p className="mb-1.5" style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>SEVERITY</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(["critical","high","medium","low"] as const).map((s) => (
                      <Chip key={s} label={SEV[s].label} active={filters.severities.has(s)}
                        accent={SEV[s].color} count={counts[s]}
                        onClick={() => toggle("severities", s)} />
                    ))}
                  </div>

                  {/* Status */}
                  <p className="mb-1.5" style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>STATUS</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(["open","assigned","in_progress","resolved"] as const).map((s) => (
                      <Chip key={s} label={STATUS_LABELS[s]} active={filters.statuses.has(s)}
                        accent={s === "resolved" ? C.green : s === "open" ? C.red : s === "in_progress" ? C.accent : C.amber}
                        count={s === "open" ? counts.open : s === "assigned" ? counts.assigned : s === "in_progress" ? counts.inProg : counts.resolved}
                        onClick={() => toggle("statuses", s)} />
                    ))}
                  </div>

                  {/* Time window */}
                  <p className="mb-1.5" style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>TIME WINDOW</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(["all","today","week","month"] as const).map((d) => (
                      <Chip key={d} label={d.toUpperCase()} active={filters.dateRange === d} accent={C.accent}
                        onClick={() => setFilters((p) => ({ ...p, dateRange: d }))} />
                    ))}
                  </div>

                  {/* Department */}
                  {departments.length > 0 && (
                    <>
                      <p className="mb-1.5" style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>DEPARTMENT</p>
                      <div className="flex flex-col gap-0.5 mb-1" style={{ maxHeight: 96, overflowY: "auto" }}>
                        {departments.map((dept) => (
                          <button key={dept} onClick={() => toggle("departments", dept)}
                            className="flex items-center gap-2 px-2 py-1 rounded text-left transition-all"
                            style={{
                              background: filters.departments.has(dept) ? `${C.accent}14` : "transparent",
                              border: `1px solid ${filters.departments.has(dept) ? `${C.accent}40` : "transparent"}`,
                            }}>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: filters.departments.has(dept) ? C.accent : C.borderDim }} />
                            <span className="truncate" style={{ fontFamily: "monospace", fontSize: 9, color: filters.departments.has(dept) ? C.accent : C.mid }}>
                              {dept}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Radius draw section ── */}
                <div className="p-3 border-b" style={{ borderColor: C.borderDim }}>
                  <p className="mb-2" style={{ fontFamily: "monospace", fontSize: 8, color: C.dim, letterSpacing: "0.2em" }}>RADIUS ANALYSIS</p>
                  {!radiusCenter ? (
                    <button onClick={() => setDrawMode(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
                      style={{
                        border: `1px dashed ${drawMode ? C.accent : C.border}`,
                        background: drawMode ? `${C.accent}10` : "transparent",
                        color: drawMode ? C.accent : C.dim,
                        fontFamily: "monospace", fontSize: 9, fontWeight: "bold", letterSpacing: "0.1em",
                      }}>
                      <Crosshair size={11} />
                      {drawMode ? "CLICK MAP TO SET CENTER" : "DRAW RADIUS"}
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.accent }} />
                          <span style={{ fontFamily: "monospace", fontSize: 9, color: C.accent, fontWeight: "bold" }}>RADIUS ACTIVE</span>
                        </div>
                        <button onClick={clearRadius}><Trash2 size={11} style={{ color: C.dim }} /></button>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: "monospace", fontSize: 8, color: C.mid }}>RADIUS</span>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: C.accent, fontWeight: "bold" }}>{radiusKm} km</span>
                      </div>
                      <input type="range" min={1} max={20} step={0.5} value={radiusKm}
                        onChange={(e) => setRadiusKm(Number(e.target.value))}
                        className="w-full accent-[#00BFFF]"
                        style={{ accentColor: C.accent }} />
                      <p style={{ fontFamily: "monospace", fontSize: 8, color: C.dim, marginTop: 4 }}>
                        <span style={{ color: C.accent, fontWeight: "bold" }}>{filteredIssues.length}</span> incidents inside
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Intelligence feed ── */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontFamily: "monospace", fontSize: 8, color: C.dim, letterSpacing: "0.2em" }}>INTELLIGENCE FEED</p>
                    <span className="rounded-full px-1.5 py-0.5" style={{ fontFamily: "monospace", fontSize: 8, color: C.accent, border: `1px solid ${C.accent}40`, background: `${C.accent}10` }}>
                      {filteredIssues.length}
                    </span>
                  </div>

                  {issuesLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: C.dim }}>SYNCING DATA</span>
                    </div>
                  ) : filteredIssues.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <AlertCircle size={20} style={{ color: C.borderDim }} />
                      <p style={{ fontFamily: "monospace", fontSize: 8, color: C.dim, letterSpacing: "0.15em" }}>NO INCIDENTS FOUND</p>
                      <p style={{ fontFamily: "monospace", fontSize: 7, color: C.borderDim }}>ADJUST FILTERS</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {filteredIssues.slice(0, 80).map((issue) => {
                        const sevColor = SEV[issue.severity as keyof typeof SEV]?.color ?? C.amber;
                        const isSelected = selectedId === issue.id;
                        return (
                          <button key={issue.id} onClick={() => setSelectedId(isSelected ? null : issue.id)}
                            className="flex items-start gap-2 p-2 rounded text-left transition-all w-full"
                            style={{
                              background: isSelected ? `${C.accent}10` : "transparent",
                              border: `1px solid ${isSelected ? `${C.accent}30` : "transparent"}`,
                              borderLeft: `2px solid ${isSelected ? C.accent : sevColor}`,
                            }}>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-medium" style={{ color: C.text }}>{issue.title}</p>
                              <p className="truncate" style={{ fontFamily: "monospace", fontSize: 8, color: C.dim, marginTop: 1 }}>
                                {issue.location?.address || issue.locationAddress || "—"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="rounded px-1 py-0.5" style={{ fontFamily: "monospace", fontSize: 7, fontWeight: "bold", color: sevColor, border: `1px solid ${sevColor}30`, background: `${sevColor}12` }}>
                                  {issue.severity?.toUpperCase()}
                                </span>
                                <span style={{ fontFamily: "monospace", fontSize: 8, color: C.borderDim }}>
                                  {relTime(issue.reportedAt)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={11} style={{ color: C.borderDim, flexShrink: 0, marginTop: 4 }} />
                          </button>
                        );
                      })}
                      {filteredIssues.length > 80 && (
                        <p className="text-center py-2" style={{ fontFamily: "monospace", fontSize: 8, color: C.dim }}>
                          +{filteredIssues.length - 80} more — narrow filters
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel footer metrics */}
              <div className="flex-shrink-0 p-3 border-t" style={{ borderColor: C.border }}>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "CRITICAL", val: counts.critical, color: C.red },
                    { label: "ACTIVE",   val: counts.open,     color: C.amber },
                    { label: "RESOLVED", val: counts.resolved, color: C.green },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: C.card, border: `1px solid ${C.borderDim}` }}>
                      <p style={{ fontFamily: "monospace", fontSize: 14, fontWeight: "bold", color: s.color }}>{s.val}</p>
                      <p style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.1em" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAP AREA ─────────────────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">

          {/* Map */}
          <div className="absolute inset-0" style={{ cursor: drawMode ? "crosshair" : "default" }}>
            <WardIntelligenceMap
              issues={filteredIssues}
              selectedId={selectedId}
              onSelectIssue={setSelectedId}
              mapMode={mapMode}
              radiusFilter={radiusFilter}
              drawMode={drawMode}
              onMapClick={handleMapClick}
            />
          </div>

          {/* Draw mode instruction banner */}
          <AnimatePresence>
            {drawMode && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg px-4 py-2 pointer-events-auto"
                style={{ background: `${C.panel}F0`, border: `1px solid ${C.accent}40`, backdropFilter: "blur(8px)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.accent }} />
                <span style={{ fontFamily: "monospace", fontSize: 9, color: C.accent, fontWeight: "bold", letterSpacing: "0.15em" }}>
                  CLICK MAP TO SET RADIUS CENTER
                </span>
                <button onClick={() => setDrawMode(false)} className="ml-1">
                  <X size={11} style={{ color: C.dim }} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Issue Intel Card overlay */}
          <AnimatePresence>
            {selectedIssue && (
              <IssueIntelCard issue={selectedIssue} onClose={() => setSelectedId(null)} />
            )}
          </AnimatePresence>

          {/* Legend overlay — bottom-right */}
          <div className="absolute bottom-3 right-3 z-10 rounded-xl p-3 pointer-events-none"
            style={{ background: `${C.panel}E8`, border: `1px solid ${C.border}`, backdropFilter: "blur(8px)", minWidth: 130 }}>
            <p className="mb-2" style={{ fontFamily: "monospace", fontSize: 7, color: C.dim, letterSpacing: "0.2em" }}>THREAT LEGEND</p>
            {[
              { color: C.red,    label: "CRITICAL", count: counts.critical },
              { color: C.orange, label: "HIGH",     count: counts.high     },
              { color: C.amber,  label: "MEDIUM",   count: counts.medium   },
              { color: C.green,  label: "LOW/SAFE", count: counts.low + counts.resolved },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}80` }} />
                <span style={{ fontFamily: "monospace", fontSize: 8, color: C.mid }}>{l.label}</span>
                <span className="ml-auto" style={{ fontFamily: "monospace", fontSize: 9, fontWeight: "bold", color: l.color }}>{l.count}</span>
              </div>
            ))}
          </div>

          {/* Live counter — bottom-left */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: `${C.panel}E8`, border: `1px solid ${C.border}`, backdropFilter: "blur(8px)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.accent }} />
              <span style={{ fontFamily: "monospace", fontSize: 9, color: C.accent, fontWeight: "bold", letterSpacing: "0.1em" }}>
                LIVE · {filteredIssues.length}/{issues.length} INCIDENTS
              </span>
            </div>
            {radiusFilter && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ background: `${C.panel}E8`, border: `1px solid ${C.accent}40` }}>
                <Circle size={9} style={{ color: C.accent }} />
                <span style={{ fontFamily: "monospace", fontSize: 9, color: C.accent, fontWeight: "bold" }}>
                  RADIUS {radiusKm}KM · {filteredIssues.length} INSIDE
                </span>
              </div>
            )}
            <Link href="/report" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 pointer-events-auto transition-all"
              style={{ background: `${C.panel}E8`, border: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 9, color: C.mid, backdropFilter: "blur(8px)" }}>
              <Camera size={10} />
              REPORT INCIDENT
            </Link>
          </div>

          {/* Mode indicator - top left when panel closed */}
          {!panelOpen && (
            <div className="absolute top-3 left-3 z-10 rounded-lg px-3 py-1.5"
              style={{ background: `${C.panel}E8`, border: `1px solid ${C.border}`, backdropFilter: "blur(8px)" }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: mapMode === "heatmap" ? C.red : mapMode === "cluster" ? C.accent : C.green, fontWeight: "bold", letterSpacing: "0.1em" }}>
                {mapMode.toUpperCase()} MODE
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
