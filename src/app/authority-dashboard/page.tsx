"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  MapPin, Bell, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  TrendingDown, IndianRupee, Users, BarChart3, Zap, Shield,
  Building2, Activity, ArrowUpRight, ArrowDownRight,
  Eye, Cpu, Radio, Sparkles, Loader2, LogOut, Sun, Moon,
  Download, Printer, Filter, ChevronDown, ChevronRight,
  Calendar, Wrench, UserCheck, FileText, PieChart, Map,
  RefreshCw, GitBranch, Target, Layers, X,
} from "lucide-react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useAllIssues } from "@/lib/hooks/useIssues";
import { updateIssue } from "@/lib/services/issueService";
import { createNotification } from "@/lib/services/notificationService";

/* ─── UTILITIES ─────────────────────────────────────────────── */

function formatINR(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${Math.round(n / 1_000)}K`;
  return `₹${n}`;
}

function relTime(ts: { toDate?: () => Date } | Date | null | undefined): string {
  if (!ts) return 'just now';
  const d = ts instanceof Date ? ts : (ts as any).toDate?.() ?? new Date();
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const dy = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (h < 1) return `${m}m ago`;
  if (dy < 1) return `${h}h ago`;
  return `${dy}d ago`;
}

function useCountUp(target: number, dur = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, dur, delay]);
  return val;
}

const useLiveTick = (ms = 4000) => {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT(v => v + 1), ms); return () => clearInterval(i); }, [ms]);
  return t;
};

/* ─── ANIMATION VARIANTS ─────────────────────────────────────── */
const cV = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const rV = { hidden: { opacity: 0, x: -14 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] as [number,number,number,number] } } };
const dV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22,1,0.36,1] as [number,number,number,number] } } };

/* ─── CHART SUB-COMPONENTS ──────────────────────────────────── */

function Spark({ data, color, h = 36 }: { data: number[]; color: string; h?: number }) {
  const mx = Math.max(...data, 1);
  const w = data.length * 18;
  const pts = data.map((v, i) => `${i * 18 + 9},${h - (v / mx) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${pts.split(" ").join(" L ")} L ${(data.length - 1) * 18 + 9},${h} L 9,${h} Z`}
        fill={`url(#sp-${color.replace("#","")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function AreaChart({ data, color }: { data: number[]; color: string }) {
  const mx = Math.max(...data, 1);
  const h = 100; const w = data.length * 30;
  const pts = data.map((v, i) => `${i * 30 + 15},${h - (v / mx) * (h - 8) - 4}`);
  return (
    <svg viewBox={`0 0 ${w} ${h + 16}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1="0" y1={f * h} x2={w} y2={f * h} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
      ))}
      <path
        d={`M ${pts.join(" L ")} L ${(data.length - 1) * 30 + 15},${h} L 15,${h} Z`}
        fill="url(#areaGrad)"
      />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(",");
        return (
          <motion.circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2.5}
            fill={i === data.length - 1 ? color : "white"} stroke={color} strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.05 }}
          />
        );
      })}
    </svg>
  );
}

function HBar({ label, value, max, color, dark }: { label: string; value: number; max: number; color: string; dark: boolean }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className={`text-[11px] font-semibold ${dark ? "text-[#8B949E]" : "text-[#5A5A62]"}`}>{label}</span>
        <span className="text-[11px] font-bold font-mono-data" style={{ color }}>{value}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#30363D]" : "bg-[#F0EDE8]"}`}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function DonutRing({ pct, color, label, dark }: { pct: number; color: string; label: string; dark: boolean }) {
  const r = 30; const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke={dark ? "#30363D" : "#F0EDE8"} strokeWidth="6" />
          <motion.circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - pct / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold font-mono-data" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <span className={`text-[10px] text-center ${dark ? "text-[#6E7681]" : "text-[#9A9AA4]"}`}>{label}</span>
    </div>
  );
}

function WardMapSVG({ issues, dark }: { issues: any[]; dark: boolean }) {
  const wards = [
    { id: "ward_14", name: "Indiranagar", cx: 260, cy: 130 },
    { id: "ward_35", name: "Whitefield",  cx: 380, cy: 170 },
    { id: "ward_22", name: "Koramangala", cx: 220, cy: 230 },
    { id: "ward_01", name: "Rajajinagar", cx: 130, cy: 100 },
    { id: "ward_08", name: "Jayanagar",   cx: 190, cy: 290 },
  ];
  const wardCounts = wards.map(w => ({
    ...w,
    count: issues.filter(i => i.location?.wardId === w.id || i.ward === w.name).length,
  }));
  return (
    <svg viewBox="0 0 480 360" className="w-full h-full" style={{ minHeight: 200 }}>
      <rect width="480" height="360" fill={dark ? "#0D1117" : "#F5F4F1"} rx="12" />
      {/* Road network */}
      <path d="M 80 180 Q 200 100 320 180 Q 400 230 440 280" stroke={dark?"#30363D":"#E4E2DC"} strokeWidth="2" fill="none" />
      <path d="M 130 60 L 200 340" stroke={dark?"#30363D":"#E4E2DC"} strokeWidth="1.5" fill="none" />
      <path d="M 60 200 L 440 160" stroke={dark?"#30363D":"#E4E2DC"} strokeWidth="1.5" fill="none" />
      <path d="M 240 40 L 300 340" stroke={dark?"#30363D":"#E4E2DC"} strokeWidth="1.5" fill="none" />
      {/* Ward zones */}
      {wardCounts.map(w => {
        const isHot = w.count >= 3;
        const color = w.count >= 5 ? "#D4726A" : w.count >= 2 ? "#C8A87A" : "#7A9E6E";
        return (
          <g key={w.id}>
            <motion.circle cx={w.cx} cy={w.cy} r={28 + w.count * 2}
              fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1" strokeDasharray="4 3"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
            />
            <motion.circle cx={w.cx} cy={w.cy} r={9}
              fill={color} fillOpacity="0.9"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
            />
            {isHot && (
              <motion.circle cx={w.cx} cy={w.cy} r={9}
                fill="none" stroke={color} strokeWidth="1.5"
                animate={{ r: [9, 20, 9], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <text x={w.cx} y={w.cy + 22} textAnchor="middle"
              className="text-[8px]" fontSize="9" fontWeight="600"
              fill={dark ? "#8B949E" : "#5A5A62"}
            >{w.name}</text>
            {w.count > 0 && (
              <text x={w.cx} y={w.cy + 3} textAnchor="middle"
                fontSize="8" fontWeight="700" fill="white"
              >{w.count}</text>
            )}
          </g>
        );
      })}
      {/* Legend */}
      {[["#7A9E6E","Low"],["#C8A87A","Medium"],["#D4726A","High"]].map(([c, l], i) => (
        <g key={l} transform={`translate(${16 + i * 70}, 336)`}>
          <circle cx="5" cy="5" r="5" fill={c} fillOpacity="0.8" />
          <text x="14" y="9" fontSize="8" fill={dark ? "#6E7681" : "#9A9AA4"}>{l}</text>
        </g>
      ))}
    </svg>
  );
}

function SevBadge({ v, dark }: { v: number; dark: boolean }) {
  const color = v >= 85 ? "#D4726A" : v >= 70 ? "#C8A87A" : "#7A9E6E";
  const bg    = v >= 85 ? (dark ? "#3D1A1A" : "#FAECEA") : v >= 70 ? (dark ? "#3D2E0A" : "#FAF0E0") : (dark ? "#0A2B1A" : "#EAF2E6");
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono-data" style={{ background: bg, color }}>{v}</span>;
}

/* ─── STATIC DATA ────────────────────────────────────────────── */
const BUDGET = [
  { dept: "PWD",    allocated: 5, spent: 3.2, color: "#7A9E6E" },
  { dept: "BWSSB",  allocated: 4, spent: 2.8, color: "#6A88AA" },
  { dept: "BESCOM", allocated: 2.5, spent: 1.8, color: "#C8A87A" },
  { dept: "BBMP",   allocated: 8, spent: 5.8, color: "#D4726A" },
];

const PREDICTIONS_STATIC = [
  { loc: "Silk Board Jct",   type: "Bridge Structural",  prob: 78, days: 7,  color: "#D4726A" },
  { loc: "Bannerghatta Rd",  type: "Road Collapse",      prob: 64, days: 14, color: "#C8A87A" },
  { loc: "Hebbal Flyover",   type: "Drainage Failure",   prob: 51, days: 21, color: "#6A88AA" },
];

const TREND_DATA  = [28, 35, 42, 38, 51, 47, 60, 54, 68, 61, 75, 72];
const RESOLVE_DATA = [12, 18, 15, 22, 19, 28, 24, 31, 27, 35, 30, 38];
const RESP_DATA   = [6.5, 6.1, 5.8, 6.2, 5.4, 5.8, 5.2, 4.9, 5.1, 4.6, 4.8, 4.3];

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */

export default function AuthorityDashboard() {
  const { isAuthenticated, profile, loading, user, signOut } = useAuthContext();
  const router = useRouter();
  const { issues, loading: issuesLoading } = useAllIssues();
  const tick = useLiveTick(4000);

  // UI state
  const [dark,         setDark]         = useState(true);
  const [activeNav,    setActiveNav]    = useState("overview");
  const [analyticsTab, setAnalyticsTab] = useState<"trend"|"category"|"resolution">("trend");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept,   setFilterDept]   = useState("all");
  const [filterSev,    setFilterSev]    = useState("all");
  const [selectedIssue,setSelectedIssue]= useState<string|null>(null);
  const [showMobileNav,setShowMobileNav]= useState(false);

  // Issue management state (preserved)
  const [notesMap,     setNotesMap]     = useState<Record<string, string>>({});
  const [statusMap,    setStatusMap]    = useState<Record<string, string>>({});
  const [deptMap,      setDeptMap]      = useState<Record<string, string>>({});
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);

  // Seeder
  useEffect(() => {
    if (user?.uid) {
      import("@/lib/services/seeder").then(({ seedDemoData }) => seedDemoData(user.uid));
    }
  }, [user?.uid]);

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
    else if (!loading && isAuthenticated && profile && profile.role !== "authority" && profile.role !== "admin")
      router.push("/citizen-dashboard");
  }, [isAuthenticated, profile, loading, router]);

  /* ── DERIVED STATS ─────────────────────────────────────────── */
  const total      = issues.length;
  const active     = issues.filter(i => !["resolved","closed","rejected"].includes(i.status ?? "")).length;
  const resolved   = issues.filter(i => ["resolved","closed"].includes(i.status ?? "")).length;
  const critical   = issues.filter(i => i.severity?.toLowerCase() === "critical" && i.status !== "resolved").length;
  const overdue    = issues.filter(i => {
    if (!i.reportedAt || ["resolved","closed"].includes(i.status ?? "")) return false;
    const age = Date.now() - ((i.reportedAt as any)?.toDate?.()?.getTime?.() ?? 0);
    return age > 72 * 3600000;
  }).length;
  const inProgress = issues.filter(i => i.status === "in_progress").length;
  const avgHours   = issues.length > 0 ? 4.3 : 0;
  const totalLoss  = issues.reduce((a, i) => a + (i.economicImpact?.estimatedLossINR || i.aiAnalysis?.estimatedCost || 15000), 0);
  const prevented  = issues.filter(i => ["resolved","closed"].includes(i.status ?? "")).reduce((a, i) => a + (i.economicImpact?.estimatedLossINR || i.aiAnalysis?.estimatedCost || 15000), 0);
  const avgConf    = issues.length > 0 ? Math.round(issues.reduce((a, i) => a + (i.aiAnalysis?.confidence || 82), 0) / issues.length) : 82;

  /* ALL useCountUp calls MUST be here — before any early return */
  const cTotal     = useCountUp(total,    1000, 100);
  const cActive    = useCountUp(active,   900,  150);
  const cResolved  = useCountUp(resolved, 900,  200);
  const cCritical  = useCountUp(critical, 800,  250);
  const cOverdue   = useCountUp(overdue,  700,  300);
  const cInProg    = useCountUp(inProgress,700, 350);
  const cLossLakh  = useCountUp(Math.round(totalLoss / 100000), 1200, 100);
  const cPrevLakh  = useCountUp(Math.round(prevented / 100000), 1200, 200);
  const cAvgH      = useCountUp(Math.round(avgHours * 10), 900, 150);
  const cConf      = useCountUp(avgConf, 1000, 200);

  /* ── DEPT PERFORMANCE ─────────────────────────────────────── */
  const DEPTS = ["PWD", "BBMP", "BWSSB", "BESCOM"];
  const deptPerf = DEPTS.map(d => {
    const di = issues.filter(i => i.department === d || i.assignedTo === d);
    const res = di.filter(i => ["resolved","closed"].includes(i.status ?? "")).length;
    const score = di.length > 0 ? Math.round((res / di.length) * 100) : 75;
    return { name: d, total: di.length, resolved: res, pending: di.length - res, score: score || 75 };
  });

  /* ── WARD RANKINGS ─────────────────────────────────────────── */
  const wardMap: Record<string, { name: string; count: number; resolved: number; critical: number }> = {};
  issues.forEach(i => {
    const wId   = i.location?.wardId || i.ward || "unknown";
    const wName = i.location?.wardName || i.ward || "Unknown Ward";
    if (!wardMap[wId]) wardMap[wId] = { name: wName, count: 0, resolved: 0, critical: 0 };
    wardMap[wId].count++;
    if (["resolved","closed"].includes(i.status ?? "")) wardMap[wId].resolved++;
    if (i.severity?.toLowerCase() === "critical") wardMap[wId].critical++;
  });
  const wardRankings = Object.entries(wardMap)
    .map(([id, v]) => ({ id, ...v, health: v.count > 0 ? Math.round((v.resolved / v.count) * 100) : 80 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  /* ── OFFICER ACTIVITY (from timeline) ────────────────────── */
  const officerActivity: { officer: string; action: string; issue: string; time: any }[] = [];
  issues.forEach(i => {
    (i.timeline || []).forEach((t: any) => {
      if (t.updatedBy) {
        officerActivity.push({ officer: t.updatedBy, action: t.status || "updated", issue: i.title || i.category || "Issue", time: t.timestamp });
      }
    });
  });
  officerActivity.sort((a, b) => {
    const ta = a.time?.toDate?.()?.getTime?.() ?? 0;
    const tb = b.time?.toDate?.()?.getTime?.() ?? 0;
    return tb - ta;
  });
  const recentActivity = officerActivity.slice(0, 8);

  /* ── FILTERED ISSUES TABLE ─────────────────────────────────── */
  const filteredIssues = issues.filter(i => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterDept !== "all" && i.department !== filterDept && i.assignedTo !== filterDept) return false;
    if (filterSev !== "all" && i.severity?.toLowerCase() !== filterSev) return false;
    return true;
  });

  const escalations = issues.filter(i => {
    const isCritical = i.severity?.toLowerCase() === "critical";
    const isOld = (() => {
      if (!i.reportedAt) return false;
      const age = Date.now() - ((i.reportedAt as any)?.toDate?.()?.getTime?.() ?? 0);
      return age > 48 * 3600000;
    })();
    return (isCritical || isOld) && !["resolved","closed"].includes(i.status ?? "");
  }).slice(0, 5);

  /* ── CSV EXPORT ──────────────────────────────────────────── */
  const exportCSV = useCallback(() => {
    const headers = ["ID","Title","Category","Severity","Status","Department","Ward","Reported At","Economic Loss","AI Confidence"];
    const rows = issues.map(i => [
      i.id,
      `"${(i.title || "").replace(/"/g, "'")}"`,
      i.category || "",
      i.severity || "",
      i.status || "",
      i.department || i.assignedTo || "",
      i.location?.wardName || i.ward || "",
      (i.reportedAt as any)?.toDate?.()?.toISOString?.() || "",
      i.economicImpact?.estimatedLossINR || i.aiAnalysis?.estimatedCost || 15000,
      i.aiAnalysis?.confidence || "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `cityspell-issues-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [issues]);

  /* ── UPDATE ISSUE (preserved) ──────────────────────────────── */
  const handleUpdateIssue = async (id: string) => {
    const issueObj = issues.find(i => i.id === id);
    if (!issueObj) return;
    const newStatus = statusMap[id] ?? issueObj.status;
    const newDept   = deptMap[id]   ?? (issueObj.department || "Unassigned");
    const note      = notesMap[id]  ?? `Officer updated status to ${newStatus}.`;
    try {
      setUpdatingId(id);
      const officer = profile?.displayName || user?.email || "Municipal Officer";
      await updateIssue(id, {
        status: newStatus as any, department: newDept, assignedTo: newDept,
        timeline: [...(issueObj.timeline || []), { status: newStatus, note, updatedBy: officer, timestamp: new Date() as any }],
        ...(newStatus === "resolved" ? { resolvedAt: new Date() as any } : {}),
        ...(newStatus === "assigned" ? { assignedAt: new Date() as any } : {}),
      });
      await createNotification(
        issueObj.createdBy || issueObj.reportedBy || "anonymous",
        id, newStatus, newDept, note
      );
      setNotesMap(p => ({ ...p, [id]: "" }));
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  /* ── LOADING / AUTH GUARD ─────────────────────────────────── */
  if (loading || issuesLoading || !isAuthenticated || (profile && profile.role !== "authority" && profile.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#7A9E6E] animate-spin" />
          <p className="text-sm font-medium text-[#8B949E]">Verifying credentials…</p>
        </div>
      </div>
    );
  }

  /* ── COLORS ────────────────────────────────────────────────── */
  const bg      = dark ? "bg-[#0D1117]"  : "bg-[#F5F4F1]";
  const card    = dark ? "bg-[#161B22]"  : "bg-white";
  const border  = dark ? "border-[#30363D]" : "border-[#E4E2DC]";
  const t1      = dark ? "text-[#E6EDF3]"  : "text-[#1A1A1C]";
  const t2      = dark ? "text-[#8B949E]"  : "text-[#5A5A62]";
  const t3      = dark ? "text-[#6E7681]"  : "text-[#9A9AA4]";
  const hoverBg = dark ? "hover:bg-[#1C2128]" : "hover:bg-[#FAFAF8]";
  const subBg   = dark ? "bg-[#1C2128]"  : "bg-[#F8F7F4]";
  const inputBg = dark ? "bg-[#0D1117] border-[#30363D] text-[#E6EDF3]" : "bg-white border-[#E4E2DC] text-[#1A1A1C]";

  /* ── NAV ITEMS ─────────────────────────────────────────────── */
  const NAV = [
    { id: "overview",    icon: BarChart3,    label: "Overview"        },
    { id: "reports",     icon: AlertTriangle,label: "Incoming Reports", badge: escalations.length },
    { id: "map",         icon: Map,          label: "Live Map"        },
    { id: "departments", icon: Building2,    label: "Departments"     },
    { id: "analytics",   icon: Activity,     label: "Analytics"       },
    { id: "predictions", icon: Sparkles,     label: "AI Predictions"  },
    { id: "budget",      icon: IndianRupee,  label: "Budget & Loss"   },
    { id: "officers",    icon: UserCheck,    label: "Officer Activity" },
  ];

  /* ── KPI DATA ──────────────────────────────────────────────── */
  const KPIs = [
    { label: "Total Issues",      value: cTotal,    suffix: "", color: "#6A88AA", bg: dark?"#0A1520":"#E8EFF6", icon: FileText,     spark: [28,35,42,38,51,47,60,54], delta: "+3 today",  up: true  },
    { label: "Active Issues",     value: cActive,   suffix: "", color: "#C8A87A", bg: dark?"#1F1800":"#FAF0E0", icon: Radio,        spark: [18,22,28,24,31,27,35,30], delta: "-2 vs ytd", up: true  },
    { label: "Resolved",          value: cResolved, suffix: "", color: "#7A9E6E", bg: dark?"#0A1F0A":"#EAF2E6", icon: CheckCircle2, spark: [12,18,15,22,19,28,24,31], delta: "+5 today",  up: true  },
    { label: "Critical",          value: cCritical, suffix: "", color: "#D4726A", bg: dark?"#200A0A":"#FAECEA", icon: AlertTriangle,spark: [5,3,6,4,7,5,8,6],         delta: "urgent",    up: false },
    { label: "Overdue (>72h)",    value: cOverdue,  suffix: "", color: "#D4726A", bg: dark?"#200A0A":"#FAECEA", icon: Clock,        spark: [2,4,3,5,4,6,5,7],         delta: "needs attn",up: false },
    { label: "In Progress",       value: cInProg,   suffix: "", color: "#6A88AA", bg: dark?"#0A1520":"#E8EFF6", icon: Wrench,       spark: [6,8,7,9,8,10,9,11],       delta: "active",    up: true  },
    { label: "Avg Resolution",    value: `${(cAvgH/10).toFixed(1)}`, suffix: "h", color: "#7A9E6E", bg: dark?"#0A1F0A":"#EAF2E6", icon: Zap, spark: [6.5,6.1,5.8,5.4,5.8,5.2,4.9,4.3], delta: "-0.8h wk", up: true },
    { label: "AI Confidence",     value: cConf,     suffix: "%", color: "#C8A87A", bg: dark?"#1F1800":"#FAF0E0", icon: Cpu,         spark: [78,80,82,79,83,81,84,82], delta: "model v3",  up: true  },
  ];

  const catCounts: Record<string,number> = {};
  issues.forEach(i => { const c = i.category || "other"; catCounts[c] = (catCounts[c] || 0) + 1; });
  const CAT_COLORS: Record<string,string> = { pothole:"#D4726A", streetlight:"#C8A87A", garbage:"#7A9E6E", water:"#6A88AA", sewage:"#9A7AC8", road:"#D4726A", other:"#8B949E" };

  return (
    <div className={`${dark?"dark":""}`}>
    <div className={`min-h-screen ${bg} flex transition-colors duration-300`}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`fixed left-0 top-0 bottom-0 w-56 ${card} border-r ${border} flex-col z-40 hidden lg:flex transition-colors duration-300`}>
        {/* Logo */}
        <div className={`px-4 py-5 border-b ${border}`}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#7A9E6E] flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className={`font-bold ${t1} text-sm`}>CitySpell<span className="text-[#7A9E6E]">AI</span></span>
          </Link>
          <div className="mt-4 flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${dark?"bg-[#1C2128]":"bg-[#E8EFF6]"} flex items-center justify-center text-xs font-bold text-[#6A88AA]`}>
              {profile?.displayName ? profile.displayName.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase() : 'MO'}
            </div>
            <div>
              <p className={`text-[11px] font-bold ${t1}`}>{profile?.displayName || 'Municipal Officer'}</p>
              <p className={`text-[9px] ${t3}`}>{profile?.departmentId ? `${profile.departmentId} Officer` : 'Authority'} · Zone A</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label, badge }) => (
            <motion.button key={id} whileHover={{ x: 2 }}
              onClick={() => { setActiveNav(id); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                activeNav === id
                  ? dark ? "bg-[#1C2128] text-[#7A9E6E] font-bold border border-[#30363D]" : "bg-[#EAF2E6] text-[#5A7A50] font-bold"
                  : `${t2} ${hoverBg} font-medium`
              }`}
            >
              <Icon size={14} />
              {label}
              {badge != null && badge > 0 && (
                <motion.span animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }}
                  className="ml-auto text-[9px] font-bold bg-[#D4726A] text-white px-1.5 py-0.5 rounded-full"
                >{badge}</motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="px-2.5 pb-2">
          <button onClick={async () => { await signOut(); window.location.href = "/login"; }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#D4726A] ${dark?"hover:bg-[#200A0A]":"hover:bg-[#FAECEA]"} transition-all cursor-pointer`}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className={`px-4 py-4 border-t ${border}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
            <span className="text-[9px] font-bold text-[#7A9E6E] uppercase tracking-widest">System Nominal</span>
          </div>
          {[["8 AI Agents","Active"],["42ms","Latency"],["99.8%","Uptime"]].map(([v,l]) => (
            <div key={l} className="flex justify-between text-[9px] mb-1">
              <span className={t3}>{l}</span>
              <span className={`font-mono-data font-medium ${t2}`}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="lg:ml-56 flex-1 flex flex-col min-h-screen">

        {/* ── TOP BAR ─────────────────────────────────────────── */}
        <div className={`${card} border-b ${border} px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button onClick={() => setShowMobileNav(!showMobileNav)} className={`lg:hidden p-2 rounded-xl ${subBg} ${t2}`}>
              <Layers size={16} />
            </button>
            <div>
              <h1 className={`text-sm font-bold ${t1}`}>Authority Command Center</h1>
              <p className={`text-[10px] ${t3} font-mono mt-0.5`}>
                BBMP Zone A · Live · {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live AI status */}
            <AnimatePresence mode="wait">
              <motion.div key={tick} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 ${subBg} rounded-xl border ${border}`}
              >
                <Cpu size={11} className="text-[#7A9E6E]" />
                <span className={`text-[10px] font-mono ${t2}`}>
                  {["AI routing active","Risk scan complete","Economic model updated","Processing 3 issues"][tick%4]}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${dark?"bg-[#0A1F0A]":"bg-[#EAF2E6]"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-[10px] font-bold text-[#7A9E6E]">Live</span>
            </div>

            {/* Dark mode */}
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-xl ${subBg} border ${border} ${t2} transition-all`}
            >
              {dark ? <Sun size={14}/> : <Moon size={14}/>}
            </motion.button>

            {/* Export CSV */}
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={exportCSV}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold ${dark?"bg-[#1C2128] text-[#8B949E] border border-[#30363D]":"bg-[#F0EDE8] text-[#5A5A62] border border-[#E4E2DC]"} hover:border-[#7A9E6E] hover:text-[#7A9E6E] transition-all`}
            >
              <Download size={12}/> Export
            </motion.button>

            {/* Print */}
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => window.print()}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold ${dark?"bg-[#1C2128] text-[#8B949E] border border-[#30363D]":"bg-[#F0EDE8] text-[#5A5A62] border border-[#E4E2DC]"} hover:border-[#7A9E6E] hover:text-[#7A9E6E] transition-all`}
            >
              <Printer size={12}/> Print
            </motion.button>

            {/* Bell */}
            <motion.button whileHover={{ scale:1.05 }} className={`relative p-2 rounded-xl ${subBg} border ${border} transition-all`}>
              <Bell size={14} className={t2} />
              <motion.span animate={{ scale:[1,1.2,1] }} transition={{ duration:2, repeat:Infinity }}
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4726A]"
              />
            </motion.button>
          </div>
        </div>

        {/* ── MOBILE NAV DRAWER ──────────────────────────────── */}
        <AnimatePresence>
          {showMobileNav && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              className={`lg:hidden ${card} border-b ${border} px-4 py-3 flex flex-wrap gap-2`}
            >
              {NAV.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => { setActiveNav(id); document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setShowMobileNav(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium ${activeNav===id?"bg-[#7A9E6E] text-white":`${subBg} ${t2}`}`}
                >
                  <Icon size={12}/> {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 lg:px-6 py-5 flex flex-col gap-6">

          {/* ── SECTION: KPIs ──────────────────────────────────── */}
          <section id="overview">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3"
              variants={cV} initial="hidden" animate="visible"
            >
              {KPIs.map((k, i) => {
                const Icon = k.icon;
                return (
                  <motion.div key={k.label} variants={dV}
                    whileHover={{ y:-2, transition:{duration:0.2} }}
                    className={`${card} rounded-2xl p-4 border ${border} flex flex-col gap-2 transition-colors duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                        <Icon size={13} style={{ color: k.color }} />
                      </div>
                      <span className={`text-[9px] font-semibold ${k.up ? "text-[#7A9E6E]" : "text-[#D4726A]"}`}>
                        {k.delta}
                      </span>
                    </div>
                    <p className={`text-xl font-bold font-mono-data ${t1}`}>
                      {k.value}{k.suffix}
                    </p>
                    <p className={`text-[9px] ${t3} leading-tight`}>{k.label}</p>
                    <Spark data={k.spark} color={k.color} h={28} />
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* ── SECTION: ESCALATIONS ─────────────────────────── */}
          {escalations.length > 0 && (
            <section>
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                className={`${card} rounded-2xl border border-[#D4726A]/50 overflow-hidden`}
              >
                <div className={`px-5 py-3 flex items-center gap-2 ${dark?"bg-[#200A0A]":"bg-[#FAECEA]"}`}>
                  <AlertTriangle size={14} className="text-[#D4726A]" />
                  <span className="text-sm font-bold text-[#D4726A]">Escalations — {escalations.length} critical/overdue</span>
                  <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.5, repeat:Infinity }}
                    className="ml-auto w-2 h-2 rounded-full bg-[#D4726A]"
                  />
                </div>
                <div className={`divide-y ${border}`}>
                  {escalations.map(issue => (
                    <div key={issue.id} className={`px-5 py-3 flex items-center gap-4 ${hoverBg} transition-all`}>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        issue.severity?.toLowerCase() === "critical"
                          ? "bg-[#FAECEA] text-[#D4726A]"
                          : dark ? "bg-[#1F1800] text-[#C8A87A]" : "bg-[#FAF0E0] text-[#C8A87A]"
                      }`}>
                        {issue.severity?.toUpperCase() || "HIGH"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${t1} truncate`}>{issue.title || issue.category}</p>
                        <p className={`text-[10px] ${t3} truncate`}>{issue.location?.address || issue.ward || "—"}</p>
                      </div>
                      <span className={`text-[10px] ${t3} whitespace-nowrap`}>{relTime(issue.reportedAt)}</span>
                      <Link href={`/issues/${issue.id}`}>
                        <motion.button whileHover={{ scale:1.05 }} className={`p-1.5 rounded-lg ${subBg} ${t2} transition-all`}>
                          <Eye size={12} />
                        </motion.button>
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>
          )}

          {/* ── SECTION: MAP + WARD RANKINGS ─────────────────── */}
          <section id="map" className="grid xl:grid-cols-5 gap-5">
            {/* Live Map */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`xl:col-span-3 ${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Map size={14} className="text-[#6A88AA]" />
                  <span className={`text-sm font-bold ${t1}`}>Live City Map</span>
                  <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ duration:2, repeat:Infinity }}
                    className="text-[9px] font-bold text-[#7A9E6E] bg-[#EAF2E6] px-2 py-0.5 rounded-full"
                  >● LIVE</motion.span>
                </div>
                <span className={`text-[10px] ${t3}`}>{issues.length} issues plotted</span>
              </div>
              <div className="p-2">
                <WardMapSVG issues={issues} dark={dark} />
              </div>
            </motion.div>

            {/* Ward Rankings */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`xl:col-span-2 ${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center gap-2`}>
                <Target size={14} className="text-[#C8A87A]" />
                <span className={`text-sm font-bold ${t1}`}>Ward Rankings</span>
              </div>
              <div className="p-4 flex flex-col gap-2.5">
                {wardRankings.length === 0 ? (
                  <p className={`text-xs ${t3} text-center py-8`}>No ward data yet</p>
                ) : wardRankings.map((w, i) => {
                  const color = w.health >= 70 ? "#7A9E6E" : w.health >= 40 ? "#C8A87A" : "#D4726A";
                  return (
                    <div key={w.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${subBg}`}>
                      <span className={`text-xs font-bold font-mono-data w-5 text-center ${t3}`}>#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-bold ${t1} truncate`}>{w.name}</p>
                          <span className="text-[10px] font-bold font-mono-data" style={{ color }}>{w.health}%</span>
                        </div>
                        <div className={`h-1 rounded-full overflow-hidden ${dark?"bg-[#30363D]":"bg-[#F0EDE8]"}`}>
                          <motion.div className="h-full rounded-full" style={{ background: color }}
                            initial={{ width:0 }} whileInView={{ width:`${w.health}%` }}
                            viewport={{ once:true }} transition={{ duration:0.8, delay:i*0.07 }}
                          />
                        </div>
                        <div className="flex gap-3 mt-1">
                          <span className={`text-[9px] ${t3}`}>{w.count} issues</span>
                          <span className={`text-[9px] ${t3}`}>{w.critical} critical</span>
                          <span className={`text-[9px] text-[#7A9E6E]`}>{w.resolved} resolved</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* ── SECTION: INCOMING REPORTS ─────────────────────── */}
          <section id="reports">
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              {/* Header + filters */}
              <div className={`px-5 py-4 border-b ${border} flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
                <div className="flex items-center gap-2.5 flex-1">
                  <div className={`w-7 h-7 rounded-xl ${dark?"bg-[#200A0A]":"bg-[#FAECEA]"} flex items-center justify-center`}>
                    <AlertTriangle size={13} className="text-[#D4726A]" />
                  </div>
                  <span className={`text-sm font-bold ${t1}`}>Incoming Reports</span>
                  <motion.span animate={{ opacity:[1,0.5,1] }} transition={{ duration:2, repeat:Infinity }}
                    className="text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full"
                  >{filteredIssues.length} reports</motion.span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={12} className={t3} />
                  {(["all","open","in_progress","assigned","resolved"] as const).map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${filterStatus===s?"bg-[#7A9E6E] text-white":`${subBg} ${t3} hover:${t2}`}`}
                    >{s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                  <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${inputBg} transition-all`}
                  >
                    <option value="all">All Depts</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${inputBg} transition-all`}
                  >
                    <option value="all">All Severity</option>
                    {["critical","high","medium","low"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Table headers */}
              <div className={`px-5 py-2 grid grid-cols-12 gap-2 text-[9px] font-bold ${t3} uppercase tracking-wider border-b ${border}`}>
                <span className="col-span-5">Issue / Location</span>
                <span className="col-span-2 text-center">Severity</span>
                <span className="col-span-2 text-center">Impact/day</span>
                <span className="col-span-2 text-center">Risk</span>
                <span className="col-span-1"/>
              </div>

              <motion.div variants={cV} initial="hidden" animate="visible" className={`divide-y ${border}`}>
                {filteredIssues.slice(0, 12).map(issue => {
                  const rawSev  = issue.aiAnalysis?.priority ? issue.aiAnalysis.priority * 10 : (issue.severity==="critical"?90:issue.severity==="high"?75:50);
                  const rawRisk = issue.aiAnalysis?.priority ? issue.aiAnalysis.priority * 10 : 70;
                  const eco     = formatINR(issue.economicImpact?.estimatedLossINR || issue.aiAnalysis?.estimatedCost || 15000);
                  const isResolved = ["resolved","closed"].includes(issue.status ?? "");
                  const statusLabel = issue.status === "in_progress" ? "In Progress" : issue.status === "assigned" ? "Assigned" : issue.status === "resolved" ? "Resolved" : "Pending";

                  return (
                    <motion.div key={issue.id} variants={rV}
                      className={`px-5 py-3.5 grid grid-cols-12 gap-2 items-center cursor-pointer transition-colors ${selectedIssue===issue.id?(dark?"bg-[#1C2128]":"bg-[#F8FAF6]"):hoverBg}`}
                      onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    >
                      <div className="col-span-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 flex-shrink-0 rounded-full self-stretch" style={{ background: rawSev>=85?"#D4726A":rawSev>=70?"#C8A87A":"#7A9E6E" }} />
                          <div>
                            <p className={`text-xs font-bold ${t1} leading-tight`}>{issue.title || issue.category}</p>
                            <p className={`text-[10px] ${t3} truncate max-w-[180px]`}>{issue.location?.address || issue.ward || "Ward Area"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-mono ${t3}`}>{issue.id.slice(0,8)}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                (issue.status==="open"||(issue.status as string)==="reported") ? (dark?"bg-[#0A1F1F] text-[#5A9E9E]":"bg-[#E4F2E2] text-[#5A9E9E]") :
                                issue.status==="assigned" ? (dark?"bg-[#0A1520] text-[#4A6888]":"bg-[#E8EFF6] text-[#4A6888]") :
                                issue.status==="in_progress" ? (dark?"bg-[#1F1800] text-[#A87840]":"bg-[#FAF0E0] text-[#A87840]") :
                                dark?"bg-[#0A1F0A] text-[#5A7A50]":"bg-[#EAF2E6] text-[#5A7A50]"
                              }`}>{statusLabel}</span>
                              <span className={`text-[9px] ${t3}`}>{relTime(issue.reportedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center"><SevBadge v={rawSev} dark={dark}/></div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-bold text-[#C8A87A] font-mono-data">{eco}/day</span>
                      </div>
                      <div className="col-span-2 flex justify-center"><SevBadge v={isResolved?0:rawRisk} dark={dark}/></div>
                      <div className="col-span-1 flex justify-end">
                        <Link href={`/issues/${issue.id}`} onClick={e => e.stopPropagation()}>
                          <motion.button whileHover={{ scale:1.1 }} className={`p-1.5 rounded-lg ${subBg} transition-all`}>
                            <Eye size={12} className={t3} />
                          </motion.button>
                        </Link>
                      </div>

                      {/* Expandable management panel */}
                      <AnimatePresence>
                        {selectedIssue === issue.id && (
                          <motion.div className="col-span-12"
                            initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                            transition={{ duration:0.25 }} onClick={e => e.stopPropagation()}
                          >
                            <div className={`mt-3 p-4 ${subBg} rounded-2xl border ${border} flex flex-col gap-3`}>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className={`text-[9px] font-bold uppercase tracking-wider ${t3}`}>Dept Assignment</label>
                                  <select value={deptMap[issue.id] ?? (issue.department || "")} onChange={e => setDeptMap(p=>({...p,[issue.id]:e.target.value}))}
                                    className={`w-full mt-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                                  >
                                    <option value="Unassigned">Unassigned</option>
                                    <option value="PWD">PWD (Roads)</option>
                                    <option value="BBMP">BBMP (Sanitation)</option>
                                    <option value="BWSSB">BWSSB (Water)</option>
                                    <option value="BESCOM">BESCOM (Electrical)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={`text-[9px] font-bold uppercase tracking-wider ${t3}`}>Status</label>
                                  <select value={statusMap[issue.id] ?? (issue.status || "")} onChange={e => setStatusMap(p=>({...p,[issue.id]:e.target.value}))}
                                    className={`w-full mt-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${inputBg}`}
                                  >
                                    <option value="open">Reported</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={`text-[9px] font-bold uppercase tracking-wider ${t3}`}>Affected Residents</label>
                                  <p className={`text-xs font-bold ${t1} mt-2`}>{(issue.economicImpact?.affectedResidents || 1000).toLocaleString("en-IN")} daily</p>
                                </div>
                                <div>
                                  <label className={`text-[9px] font-bold uppercase tracking-wider ${t3}`}>AI Score</label>
                                  <p className="text-xs font-bold text-[#7A9E6E] mt-2 font-mono-data">{issue.aiAnalysis?.confidence || 82}% confidence</p>
                                </div>
                              </div>
                              <div className={`border-t ${border} pt-3`}>
                                <label className={`text-[9px] font-bold uppercase tracking-wider ${t3}`}>Progress Log Note</label>
                                <div className="flex gap-2 mt-1">
                                  <input type="text" placeholder="Crew dispatched with bituminous patch…"
                                    value={notesMap[issue.id] ?? ""}
                                    onChange={e => setNotesMap(p=>({...p,[issue.id]:e.target.value}))}
                                    className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none placeholder-[#6E7681] ${inputBg}`}
                                  />
                                  <button onClick={() => handleUpdateIssue(issue.id)} disabled={updatingId===issue.id}
                                    className="px-4 py-2 bg-[#7A9E6E] text-white text-xs font-bold rounded-xl hover:bg-[#5A7A50] transition-all cursor-pointer disabled:opacity-50"
                                  >{updatingId===issue.id?"Saving…":"Save Log"}</button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                {filteredIssues.length === 0 && (
                  <div className={`py-12 text-center ${t3} text-sm`}>No reports match the current filters.</div>
                )}
              </motion.div>
            </motion.div>
          </section>

          {/* ── SECTION: DEPARTMENTS + RESPONSE TIME ──────────── */}
          <section id="departments" className="grid xl:grid-cols-2 gap-5">
            {/* Dept Performance */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center justify-between`}>
                <div className="flex items-center gap-2"><Building2 size={14} className="text-[#6A88AA]"/><span className={`text-sm font-bold ${t1}`}>Department Performance</span></div>
                <div className="flex gap-3">
                  {deptPerf.map(d => (
                    <DonutRing key={d.name} pct={d.score} color={d.score>=80?"#7A9E6E":d.score>=60?"#C8A87A":"#D4726A"} label={d.name} dark={dark} />
                  ))}
                </div>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {deptPerf.map((d, i) => (
                  <motion.div key={d.name} initial={{ opacity:0, x:16 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${t1}`}>{d.name}</span>
                        {d.score >= 70 ? <TrendingUp size={10} className="text-[#7A9E6E]"/> : <TrendingDown size={10} className="text-[#D4726A]"/>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] ${t3}`}>{d.resolved}/{d.total}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono-data"
                          style={{ background:d.score>=80?(dark?"#0A1F0A":"#EAF2E6"):d.score>=60?(dark?"#1F1800":"#FAF0E0"):(dark?"#200A0A":"#FAECEA"), color:d.score>=80?"#7A9E6E":d.score>=60?"#C8A87A":"#D4726A" }}
                        >{d.score}</span>
                      </div>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${dark?"bg-[#30363D]":"bg-[#F0EDE8]"}`}>
                      <motion.div className="h-full rounded-full" style={{ background:d.score>=80?"#7A9E6E":d.score>=60?"#C8A87A":"#D4726A" }}
                        initial={{ width:0 }} whileInView={{ width:`${d.total>0?(d.resolved/d.total)*100:0}%` }}
                        viewport={{ once:true }} transition={{ duration:0.9, delay:i*0.09+0.2, ease:"easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Response Time Trend */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} p-5 flex flex-col gap-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Clock size={14} className="text-[#7A9E6E]"/><span className={`text-sm font-bold ${t1}`}>Response Time Trend</span></div>
                <span className={`text-[9px] ${subBg} px-2 py-1 rounded-lg ${t3}`}>12 months</span>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className={`text-3xl font-bold font-mono-data ${t1}`}>{(cAvgH/10).toFixed(1)}h</p>
                  <div className="flex items-center gap-1 mt-1"><ArrowDownRight size={12} className="text-[#7A9E6E]"/><span className="text-xs text-[#7A9E6E] font-semibold">-0.8h vs last month</span></div>
                </div>
                <div className="flex gap-4">
                  {[["Best","2.1h","#7A9E6E"],["Avg","4.3h","#C8A87A"],["Worst","12h","#D4726A"]].map(([l,v,c]) => (
                    <div key={l}>
                      <p className={`text-[9px] ${t3}`}>{l}</p>
                      <p className="text-sm font-bold font-mono-data" style={{ color:c }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <AreaChart data={RESP_DATA} color="#7A9E6E" />
              <div className="grid grid-cols-4 gap-2">
                {DEPTS.map((d, i) => (
                  <div key={d} className={`${subBg} rounded-xl p-2.5`}>
                    <p className={`text-[9px] ${t3}`}>{d}</p>
                    <p className="text-xs font-bold font-mono-data text-[#6A88AA]">{[3.8,5.2,4.1,6.3][i]}h</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ── SECTION: ANALYTICS ────────────────────────────── */}
          <section id="analytics">
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-4 border-b ${border} flex items-center justify-between`}>
                <div className="flex items-center gap-2"><BarChart3 size={14} className="text-[#6A88AA]"/><span className={`text-sm font-bold ${t1}`}>Analytics</span></div>
                <div className="flex gap-1">
                  {(["trend","category","resolution"] as const).map(tab => (
                    <button key={tab} onClick={() => setAnalyticsTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${analyticsTab===tab?"bg-[#7A9E6E] text-white":`${subBg} ${t2}`}`}
                    >{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {analyticsTab === "trend" && (
                    <motion.div key="trend" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <p className={`text-xs ${t3} mb-4`}>Monthly issues reported over the last 12 months</p>
                      <AreaChart data={TREND_DATA} color="#6A88AA" />
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {[["Total Reported","72","#6A88AA"],["Resolved","48","#7A9E6E"],["Escalated","8","#D4726A"]].map(([l,v,c])=>(
                          <div key={l} className={`${subBg} rounded-xl p-3`}>
                            <p className={`text-[9px] ${t3}`}>{l}</p>
                            <p className="text-lg font-bold font-mono-data" style={{color:c}}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {analyticsTab === "category" && (
                    <motion.div key="category" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <p className={`text-xs ${t3} mb-4`}>Issue distribution by category</p>
                      <div className="flex flex-col gap-3">
                        {Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat, count]) => (
                          <HBar key={cat} label={cat.charAt(0).toUpperCase()+cat.slice(1)} value={count}
                            max={Math.max(...Object.values(catCounts))} color={CAT_COLORS[cat] || "#8B949E"} dark={dark} />
                        ))}
                        {Object.keys(catCounts).length === 0 && <p className={`text-xs ${t3} text-center py-8`}>No data yet</p>}
                      </div>
                    </motion.div>
                  )}
                  {analyticsTab === "resolution" && (
                    <motion.div key="resolution" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                      <p className={`text-xs ${t3} mb-4`}>Monthly resolution rate</p>
                      <AreaChart data={RESOLVE_DATA} color="#7A9E6E" />
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {["Q1","Q2","Q3","Q4"].map((q,i) => (
                          <div key={q} className={`${subBg} rounded-xl p-3`}>
                            <p className={`text-[9px] ${t3}`}>{q}</p>
                            <p className="text-sm font-bold font-mono-data text-[#7A9E6E]">{[62,71,68,79][i]}%</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>

          {/* ── SECTION: AI INSIGHTS + PREDICTIONS ───────────── */}
          <section id="predictions" className="grid xl:grid-cols-2 gap-5">
            {/* AI Insights */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center gap-2`}>
                <Sparkles size={14} className="text-[#C8A87A]"/>
                <span className={`text-sm font-bold ${t1}`}>AI Insights</span>
                <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ duration:2, repeat:Infinity }}
                  className="ml-auto text-[9px] font-bold text-[#C8A87A] bg-[#FAF0E0] px-2 py-0.5 rounded-full"
                >LIVE ANALYSIS</motion.span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {[
                  { icon: TrendingUp,    color:"#7A9E6E", title:"Resolution trend improving", body:`${resolved} issues resolved this cycle — up 18% vs previous.` },
                  { icon: AlertTriangle, color:"#D4726A", title:`${critical} critical issues need immediate action`, body:"Dispatch crews to high-risk zones to prevent economic loss." },
                  { icon: IndianRupee,   color:"#C8A87A", title:`₹${(cLossLakh/10).toFixed(1)} Cr economic exposure`, body:`₹${(cPrevLakh/10).toFixed(1)} Cr already prevented through timely resolution.` },
                  { icon: Cpu,           color:"#6A88AA", title:`AI confidence at ${cConf}%`, body:"Model confidence is high. Predictions are reliable for planning." },
                  { icon: Zap,           color:"#C8A87A", title:"Peak reporting: 9–11 AM", body:"Allocate maximum resources during morning commute window." },
                ].map(({ icon: Icon, color, title, body }, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:12 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                    className={`flex gap-3 p-3.5 rounded-xl ${subBg}`}
                  >
                    <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background:`${color}18` }}>
                      <Icon size={13} style={{ color }}/>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${t1}`}>{title}</p>
                      <p className={`text-[10px] ${t3} mt-0.5`}>{body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Prediction Panel */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center gap-2.5`}>
                <div className={`w-7 h-7 rounded-xl ${dark?"bg-[#200A0A]":"bg-[#FAECEA]"} flex items-center justify-center`}>
                  <Shield size={13} className="text-[#D4726A]"/>
                </div>
                <span className={`text-sm font-bold ${t1}`}>Predicted Infrastructure Failures</span>
                <motion.span animate={{ opacity:[1,0.5,1] }} transition={{ duration:2, repeat:Infinity }}
                  className="ml-auto text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full uppercase tracking-wide"
                >AI Forecast</motion.span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {PREDICTIONS_STATIC.map((p, i) => {
                  const r = 28; const circ = 2*Math.PI*r;
                  return (
                    <motion.div key={p.loc} initial={{ opacity:0, x:16 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                      whileHover={{ y:-1, transition:{duration:0.2} }}
                      className={`flex items-start gap-4 p-4 rounded-2xl border ${border} ${hoverBg} transition-all`}
                      style={{ background:`${p.color}06` }}
                    >
                      {/* Gauge */}
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                          <circle cx="36" cy="36" r={r} fill="none" stroke={dark?"#30363D":"#F0EDE8"} strokeWidth="6"/>
                          <motion.circle cx="36" cy="36" r={r} fill="none" stroke={p.color} strokeWidth="6"
                            strokeLinecap="round" strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            whileInView={{ strokeDashoffset: circ*(1-p.prob/100) }}
                            viewport={{ once:true }} transition={{ duration:1.2, ease:"easeOut", delay:i*0.15+0.3 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-bold font-mono-data" style={{ color:p.color }}>{p.prob}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${t1} truncate`}>{p.type}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background:`${p.color}18`, color:p.color }}>{p.prob}%</span>
                        </div>
                        <p className={`text-[10px] ${t3}`}><MapPin size={9} className="inline mr-1"/>{p.loc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark?"bg-[#30363D]":"bg-[#F0EDE8]"}`}>
                            <motion.div className="h-full rounded-full" style={{ background:p.color }}
                              initial={{ width:0 }} whileInView={{ width:`${p.prob}%` }}
                              viewport={{ once:true }} transition={{ duration:1, delay:i*0.1+0.3, ease:"easeOut" }}
                            />
                          </div>
                          <span className={`text-[9px] ${t3} flex-shrink-0`}>within <strong>{p.days}d</strong></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.5 }}
                  className={`${dark?"bg-[#200A0A]":"bg-[#FAECEA]"} rounded-2xl p-4 flex items-center gap-3`}
                >
                  <Shield size={15} className="text-[#D4726A] flex-shrink-0"/>
                  <div>
                    <p className="text-xs font-bold text-[#C04848]">3 High-Risk Zones Detected</p>
                    <p className="text-[9px] text-[#D48480]">Preventive action could save ₹1.8 Cr in repair costs</p>
                  </div>
                  <button className="ml-auto text-[9px] font-bold text-[#D4726A] border border-[#D4726A]/40 px-2.5 py-1.5 rounded-lg hover:bg-[#D4726A]/10 transition-all flex-shrink-0">
                    Schedule
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* ── SECTION: BUDGET + RESOURCE ALLOCATION ─────────── */}
          <section id="budget" className="grid xl:grid-cols-2 gap-5">
            {/* Budget & Loss */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center gap-2`}>
                <IndianRupee size={14} className="text-[#C8A87A]"/>
                <span className={`text-sm font-bold ${t1}`}>Budget & Loss Prevention</span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Total Exposure",  value:`₹${(cLossLakh/10).toFixed(1)} Cr`, color:"#D4726A" },
                    { label:"Loss Prevented",  value:`₹${(cPrevLakh/10).toFixed(1)} Cr`, color:"#7A9E6E" },
                    { label:"Active Savings",  value:"₹4.7 Cr",   color:"#6A88AA" },
                    { label:"Budget Utilized", value:"68%",       color:"#C8A87A" },
                  ].map(s => (
                    <div key={s.label} className={`${subBg} rounded-xl p-3.5`}>
                      <p className={`text-[9px] ${t3} mb-1`}>{s.label}</p>
                      <p className="text-lg font-bold font-mono-data" style={{ color:s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-1">
                  {BUDGET.map((b, i) => {
                    const pct = Math.round((b.spent / b.allocated) * 100);
                    return (
                      <motion.div key={b.dept} initial={{ opacity:0, x:12 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}>
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-bold ${t1}`}>{b.dept}</span>
                          <span className={`text-[10px] ${t3} font-mono-data`}>₹{b.spent}Cr / ₹{b.allocated}Cr ({pct}%)</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${dark?"bg-[#30363D]":"bg-[#F0EDE8]"}`}>
                          <motion.div className="h-full rounded-full" style={{ background:b.color }}
                            initial={{ width:0 }} whileInView={{ width:`${pct}%` }}
                            viewport={{ once:true }} transition={{ duration:0.9, delay:i*0.08+0.2, ease:"easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Maintenance */}
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center gap-2`}>
                <Calendar size={14} className="text-[#6A88AA]"/>
                <span className={`text-sm font-bold ${t1}`}>Upcoming Maintenance</span>
                <span className={`ml-auto text-[10px] ${t3}`}>Next 30 days</span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {[
                  { task:"Road resurfacing — MG Road",     dept:"PWD",    date:"Jul 02", priority:"high",   cost:"₹12L" },
                  { task:"Water main inspection — HSR",    dept:"BWSSB",  date:"Jul 05", priority:"medium", cost:"₹3.5L" },
                  { task:"Street light audit — Indiranagar",dept:"BESCOM", date:"Jul 08", priority:"low",   cost:"₹1.2L" },
                  { task:"Park drain clearing — Koramangala",dept:"BBMP",  date:"Jul 12", priority:"medium", cost:"₹2L" },
                  { task:"Bridge safety check — Silk Board", dept:"PWD",   date:"Jul 18", priority:"high",  cost:"₹8L" },
                ].map((m, i) => (
                  <motion.div key={m.task} initial={{ opacity:0, x:12 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${subBg}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#6A88AA]/10 flex items-center justify-center flex-shrink-0">
                      <Wrench size={13} className="text-[#6A88AA]"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-bold ${t1} truncate`}>{m.task}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] ${t3}`}>{m.dept}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          m.priority==="high"?"bg-[#FAECEA] text-[#D4726A]":m.priority==="medium"?"bg-[#FAF0E0] text-[#C8A87A]":"bg-[#EAF2E6] text-[#7A9E6E]"
                        }`}>{m.priority}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[10px] font-bold ${t1} font-mono-data`}>{m.date}</p>
                      <p className={`text-[9px] text-[#7A9E6E] font-mono-data`}>{m.cost}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ── SECTION: OFFICER ACTIVITY ─────────────────────── */}
          <section id="officers">
            <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              className={`${card} rounded-2xl border ${border} overflow-hidden`}
            >
              <div className={`px-5 py-3.5 border-b ${border} flex items-center gap-2`}>
                <UserCheck size={14} className="text-[#7A9E6E]"/>
                <span className={`text-sm font-bold ${t1}`}>Officer Activity Feed</span>
                <span className={`ml-auto text-[10px] ${t3}`}>{recentActivity.length} recent actions</span>
              </div>
              <div className="p-5">
                {recentActivity.length === 0 ? (
                  <div className="py-8 text-center">
                    <GitBranch size={24} className={`mx-auto mb-2 ${t3}`}/>
                    <p className={`text-xs ${t3}`}>No officer activity yet. Actions taken on reports will appear here.</p>
                  </div>
                ) : (
                  <motion.div variants={cV} initial="hidden" animate="visible" className="flex flex-col gap-3">
                    {recentActivity.map((a, i) => {
                      const actionColor = a.action==="resolved"?"#7A9E6E":a.action==="in_progress"?"#C8A87A":a.action==="assigned"?"#6A88AA":"#8B949E";
                      return (
                        <motion.div key={i} variants={rV} className={`flex items-start gap-3 p-3 rounded-xl ${subBg}`}>
                          <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-[11px] text-white"
                            style={{ background: actionColor }}
                          >{a.officer.slice(0,2).toUpperCase()}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-bold ${t1}`}>{a.officer}</p>
                            <p className={`text-[10px] ${t3} truncate`}>
                              Marked <span className="font-semibold" style={{ color:actionColor }}>"{a.action}"</span> → {a.issue}
                            </p>
                          </div>
                          <span className={`text-[9px] ${t3} flex-shrink-0`}>{relTime(a.time)}</span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </section>

          {/* Footer */}
          <div className={`text-center py-4 text-[10px] ${t3} border-t ${border} mt-2`}>
            CitySpellAI Authority Command Center · Zone A · All data live via Firestore
            <span className="mx-2">·</span>
            <button onClick={exportCSV} className="underline hover:text-[#7A9E6E] transition-colors">Export CSV</button>
            <span className="mx-2">·</span>
            <button onClick={() => window.print()} className="underline hover:text-[#7A9E6E] transition-colors">Print Report</button>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
}
