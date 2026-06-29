"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Loader2, MapPin, Camera, AlertTriangle, CheckCircle2,
  TrendingUp, Bell, Activity, Star, Zap, Award,
  Trophy, Flame, Shield, Users, BarChart2,
  ArrowUp, Calendar, Clock,
} from "lucide-react";
import { useUserIssues, useWardIssues } from "@/lib/hooks/useIssues";
import { useWard } from "@/lib/hooks/useWards";
import { useNotifications } from "@/lib/hooks/useNotifications";

// ── CountUp ──────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const t = setTimeout(() => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - prog, 3)) * target));
        if (prog < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function MiniBarChart({ data, color = "#7A9E6E" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full">
          <div className="flex-1 flex items-end w-full">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, background: color, transformOrigin: "bottom" }}
              className="w-full rounded-t-[3px]"
            />
          </div>
          <span className="text-[8px] text-[#9A9AA4] truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Pulse dot ─────────────────────────────────────────────────────────────────
function PulseDot({ color = "#7A9E6E" }: { color?: string }) {
  return (
    <div className="relative w-2 h-2 flex-shrink-0">
      <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />
      <div className="relative w-full h-full rounded-full" style={{ background: color }} />
    </div>
  );
}

// ── Achievement badge ──────────────────────────────────────────────────────────
interface Achievement { id: string; label: string; icon: ReactNode; unlocked: boolean }
function AchievementBadge({ a }: { a: Achievement }) {
  return (
    <div className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${a.unlocked ? "border-[#C8DFC0] bg-[#EAF2E6]" : "border-[#E4E2DC] bg-[#F8F7F4] opacity-40"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.unlocked ? "bg-[#7A9E6E]" : "bg-[#D0CCC4]"}`}>
        <div className="text-white">{a.icon}</div>
      </div>
      <span className={`text-[8px] font-semibold text-center leading-tight ${a.unlocked ? "text-[#3A6A30]" : "text-[#9A9AA4]"}`}>{a.label}</span>
      {a.unlocked && (
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D4726A] flex items-center justify-center">
          <CheckCircle2 size={8} className="text-white" />
        </div>
      )}
    </div>
  );
}

// ── Map SVG ───────────────────────────────────────────────────────────────────
function SmallMapSVG() {
  const markers = [
    { cx: 80, cy: 60, color: "#D4726A", r: 6, pulse: true },
    { cx: 150, cy: 100, color: "#D4726A", r: 5, pulse: false },
    { cx: 200, cy: 60, color: "#C8A87A", r: 5, pulse: false },
    { cx: 250, cy: 140, color: "#C8A87A", r: 4, pulse: false },
    { cx: 300, cy: 80, color: "#7A9E6E", r: 5, pulse: false },
    { cx: 120, cy: 160, color: "#7A9E6E", r: 5, pulse: false },
    { cx: 350, cy: 160, color: "#7A9E6E", r: 4, pulse: false },
    { cx: 60, cy: 140, color: "#C8A87A", r: 4, pulse: false },
  ];
  const blocks = [
    { x: 30, y: 30, w: 40, h: 30 }, { x: 90, y: 30, w: 50, h: 20 },
    { x: 160, y: 30, w: 30, h: 40 }, { x: 210, y: 30, w: 60, h: 25 },
    { x: 290, y: 30, w: 80, h: 30 }, { x: 30, y: 80, w: 30, h: 60 },
    { x: 80, y: 80, w: 60, h: 30 }, { x: 160, y: 80, w: 40, h: 50 },
    { x: 220, y: 80, w: 50, h: 30 }, { x: 290, y: 80, w: 40, h: 60 },
    { x: 350, y: 80, w: 30, h: 40 }, { x: 30, y: 160, w: 80, h: 40 },
    { x: 130, y: 150, w: 50, h: 50 }, { x: 200, y: 160, w: 70, h: 40 },
    { x: 300, y: 150, w: 80, h: 50 },
  ];
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
      </defs>
      {Array.from({ length: 11 }).map((_, i) => (
        <g key={i}>
          <line x1={i * 40} y1="0" x2={i * 40} y2="220" stroke="#E8E4DC" strokeWidth="1" />
          <line x1="0" y1={i * 22} x2="400" y2={i * 22} stroke="#E8E4DC" strokeWidth="1" />
        </g>
      ))}
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="#F0EDE8" stroke="#E4E2DC" strokeWidth="0.5" />
      ))}
      {markers.map((m, i) => (
        <g key={i}>
          {m.pulse && (
            <circle cx={m.cx} cy={m.cy} r={m.r + 5} fill={m.color} opacity="0.2">
              <animate attributeName="r" values={`${m.r + 3};${m.r + 10};${m.r + 3}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={m.cx} cy={m.cy} r={m.r} fill={m.color} />
          <circle cx={m.cx} cy={m.cy} r={m.r - 2} fill="white" opacity="0.35" />
        </g>
      ))}
      <rect x="0" y="0" width="400" height="220" fill="url(#mapFade)" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtStatus(s: string) {
  switch (s?.toLowerCase()) {
    case "open": return "Pending";
    case "assigned": return "Assigned";
    case "in_progress": return "In Progress";
    case "resolved": return "Resolved";
    case "closed": return "Closed";
    case "rejected": return "Rejected";
    default: return s || "Pending";
  }
}
function getProgress(s: string) {
  switch (s?.toLowerCase()) {
    case "open": return 10; case "assigned": return 30; case "in_progress": return 65;
    case "resolved": case "closed": case "rejected": return 100; default: return 10;
  }
}
function catEmoji(c: string) {
  switch (c?.toLowerCase()) {
    case "pothole": return "🕳️"; case "water": case "waterlogging": return "💧";
    case "streetlight": return "💡"; case "garbage": return "🗑️";
    case "sewage": return "🌊"; case "road": return "🛣️"; case "park": return "🌳";
    default: return "⚠️";
  }
}
function sevStyle(s: string) {
  switch (s?.toLowerCase()) {
    case "critical": case "high": return { color: "#D4726A", bg: "#FAECEA" };
    case "medium": return { color: "#C8A87A", bg: "#FAF0E0" };
    default: return { color: "#7A9E6E", bg: "#EAF2E6" };
  }
}
function relTime(ts: any) {
  if (!ts) return "";
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${dy}d ago`;
}
function isToday(ts: any) {
  if (!ts) return false;
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  return d.toDateString() === new Date().toDateString();
}

const CAT_COLORS: Record<string, string> = {
  pothole: "#D4726A", water: "#6A88AA", streetlight: "#C8A87A",
  garbage: "#9A9C5E", sewage: "#5E9E9E", road: "#C8A87A", park: "#7A9E6E", other: "#9A9AA4",
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function CitizenDashboard() {
  const { isAuthenticated, profile, loading, user } = useAuthContext();
  const router = useRouter();
  const [wardDetail, setWardDetail] = useState<any>(null);
  const [clock, setClock] = useState(new Date());

  const { issues: userIssues } = useUserIssues(user?.uid || null);
  const { issues: wardIssues } = useWardIssues(profile?.wardId || null);
  const { ward } = useWard(profile?.wardId || null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.uid || null);

  // ── Derived values (computed before hooks that need them as targets) ────────
  const openCount = wardIssues.filter(i => ["open", "assigned", "in_progress"].includes(i.status?.toLowerCase())).length;
  const resolvedCount = wardIssues.filter(i => ["resolved", "closed"].includes(i.status?.toLowerCase())).length;
  const criticalCount = wardIssues.filter(i => i.severity?.toLowerCase() === "critical" && !["resolved", "closed", "rejected"].includes(i.status?.toLowerCase())).length;

  const todayNew = wardIssues.filter(i => isToday(i.reportedAt)).length;
  const todayRes = wardIssues.filter(i => isToday(i.resolvedAt)).length;
  const todayMine = userIssues.filter(i => isToday(i.reportedAt)).length;
  const todaySave = wardIssues.filter(i => isToday(i.resolvedAt)).reduce((a, i) => a + (i.economicImpact?.estimatedLossINR || 0), 0);

  const repScore = profile?.stats?.reputationScore ?? 0;
  const reported = profile?.stats?.issuesReported ?? userIssues.length;
  const resolved_cnt = profile?.stats?.issuesResolved ?? 0;

  const baseHealth = ward?.healthScore ?? 78;
  const activeCrit = wardIssues.filter(i => i.severity?.toLowerCase() === "critical" && ["open", "assigned", "in_progress"].includes(i.status?.toLowerCase())).length;
  const activeOther = wardIssues.filter(i => i.severity?.toLowerCase() !== "critical" && ["open", "assigned", "in_progress"].includes(i.status?.toLowerCase())).length;
  const healthScore = Math.max(0, Math.min(100, baseHealth - activeCrit * 5 - activeOther));
  const healthColor = healthScore >= 70 ? "#7A9E6E" : healthScore >= 50 ? "#C8A87A" : "#D4726A";
  const healthLabel = healthScore >= 80 ? "Excellent" : healthScore >= 70 ? "Good" : healthScore >= 50 ? "Fair" : "Critical";

  const resolvedWithTime = wardIssues.filter(i => ["resolved", "closed"].includes(i.status?.toLowerCase()) && i.resolvedAt && i.reportedAt);
  let avgHours = 0;
  if (resolvedWithTime.length > 0) {
    const ms = resolvedWithTime.reduce((a, c) => {
      const rep = typeof c.reportedAt.toDate === "function" ? c.reportedAt.toDate().getTime() : new Date(c.reportedAt as any).getTime();
      const res = typeof c.resolvedAt!.toDate === "function" ? c.resolvedAt!.toDate().getTime() : new Date(c.resolvedAt! as any).getTime();
      return a + (res - rep);
    }, 0);
    avgHours = ms / (3600000 * resolvedWithTime.length);
  }

  const contribScore = reported * 10 + resolved_cnt * 25 + Math.min(repScore, 200);
  const contribLevel = contribScore >= 500 ? "Platinum" : contribScore >= 200 ? "Gold" : contribScore >= 100 ? "Silver" : "Bronze";
  const contribColor = contribScore >= 500 ? "#9A8878" : contribScore >= 200 ? "#C8A87A" : "#9A9AA4";

  const reporterCounts: Record<string, number> = {};
  wardIssues.forEach(i => { if (i.reportedBy) reporterCounts[i.reportedBy] = (reporterCounts[i.reportedBy] || 0) + 1; });
  const leaderboard = Object.entries(reporterCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([uid, count], idx) => ({
      rank: idx + 1, uid, count, isMe: uid === user?.uid,
      name: uid === user?.uid ? (profile?.displayName || profile?.name || "You") : `Citizen ${uid.slice(0, 4).toUpperCase()}`,
    }));
  const myRank = leaderboard.findIndex(l => l.isMe) + 1;

  const trending = [...wardIssues]
    .filter(i => ["open", "assigned", "in_progress"].includes(i.status?.toLowerCase()))
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 5);

  const nearby = [...wardIssues]
    .filter(i => ["open", "assigned", "in_progress"].includes(i.status?.toLowerCase()))
    .sort((a, b) => (b.reportedAt?.toDate?.()?.getTime?.() ?? 0) - (a.reportedAt?.toDate?.()?.getTime?.() ?? 0))
    .slice(0, 6);

  const catBreakdown = wardIssues.reduce((acc, i) => {
    const c = i.category || "other"; acc[c] = (acc[c] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  const last7 = Array.from({ length: 7 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); return d; });
  const weekTrend = last7.map(day => ({
    label: day.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2),
    value: wardIssues.filter(i => { const d = i.reportedAt?.toDate?.() ?? (i.reportedAt ? new Date(i.reportedAt as any) : null); return d && d.toDateString() === day.toDateString(); }).length,
  }));

  const photos = userIssues
    .filter(i => i.imageUrl || i.images?.[0])
    .slice(0, 6)
    .map(i => ({ id: i.id, url: i.imageUrl || i.images![0], type: i.title || i.category, status: fmtStatus(i.status) }));

  const achievements: Achievement[] = [
    { id: "first", label: "First Report", icon: <Camera size={14} />, unlocked: reported >= 1 },
    { id: "active", label: "Active Citizen", icon: <Zap size={14} />, unlocked: reported >= 5 },
    { id: "hero", label: "Community Hero", icon: <Shield size={14} />, unlocked: reported >= 10 },
    { id: "champion", label: "Ward Champion", icon: <Trophy size={14} />, unlocked: reported >= 20 },
    { id: "streak", label: "On a Streak", icon: <Flame size={14} />, unlocked: todayMine > 0 },
    { id: "star", label: "Top Voter", icon: <Star size={14} />, unlocked: repScore >= 50 },
  ];

  // ── All useCountUp calls (top-level, before early return) ──────────────────
  const aTodayNew  = useCountUp(todayNew,   900, 300);
  const aTodayRes  = useCountUp(todayRes,   900, 400);
  const aTodayMine = useCountUp(todayMine,  900, 500);
  const aSavings   = useCountUp(Math.floor(todaySave / 1000), 900, 600);
  const aContrib   = useCountUp(contribScore, 1400, 300);
  const aRep       = useCountUp(repScore,   1200, 400);
  const aReported  = useCountUp(reported,   1000, 200);
  const aOpen      = useCountUp(openCount,  900,  200);
  const aResolved  = useCountUp(resolvedCount, 900, 250);
  const aCritical  = useCountUp(criticalCount, 900, 300);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
    else if (!loading && isAuthenticated && profile && profile.role !== "citizen") router.push("/authority-dashboard");
  }, [isAuthenticated, profile, loading, router]);

  useEffect(() => {
    if (profile?.wardId) {
      import("@/lib/services/wardService").then(({ getWard }) => {
        getWard(profile.wardId).then(w => { if (w) setWardDetail(w); });
      });
    }
  }, [profile?.wardId]);

  if (loading || !isAuthenticated || (profile && profile.role !== "citizen")) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 space-y-5">
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded shimmer-bg" />
              <div className="h-8 w-48 rounded-lg shimmer-bg" />
              <div className="h-3 w-36 rounded shimmer-bg" />
            </div>
            <div className="h-9 w-28 rounded-xl shimmer-bg" />
          </div>
          {/* KPI grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#E4E2DC] p-5 space-y-3">
                <div className="h-3 w-20 rounded shimmer-bg" />
                <div className="h-8 w-16 rounded-lg shimmer-bg" />
                <div className="h-2 w-full rounded-full shimmer-bg" />
              </div>
            ))}
          </div>
          {/* Content skeleton */}
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E2DC] p-6 h-56 shimmer-bg" />
            <div className="bg-white rounded-2xl border border-[#E4E2DC] p-6 h-56 shimmer-bg" />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[0,1].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#E4E2DC] p-6 h-40 shimmer-bg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hour = clock.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 space-y-5">

        {/* ─── HEADER ──────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9A9AA4] uppercase tracking-widest mb-0.5">{greeting}</p>
            <h1 className="text-3xl font-serif text-[#1A1A1C]">{profile?.displayName || profile?.name || user?.displayName || "Citizen"}</h1>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <span className="text-sm text-[#9A9AA4]">
                {wardDetail ? `Ward ${wardDetail.wardNumber} · ${wardDetail.name}, ${wardDetail.city}` : profile?.wardId || "General Ward"}
              </span>
              <span className="text-[#D0CCC4]">·</span>
              <div className="flex items-center gap-1.5"><PulseDot /><span className="text-xs text-[#7A9E6E] font-medium">Live</span></div>
              <span className="text-[#D0CCC4]">·</span>
              <span className="text-xs font-mono text-[#9A9AA4]">{clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => markAllRead()} className="relative p-2.5 bg-white rounded-xl border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all">
              <Bell size={15} className="text-[#5A5A62]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4726A] text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <Link href="/my-complaints" className="flex items-center gap-2 px-3.5 py-2.5 bg-white text-[#1A1A1C] rounded-xl text-sm font-medium border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all">
              <Activity size={14} /> My Issues
            </Link>
            <Link href="/report" className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1A1A1C] text-white rounded-xl text-sm font-medium hover:bg-[#2C2C2E] transition-all shadow-sm">
              <Camera size={14} /> Report Issue
            </Link>
          </div>
        </motion.div>

        {/* ─── TODAY'S REPORT ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="relative overflow-hidden bg-[#1A1A1C] rounded-2xl p-6">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#7A9E6E] opacity-[0.07] blur-3xl translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-[#D4726A] opacity-[0.07] blur-3xl -translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#7A9E6E]/20 flex items-center justify-center">
                <Calendar size={14} className="text-[#7A9E6E]" />
              </div>
              <div>
                <p className="text-[9px] text-[#9A9AA4] font-semibold tracking-widest uppercase">Today's Report</p>
                <p className="text-sm text-white font-medium">
                  {clock.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <PulseDot color="#7A9E6E" />
              <span className="text-[9px] text-[#7A9E6E] font-semibold uppercase tracking-wider">Auto-updating</span>
            </div>
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "New Issues", val: aTodayNew,  icon: <AlertTriangle size={11} />, color: "#D4726A", suffix: "" },
              { label: "Resolved Today", val: aTodayRes, icon: <CheckCircle2 size={11} />, color: "#7A9E6E", suffix: "" },
              { label: "You Reported", val: aTodayMine, icon: <Camera size={11} />, color: "#C8A87A", suffix: "" },
              { label: "₹ Savings", val: aSavings, icon: <TrendingUp size={11} />, color: "#6A88AA", suffix: "K" },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-2" style={{ color: m.color }}>
                  {m.icon}
                  <span className="text-[9px] font-semibold uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-3xl font-bold text-white tabular-nums">{m.val}{m.suffix}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── WARD HEALTH + CONTRIBUTION + REPUTATION ─────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Ward Health */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-[#E4E2DC]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold text-[#9A9AA4] uppercase tracking-wide">Ward Health</span>
              <span className="text-[9px] font-semibold px-2 py-1 rounded-full"
                style={{ background: healthColor + "20", color: healthColor }}>{healthLabel}</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F0EDE8" strokeWidth="7" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke={healthColor}
                    strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - healthScore / 100) }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#1A1A1C]">{healthScore}</span>
                  <span className="text-[9px] text-[#9A9AA4]">/100</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: "Open", value: aOpen, color: "#D4726A" },
                  { label: "Critical", value: aCritical, color: "#D4726A" },
                  { label: "Resolved", value: aResolved, color: "#7A9E6E" },
                  { label: "Avg. Fix", value: avgHours > 0 ? `${avgHours.toFixed(1)}h` : "—", color: "#C8A87A" },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9A9AA4]">{m.label}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#F5F4F1] pt-3">
              <p className="text-[9px] text-[#9A9AA4] uppercase tracking-wide mb-2">Issues this week</p>
              <MiniBarChart data={weekTrend} color={healthColor} />
            </div>
          </motion.div>

          {/* Contribution Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
            className="bg-white rounded-2xl p-5 border border-[#E4E2DC]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold text-[#9A9AA4] uppercase tracking-wide">Contribution Score</span>
              <span className="text-[9px] font-bold px-2 py-1 rounded-full"
                style={{ background: contribColor + "20", color: contribColor }}>{contribLevel}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: contribColor + "20" }}>
                <Trophy size={22} style={{ color: contribColor }} />
              </div>
              <div>
                <p className="text-4xl font-bold text-[#1A1A1C] tabular-nums">{aContrib}</p>
                <p className="text-[10px] text-[#9A9AA4]">civic points</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              {[
                { label: "Issues Reported", pts: reported * 10, color: "#7A9E6E" },
                { label: "Issues Resolved", pts: resolved_cnt * 25, color: "#C8A87A" },
                { label: "Reputation Bonus", pts: Math.min(repScore, 200), color: "#6A88AA" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-[#F5F4F1] last:border-0">
                  <span className="text-[10px] text-[#5A5A62]">{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>+{s.pts}</span>
                </div>
              ))}
            </div>
            {myRank > 0 && (
              <div className="bg-[#F8F7F4] rounded-xl p-3 flex items-center justify-between">
                <span className="text-[10px] text-[#9A9AA4]">Ward Rank</span>
                <span className="text-sm font-bold text-[#1A1A1C]">#{myRank} of {Object.keys(reporterCounts).length}</span>
              </div>
            )}
          </motion.div>

          {/* Citizen Reputation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="bg-white rounded-2xl p-5 border border-[#E4E2DC]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold text-[#9A9AA4] uppercase tracking-wide">Citizen Reputation</span>
              <Star size={13} className="text-[#C8A87A]" fill="#C8A87A" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F0EDE8" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#C8A87A"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - Math.min(repScore, 100) / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#1A1A1C] tabular-nums">{aRep}</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1A1A1C] tabular-nums">{aReported}</p>
                <p className="text-[10px] text-[#9A9AA4]">issues reported</p>
                <p className="text-[10px] text-[#7A9E6E] font-medium mt-0.5">{resolved_cnt} resolved</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {achievements.slice(0, 3).map(a => <AchievementBadge key={a.id} a={a} />)}
            </div>
          </motion.div>
        </div>

        {/* ─── ACHIEVEMENTS ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="bg-white rounded-2xl p-5 border border-[#E4E2DC]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={14} className="text-[#C8A87A]" />
              <span className="text-sm font-semibold text-[#1A1A1C]">Achievements</span>
            </div>
            <span className="text-xs text-[#9A9AA4]">{achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {achievements.map(a => <AchievementBadge key={a.id} a={a} />)}
          </div>
        </motion.div>

        {/* ─── ISSUE TIMELINE + TRENDING ───────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Issue Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#7A9E6E]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Issue Timeline</span>
              </div>
              <Link href="/my-complaints" className="text-xs text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors">View all</Link>
            </div>
            <div className="divide-y divide-[#F5F4F1] overflow-y-auto" style={{ maxHeight: 380 }}>
              {userIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <Camera size={32} className="text-[#D0CCC4] mb-3" />
                  <p className="text-sm text-[#9A9AA4]">No issues reported yet.</p>
                  <Link href="/report" className="text-xs text-[#7A9E6E] mt-2 font-medium hover:underline">Report your first issue →</Link>
                </div>
              ) : userIssues.map((issue, idx) => {
                const prog = getProgress(issue.status);
                const sv = sevStyle(issue.severity);
                return (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                    <div className="px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: sv.bg }}>{catEmoji(issue.category)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-[#1A1A1C] truncate">{issue.title || issue.category}</p>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: sv.bg, color: sv.color }}>{fmtStatus(issue.status)}</span>
                          </div>
                          <p className="text-[10px] text-[#9A9AA4] truncate mb-2">
                            {issue.location?.address || "Ward location"} · {relTime(issue.reportedAt)}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-[#F0EDE8] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${prog}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + idx * 0.04 }}
                                className="h-full rounded-full"
                                style={{ background: prog === 100 ? "#7A9E6E" : prog > 50 ? "#C8A87A" : "#6A88AA" }}
                              />
                            </div>
                            <span className="text-[9px] text-[#9A9AA4] font-mono w-7 text-right">{prog}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="px-5 py-3.5 border-t border-[#F5F4F1]">
              <Link href="/report" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#D0CCC4] text-sm text-[#9A9AA4] hover:text-[#5A5A62] hover:border-[#B8B4AC] hover:bg-[#F8F7F4] transition-all">
                <Camera size={13} /> Report a new issue
              </Link>
            </div>
          </motion.div>

          {/* Trending Issues */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-[#D4726A]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Trending Issues</span>
              </div>
              <span className="text-[9px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-1 rounded-full">By upvotes</span>
            </div>
            <div className="divide-y divide-[#F5F4F1] flex-1">
              {trending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <TrendingUp size={32} className="text-[#D0CCC4] mb-3" />
                  <p className="text-sm text-[#9A9AA4]">No active issues in ward.</p>
                </div>
              ) : trending.map((issue, idx) => {
                const sv = sevStyle(issue.severity);
                return (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                    <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#FAFAF8] transition-colors">
                      <span className="text-sm font-bold text-[#D0CCC4] w-5 flex-shrink-0 text-center">#{idx + 1}</span>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: sv.bg }}>{catEmoji(issue.category)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1C] truncate">{issue.title || issue.category}</p>
                        <p className="text-[10px] text-[#9A9AA4] truncate">{issue.location?.address || "Ward location"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <ArrowUp size={10} className="text-[#D4726A]" />
                          <span className="text-xs font-bold text-[#D4726A]">{issue.upvotes || 0}</span>
                        </div>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: sv.bg, color: sv.color }}>{issue.severity}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[#F5F4F1]">
              <Link href="/map" className="w-full flex items-center justify-center gap-1.5 text-xs text-[#7A9E6E] hover:text-[#5A7A50] font-medium transition-colors py-1">
                <MapPin size={11} /> View all on map
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ─── NEARBY + NOTIFICATIONS ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Nearby Issues */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#7A9E6E]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Nearby Issues</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PulseDot /><span className="text-[9px] text-[#7A9E6E] font-semibold uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="h-28 bg-[#F8F7F4] border-b border-[#F5F4F1] relative overflow-hidden">
              <SmallMapSVG />
              <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/90 rounded-lg px-2 py-1 text-[8px]">
                {[{ c: "#D4726A", l: "Critical" }, { c: "#C8A87A", l: "Medium" }, { c: "#7A9E6E", l: "Low" }].map(l => (
                  <div key={l.l} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.c }} />
                    <span className="text-[#5A5A62]">{l.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[#F5F4F1] overflow-y-auto" style={{ maxHeight: 240 }}>
              {nearby.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#9A9AA4]">All clear nearby!</div>
              ) : nearby.map(issue => {
                const sv = sevStyle(issue.severity);
                return (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                    <div className="px-5 py-3 flex items-center gap-3 hover:bg-[#FAFAF8] transition-colors">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: sv.bg }}>{catEmoji(issue.category)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1A1A1C] truncate">{issue.title || issue.category}</p>
                        <p className="text-[10px] text-[#9A9AA4] truncate">{issue.location?.address || "Ward"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: sv.bg, color: sv.color }}>{fmtStatus(issue.status)}</span>
                        <span className="text-[9px] text-[#C0BDB6]">{relTime(issue.reportedAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[#F5F4F1] text-center">
              <Link href="/map" className="text-xs text-[#7A9E6E] hover:text-[#5A7A50] font-medium transition-colors">See full ward map →</Link>
            </div>
          </motion.div>

          {/* Recent Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-[#6A88AA]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Recent Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead()}
                    className="text-[10px] text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors">
                    Mark all read
                  </button>
                )}
                <span className="text-[9px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-1 rounded-full">{unreadCount} new</span>
              </div>
            </div>
            <div className="divide-y divide-[#F5F4F1] overflow-y-auto" style={{ maxHeight: 400 }}>
              <AnimatePresence initial={false}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14">
                    <Bell size={32} className="text-[#D0CCC4] mb-3" />
                    <p className="text-sm text-[#9A9AA4]">No notifications yet.</p>
                  </div>
                ) : notifications.slice(0, 12).map(notif => (
                  <motion.div key={notif.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <button onClick={() => markRead(notif.id)}
                      className={`w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-[#FAFAF8] transition-colors ${!notif.read ? "bg-[#EAF2E6]/40" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${!notif.read ? "bg-[#7A9E6E]" : "bg-[#E4E2DC]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A1C]">{notif.title}</p>
                        <p className="text-[10px] text-[#9A9AA4] mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-[#C0BDB6] mt-1">{relTime(notif.createdAt)}</p>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ─── LEADERBOARD + CATEGORY CHART ────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#C8A87A]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Ward Leaderboard</span>
              </div>
              <span className="text-[9px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-1 rounded-full">{wardIssues.length} total issues</span>
            </div>
            <div className="divide-y divide-[#F5F4F1]">
              {leaderboard.length === 0 ? (
                <div className="py-12 flex flex-col items-center">
                  <Trophy size={28} className="text-[#D0CCC4] mb-2" />
                  <p className="text-sm text-[#9A9AA4]">Be the first to report!</p>
                </div>
              ) : leaderboard.map((entry, idx) => (
                <motion.div key={entry.uid}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.06 }}
                  className={`px-5 py-3.5 flex items-center gap-3 ${entry.isMe ? "bg-[#EAF2E6]/40" : "hover:bg-[#FAFAF8]"} transition-colors`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: idx === 0 ? "#C8A87A" : idx === 1 ? "#B0B0B8" : idx === 2 ? "#C89A6A" : "#F0EDE8", color: idx < 3 ? "white" : "#9A9AA4" }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${entry.isMe ? "text-[#3A6A30]" : "text-[#1A1A1C]"}`}>
                      {entry.name}
                      {entry.isMe && <span className="ml-1.5 text-[8px] bg-[#EAF2E6] text-[#3A6A30] px-1.5 py-0.5 rounded-full font-bold">You</span>}
                    </p>
                    <p className="text-[10px] text-[#9A9AA4]">{entry.count} issue{entry.count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1A1A1C] tabular-nums">{entry.count * 10}</p>
                    <p className="text-[9px] text-[#9A9AA4]">pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {!leaderboard.find(l => l.isMe) && leaderboard.length > 0 && (
              <div className="px-5 py-3 border-t border-[#F5F4F1] bg-[#FAFAF8]">
                <Link href="/report" className="text-xs text-[#7A9E6E] font-medium hover:underline">Report issues to join the leaderboard →</Link>
              </div>
            )}
          </motion.div>

          {/* Category Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-[#6A88AA]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Issue Categories</span>
              </div>
              <span className="text-[9px] text-[#9A9AA4]">{wardIssues.length} issues</span>
            </div>
            {Object.keys(catBreakdown).length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-[#9A9AA4]">No data yet</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, count], idx) => {
                  const maxCnt = Math.max(...Object.values(catBreakdown));
                  const pct = Math.round((count / maxCnt) * 100);
                  const color = CAT_COLORS[cat] || "#9A9AA4";
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-sm w-5 text-center">{catEmoji(cat)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-[#5A5A62] capitalize">{cat}</span>
                          <span className="text-xs font-bold text-[#1A1A1C]">{count}</span>
                        </div>
                        <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + idx * 0.07 }}
                            className="h-full rounded-full" style={{ background: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border-t border-[#F5F4F1] pt-4 mt-4">
              <p className="text-[9px] text-[#9A9AA4] uppercase tracking-wide mb-2">7-day trend</p>
              <MiniBarChart data={weekTrend} color="#6A88AA" />
            </div>
          </motion.div>
        </div>

        {/* ─── RECENT PHOTOS ────────────────────────────────────────────────── */}
        {photos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-[#D4726A]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Recent Photos</span>
              </div>
              <Link href="/my-complaints" className="text-xs text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors">View all</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {photos.map((photo, idx) => (
                <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.34 + idx * 0.04 }}>
                  <Link href={`/issues/${photo.id}`}
                    className="block relative group rounded-xl overflow-hidden bg-[#F0EDE8] border border-[#E4E2DC]" style={{ aspectRatio: "1" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.type} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[9px] text-white font-medium truncate">{photo.type}</span>
                    </div>
                    <div className="absolute top-1.5 right-1.5">
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded"
                        style={{
                          background: photo.status === "Resolved" ? "#7A9E6E" : photo.status === "In Progress" ? "#C8A87A" : "#D4726A",
                          color: "white",
                        }}>
                        {photo.status === "In Progress" ? "IP" : photo.status.slice(0, 3)}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── QUICK ACTIONS ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#C8A87A]" />
            <span className="text-sm font-semibold text-[#1A1A1C]">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Camera,     label: "Report Issue", sub: "Upload a photo",     href: "/report",        bg: "#1A1A1C", iconColor: "white",    textColor: "white"    },
              { icon: MapPin,     label: "Ward Map",     sub: "Ward intelligence",  href: "/map",           bg: "#EAF2E6", iconColor: "#7A9E6E",  textColor: "#1A1A1C"  },
              { icon: Activity,   label: "My Issues",    sub: "Track complaints",   href: "/my-complaints", bg: "#E8EFF6", iconColor: "#6A88AA",  textColor: "#1A1A1C"  },
              { icon: Star,       label: "Rate Service", sub: "Give feedback",      href: "/my-complaints", bg: "#FAF0E0", iconColor: "#C8A87A",  textColor: "#1A1A1C"  },
            ].map((action, i) => {
              const Icon = action.icon;
              const isDark = action.bg === "#1A1A1C";
              return (
                <motion.div key={action.label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 + i * 0.05 }}
                  whileHover={{ y: -2 }}>
                  <Link href={action.href}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-[#E4E2DC] hover:shadow-md transition-all"
                    style={{ background: action.bg }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)" }}>
                      <Icon size={17} style={{ color: action.iconColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: action.textColor }}>{action.label}</p>
                      <p className="text-[10px] text-[#9A9AA4]">{action.sub}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
