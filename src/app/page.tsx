"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import {
  motion, useScroll, useTransform, useInView, AnimatePresence,
} from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Camera, Brain, TrendingUp, CheckCircle2, MapPin, AlertTriangle,
  Zap, BarChart3, Shield, ArrowRight, Activity, IndianRupee,
  GitBranch, Eye, Bell, Sparkles, Clock, Cpu,
} from "lucide-react";

/* ─── COUNTER HOOK ─────────────────────────────────────── */
function useCounter(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - pct, 3)) * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);
  return { value, ref };
}

/* ─── HEATMAP ──────────────────────────────────────────── */
const heatData = [
  [0.1,0.2,0.3,0.6,0.8,0.9,0.7,0.5,0.3,0.2,0.1,0.1],
  [0.2,0.3,0.5,0.8,0.95,0.9,0.8,0.6,0.4,0.2,0.1,0.1],
  [0.2,0.4,0.6,0.85,1.0,0.9,0.75,0.5,0.35,0.2,0.15,0.1],
  [0.1,0.3,0.5,0.7,0.85,0.8,0.65,0.45,0.3,0.2,0.1,0.1],
  [0.1,0.2,0.3,0.5,0.6,0.65,0.5,0.35,0.25,0.15,0.1,0.1],
  [0.1,0.1,0.2,0.3,0.4,0.45,0.35,0.25,0.2,0.1,0.1,0.05],
  [0.05,0.1,0.15,0.2,0.25,0.3,0.25,0.15,0.1,0.08,0.05,0.05],
  [0.05,0.05,0.1,0.15,0.2,0.2,0.15,0.1,0.08,0.05,0.05,0.05],
];
function heatColor(v: number) {
  if (v < 0.25) return `rgba(122,158,110,${v * 2.8})`;
  if (v < 0.6)  return `rgba(200,168,122,${v * 1.6})`;
  return `rgba(212,114,106,${v * 0.9 + 0.1})`;
}

/* ─── TICKER DATA ──────────────────────────────────────── */
const tickerEvents = [
  { icon: "🔴", text: "Bridge structural anomaly · Silk Board Junction, Ward 45 → AI Risk Score: 97" },
  { icon: "🟡", text: "Waterlogging reported · HSR Layout Sector 3 → BBMP agent routing" },
  { icon: "🟢", text: "Road pothole patched · MG Road Ward 14 → Closed in 3.8h — ₹41K saved" },
  { icon: "🔴", text: "Sewage overflow detected · Koramangala 80ft Road → BWSSB alerted" },
  { icon: "🟡", text: "Streetlight failure · Indiranagar 12th Main → BESCOM dispatched" },
  { icon: "🟢", text: "Tree fall cleared · Jayanagar 4th Block → Resolved in 2.1h" },
  { icon: "🔴", text: "Road collapse risk predicted · Whitefield · 14 days to failure" },
  { icon: "🟡", text: "Garbage overflow · Shivajinagar market → BBMP-S en route" },
];

/* ─── PROCESSING STAGES (hero strip) ──────────────────── */
const PROCESSING_STAGES = [
  { icon: Camera,       label: "Vision AI",   text: "Photo received · analyzing frame", progress: 15, color: "#6A88AA" },
  { icon: Eye,          label: "Vision AI",   text: "Pothole detected · 94.3% conf.",   progress: 32, color: "#7A9E6E" },
  { icon: AlertTriangle,label: "Severity AI", text: "Severity: HIGH · Risk score: 78",  progress: 52, color: "#D4726A" },
  { icon: IndianRupee,  label: "Economic AI", text: "Impact: ₹52,000 / day",             progress: 70, color: "#C8A87A" },
  { icon: GitBranch,    label: "Routing AI",  text: "PWD Officer A12 · auto-assigned",  progress: 86, color: "#9A9C5E" },
  { icon: CheckCircle2, label: "Authority",   text: "Alert sent · ₹41K saved · 4.2h",   progress: 100, color: "#7A9E6E" },
];

/* ─── PIPELINE STEPS ───────────────────────────────────── */
const PIPELINE_STEPS = [
  { n:"01", icon: Camera,       title: "Photo Upload",    detail: "Citizen photographs the issue and submits via app.", preview: "Ward 14 · 4.2MB · just now", color: "#6A88AA", bg: "#E8EFF6" },
  { n:"02", icon: Eye,          title: "Vision AI",       detail: "Computer vision classifies issue type with 94% accuracy.", preview: "Pothole · 94.3% confidence", color: "#7A9E6E", bg: "#EAF2E6" },
  { n:"03", icon: IndianRupee,  title: "Economic AI",     detail: "Calculates daily traffic loss and infrastructure cost.", preview: "₹52,000/day · 420m impact", color: "#C8A87A", bg: "#FAF0E0" },
  { n:"04", icon: GitBranch,    title: "Routing AI",      detail: "Selects optimal department based on load and issue type.", preview: "PWD · Officer A12 · ETA 4.2h", color: "#9A9C5E", bg: "#F2F3E0" },
  { n:"05", icon: Bell,         title: "Authority Alert", detail: "Officer receives rich notification with full AI analysis.", preview: "SMS + App · 2.3s total", color: "#D4726A", bg: "#FAECEA" },
];

/* ─── WARD DATA ────────────────────────────────────────── */
const WARDS = [
  { id: "W05",  name: "Hebbal",       score: 71, risk: "LOW",      incidents: 4,  predicted: 1 },
  { id: "W29",  name: "Rajajinagar",  score: 68, risk: "MEDIUM",   incidents: 5,  predicted: 2 },
  { id: "W14",  name: "Indiranagar",  score: 82, risk: "LOW",      incidents: 3,  predicted: 1 },
  { id: "W35",  name: "Whitefield",   score: 38, risk: "HIGH",     incidents: 14, predicted: 7 },
  { id: "W33",  name: "Shivajinagar", score: 52, risk: "MEDIUM",   incidents: 9,  predicted: 3 },
  { id: "W22",  name: "MG Road",      score: 74, risk: "LOW",      incidents: 3,  predicted: 1 },
  { id: "W44",  name: "Koramangala",  score: 58, risk: "MEDIUM",   incidents: 8,  predicted: 2 },
  { id: "W76",  name: "Marathahalli", score: 49, risk: "MEDIUM",   incidents: 9,  predicted: 4 },
  { id: "W11",  name: "Jayanagar",    score: 74, risk: "LOW",      incidents: 4,  predicted: 1 },
  { id: "W21",  name: "HSR Layout",   score: 61, risk: "MEDIUM",   incidents: 8,  predicted: 3 },
  { id: "W45",  name: "Silk Board",   score: 24, risk: "CRITICAL", incidents: 19, predicted: 11 },
  { id: "W08",  name: "BTM Layout",   score: 58, risk: "MEDIUM",   incidents: 8,  predicted: 4 },
];

/* ─── PREDICTIONS ──────────────────────────────────────── */
const PREDICTIONS = [
  { type: "Bridge Structural Failure", location: "Silk Board Junction, Ward 45", probability: 83, days: "8–12 days", preventive: "₹2.4L", damage: "₹48L", color: "#D4726A", trend: [12,22,34,47,58,68,76,83] },
  { type: "Road Surface Collapse",     location: "Whitefield IT Corridor, Ward 35", probability: 72, days: "10–16 days", preventive: "₹1.2L", damage: "₹22L", color: "#C8A87A", trend: [8,15,24,35,48,58,65,72] },
  { type: "Water Main Burst",          location: "Rajajinagar Zone 3, Ward 29", probability: 67, days: "14–21 days", preventive: "₹84K", damage: "₹12L", color: "#6A88AA", trend: [6,14,22,32,44,52,60,67] },
];

/* ─── SCORE COLOR ──────────────────────────────────────── */
function scoreColor(s: number) {
  if (s >= 70) return "#7A9E6E";
  if (s >= 50) return "#C8A87A";
  if (s >= 35) return "#D4726A";
  return "#B85050";
}
function riskColor(r: string) {
  if (r === "CRITICAL") return "#D4726A";
  if (r === "HIGH")     return "#C87A3A";
  if (r === "MEDIUM")   return "#C8A87A";
  return "#7A9E6E";
}

/* ═══════════════════════════════════════════════════════════
   LIVE INTELLIGENCE CANVAS (hero right panel)
═══════════════════════════════════════════════════════════ */
function LiveIntelligenceCanvas() {
  const [issueCount, setIssueCount]       = useState(247);
  const [agentStatus, setAgentStatus]     = useState(0);
  const [stageIdx, setStageIdx]           = useState(0);
  const [liveMarkers, setLiveMarkers]     = useState([
    { id: 1, x: "22%", y: "35%", color: "#D4726A", size: 6 },
    { id: 2, x: "45%", y: "28%", color: "#C8A87A", size: 5 },
    { id: 3, x: "68%", y: "55%", color: "#D4726A", size: 5 },
  ]);

  const statuses = ["8 agents active", "Processing 3 issues", "₹52K impact computed", "PWD notified"];

  useEffect(() => {
    const t1 = setInterval(() => setIssueCount(c => c + (Math.random() > 0.65 ? 1 : 0)), 3200);
    const t2 = setInterval(() => setAgentStatus(s => (s + 1) % statuses.length), 2200);
    const t3 = setInterval(() => setStageIdx(s => (s + 1) % PROCESSING_STAGES.length), 1700);
    let nid = 10;
    const t4 = setInterval(() => {
      setLiveMarkers(prev => [
        ...prev.slice(-2),
        {
          id: nid++,
          x: `${12 + Math.random() * 68}%`,
          y: `${12 + Math.random() * 68}%`,
          color: Math.random() > 0.4 ? "#D4726A" : "#C8A87A",
          size: Math.random() > 0.5 ? 6 : 5,
        },
      ]);
    }, 3800);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4); };
  }, []);

  const stage = PROCESSING_STAGES[stageIdx];
  const StageIcon = stage.icon;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="glass-frost rounded-3xl overflow-hidden card-4"
        style={{ border: "1px solid rgba(255,255,255,0.85)" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/40 bg-white/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]/70" />
            <div className="w-3 h-3 rounded-full bg-[#FFB347]/70" />
            <div className="w-3 h-3 rounded-full bg-[#7A9E6E]/70" />
          </div>
          <div className="flex-1 mx-2 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5F4F1]/80 border border-[#E4E2DC]/60">
            <div className="w-2 h-2 rounded-full bg-[#7A9E6E]" />
            <span className="text-[10px] font-mono text-[#9A9AA4]">cityspell.ai/intelligence/live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
            <span className="text-[9px] font-bold text-[#7A9E6E]">LIVE</span>
          </div>
        </div>

        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8F7F4]/60 border-b border-white/30">
          <span className="text-[10px] font-semibold text-[#5A5A62] uppercase tracking-widest">Intelligence Center · Bengaluru</span>
          <AnimatePresence mode="wait">
            <motion.span key={agentStatus} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[9px] font-bold text-[#7A9E6E] bg-[#EAF2E6] px-2.5 py-1 rounded-full font-mono">
              {statuses[agentStatus]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Live processing strip */}
        <AnimatePresence mode="wait">
          <motion.div key={stageIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-2.5 border-b border-white/30"
            style={{ background: `${stage.color}08` }}
          >
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stage.color}18` }}>
              <StageIcon size={11} style={{ color: stage.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: stage.color }}>{stage.label}</span>
                <span className="text-[9px] text-[#5A5A62] truncate">{stage.text}</span>
              </div>
              <div className="h-0.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: stage.color }}
                  initial={{ width: `${stage.progress - 15}%` }}
                  animate={{ width: `${stage.progress}%` }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
              </div>
            </div>
            <span className="text-[8px] font-mono text-[#9A9AA4] flex-shrink-0">{stage.progress}%</span>
          </motion.div>
        </AnimatePresence>

        {/* Heatmap */}
        <div className="relative scan-overlay overflow-hidden bg-[#F0EDE8]" style={{ height: 176 }}>
          <div className="absolute inset-0 grid-lines opacity-60" />
          <div className="absolute inset-0 flex flex-col" style={{ gap: 0 }}>
            {heatData.map((row, ri) => (
              <div key={ri} className="flex flex-1">
                {row.map((val, ci) => (
                  <motion.div key={ci} className="flex-1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: (ri * 12 + ci) * 0.006 }}
                    style={{ background: heatColor(val) }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Static ward labels */}
          {[
            { x: "18%", y: "22%", label: "Ward 14", score: 78, color: "#7A9E6E" },
            { x: "50%", y: "18%", label: "Ward 35", score: 42, color: "#D4726A" },
            { x: "72%", y: "40%", label: "Ward 48", score: 38, color: "#D4726A" },
          ].map(w => (
            <div key={w.label} className="absolute glass rounded-lg px-2 py-1 text-center"
              style={{ left: w.x, top: w.y, transform: "translate(-50%,-50%)" }}>
              <p className="text-[8px] font-bold" style={{ color: w.color }}>{w.label}</p>
              <p className="text-[7px] text-[#9A9AA4]">Score: {w.score}</p>
            </div>
          ))}
          {/* Dynamic incident markers */}
          <AnimatePresence>
            {liveMarkers.map(m => (
              <motion.div key={m.id} className="absolute" style={{ left: m.x, top: m.y }}
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.35 }}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute rounded-full agent-pulse"
                    style={{ width: m.size * 2 + 8, height: m.size * 2 + 8, background: m.color, color: m.color }} />
                  <div className="relative rounded-full border-2 border-white"
                    style={{ width: m.size, height: m.size, background: m.color }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 divide-x divide-white/40 border-t border-white/30">
          {[
            { label: "Active Issues", value: issueCount.toString(), color: "#D4726A" },
            { label: "AI Agents",     value: "8",                   color: "#7A9E6E" },
            { label: "Avg Response",  value: "4.2h",                color: "#6A88AA" },
          ].map(m => (
            <div key={m.label} className="px-4 py-3 text-center bg-white/20">
              <AnimatePresence mode="wait">
                <motion.p key={m.value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold font-mono-data" style={{ color: m.color }}>
                  {m.value}
                </motion.p>
              </AnimatePresence>
              <p className="text-[9px] text-[#9A9AA4] mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating card: alert */}
      <motion.div className="absolute -left-12 top-16 glass rounded-2xl px-3.5 py-3 card-3 z-10 w-52"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{ opacity: { delay: 0.8, duration: 0.5 }, x: { delay: 0.8, duration: 0.5 }, y: { delay: 1, duration: 5, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FAECEA] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} className="text-[#D4726A]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#1A1A1C]">Bridge Crack Detected</p>
            <p className="text-[9px] text-[#9A9AA4]">Risk Score 97 · Critical</p>
          </div>
        </div>
        <div className="mt-2 h-0.5 bg-[#F0EDE8] rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#C8A87A] to-[#D4726A] rounded-full"
            initial={{ width: "0%" }} animate={{ width: "97%" }} transition={{ delay: 1.2, duration: 1.5 }} />
        </div>
        <p className="text-[8px] text-right text-[#D4726A] font-mono mt-0.5">97/100 risk</p>
      </motion.div>

      {/* Floating card: assignment */}
      <motion.div className="absolute -right-12 top-44 glass rounded-2xl px-3.5 py-3 card-3 z-10 w-48"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
        transition={{ opacity: { delay: 1, duration: 0.5 }, x: { delay: 1, duration: 0.5 }, y: { delay: 1.5, duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-[#EAF2E6] flex items-center justify-center">
            <CheckCircle2 size={12} className="text-[#7A9E6E]" />
          </div>
          <p className="text-[10px] font-semibold text-[#7A9E6E]">PWD Assigned</p>
        </div>
        <p className="text-[9px] text-[#9A9AA4]">ETA: 4h · ₹41K saved</p>
        <div className="flex items-center gap-1 mt-1.5">
          {[1,2,3,4].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? "bg-[#7A9E6E]" : "bg-[#F0EDE8]"}`} />
          ))}
        </div>
      </motion.div>

      {/* Floating card: AI */}
      <motion.div className="absolute -left-6 bottom-0 glass rounded-2xl px-3.5 py-3 card-3 z-10 w-44"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#7A9E6E] pulse-dot" />
          <p className="text-[9px] font-bold text-[#7A9E6E] tracking-wide">AI PROCESSING</p>
        </div>
        <p className="text-[10px] font-semibold text-[#1A1A1C]">Vision Model</p>
        <p className="text-[9px] text-[#9A9AA4] mt-0.5 font-mono">Confidence: 94.3%</p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIVE TICKER
═══════════════════════════════════════════════════════════ */
function LiveTicker() {
  const doubled = [...tickerEvents, ...tickerEvents];
  return (
    <div className="overflow-hidden py-3 bg-[#1A1A1C] border-y border-white/5">
      <div className="flex scroll-ticker whitespace-nowrap gap-12" style={{ width: "max-content" }}>
        {doubled.map((e, i) => (
          <div key={i} className="inline-flex items-center gap-3 flex-shrink-0">
            <span className="text-sm">{e.icon}</span>
            <span className="text-[11px] text-white/60 font-mono">{e.text}</span>
            <span className="text-white/20 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED PIPELINE (How It Works)
═══════════════════════════════════════════════════════════ */
function AnimatedPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setActiveStep(s => (s + 1) % PIPELINE_STEPS.length), 2200);
    return () => clearInterval(t);
  }, [isInView]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-10">
        <span className="text-xs font-semibold text-[#7A9E6E] uppercase tracking-[0.18em] block mb-3">How It Works</span>
        <h2 className="text-4xl lg:text-5xl font-serif text-[#1A1A1C] leading-tight mb-3">
          Photo to resolved.<br />
          <span className="text-gradient-sage">Under 3 seconds.</span>
        </h2>
        <p className="text-[#5A5A62] max-w-md mx-auto text-base leading-relaxed">
          Five AI agents activate the moment you submit a photo — no manual triage, no bureaucratic delay.
        </p>
      </motion.div>

      <div ref={ref} className="glass-frost rounded-3xl p-8 border border-white/80 card-3 relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-25" />

        {/* Progress bar across top */}
        <div className="relative mb-8">
          <div className="h-0.5 bg-[#F0EDE8] rounded-full">
            <motion.div className="h-full bg-[#7A9E6E] rounded-full"
              animate={{ width: `${(activeStep / (PIPELINE_STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>
          {/* Step dots */}
          <div className="absolute -top-1.5 left-0 right-0 flex justify-between px-0">
            {PIPELINE_STEPS.map((_, i) => (
              <motion.div key={i} className="w-3.5 h-3.5 rounded-full border-2 transition-colors duration-300"
                style={{
                  background: i <= activeStep ? "#7A9E6E" : "#F8F7F4",
                  borderColor: i <= activeStep ? "#7A9E6E" : "#E4E2DC",
                }}
                animate={i === activeStep ? { scale: 1.4 } : { scale: 1 }}
              />
            ))}
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-5 gap-3">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === i;
            const isDone = i < activeStep;
            return (
              <motion.div key={step.n}
                className="flex flex-col items-center gap-2.5 cursor-pointer"
                animate={isActive ? { y: -4 } : { y: 0 }}
                onClick={() => setActiveStep(i)}
              >
                <motion.div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isActive ? step.bg : isDone ? "#EAF2E6" : "#F8F7F4",
                    border: `2px solid ${isActive ? step.color : isDone ? "#7A9E6E40" : "#E4E2DC"}`,
                    boxShadow: isActive ? `0 4px 20px ${step.color}30` : "none",
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? step.color : isDone ? "#7A9E6E" : "#9A9AA4" }} />
                </motion.div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-[#9A9AA4] mb-0.5">{step.n}</p>
                  <p className="text-[11px] font-bold text-[#1A1A1C]">{step.title}</p>
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-white rounded-xl p-3 card-2 border border-[#E4E2DC] w-full text-center">
                      <p className="text-[9px] text-[#5A5A62] leading-relaxed mb-1.5">{step.detail}</p>
                      <div className="bg-[#FAF9F6] rounded-lg px-2 py-1">
                        <p className="text-[9px] font-mono font-bold" style={{ color: step.color }}>{step.preview}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CITY HEALTH COMMAND CENTER
═══════════════════════════════════════════════════════════ */
function CityHealthCenter() {
  const scoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(scoreRef, { once: true });
  const { value: scoreVal } = useCounter(68, 1400);

  const departments = [
    { name: "PWD",         load: 84, active: 34, color: "#6A88AA" },
    { name: "BWSSB",       load: 71, active: 28, color: "#5E9E9E" },
    { name: "BBMP Roads",  load: 63, active: 19, color: "#9A9C5E" },
    { name: "BESCOM",      load: 45, active: 12, color: "#C8A87A" },
    { name: "BBMP SWM",    load: 58, active: 22, color: "#8A6AAA" },
  ];

  const topRisk = WARDS.sort((a,b) => a.score - b.score).slice(0, 5);

  return (
    <section className="py-16 bg-white border-y border-[#E4E2DC]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10">
          <span className="text-xs font-semibold text-[#7A9E6E] uppercase tracking-[0.18em] block mb-3">City Health Command Center</span>
          <h2 className="text-4xl font-serif text-[#1A1A1C]">Bengaluru at a glance.</h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* City Health Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-[#FAF9F6] border border-[#E4E2DC] p-6">
            <p className="text-xs font-semibold text-[#9A9AA4] uppercase tracking-widest mb-4">City Health Score</p>
            <div ref={scoreRef} className="flex items-end gap-3 mb-4">
              <span className="text-7xl font-bold font-mono-data text-[#1A1A1C] leading-none">
                {isInView ? scoreVal : 0}
              </span>
              <span className="text-2xl text-[#9A9AA4] mb-1">/100</span>
            </div>
            <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden mb-3">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#C8A87A] to-[#7A9E6E]"
                initial={{ width: 0 }} whileInView={{ width: "68%" }} viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeOut" }} />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E0] text-[#C8A87A] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A87A] pulse-dot" />
              MODERATE RISK
            </span>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                { label: "Open Incidents", value: "247", color: "#D4726A" },
                { label: "Resolved Today", value: "1,438", color: "#7A9E6E" },
                { label: "Predicted Failures", value: "34", color: "#8A6AAA" },
                { label: "Agents Active", value: "8", color: "#6A88AA" },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E4E2DC]">
                  <p className="text-xl font-bold font-mono-data" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-[9px] text-[#9A9AA4] mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Department Load */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-[#FAF9F6] border border-[#E4E2DC] p-6">
            <p className="text-xs font-semibold text-[#9A9AA4] uppercase tracking-widest mb-5">Department Load</p>
            <div className="space-y-4">
              {departments.map((d, i) => (
                <div key={d.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-[#1A1A1C]">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#9A9AA4]">{d.active} active</span>
                      <span className="text-[10px] font-bold font-mono-data" style={{ color: d.load > 75 ? "#D4726A" : d.load > 60 ? "#C8A87A" : "#7A9E6E" }}>
                        {d.load}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: d.load > 75 ? "#D4726A" : d.load > 60 ? "#C8A87A" : "#7A9E6E" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${d.load}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-[#E4E2DC]">
              <p className="text-[10px] text-[#9A9AA4] mb-2">Economic loss prevented this month</p>
              <p className="text-3xl font-bold font-mono-data text-[#7A9E6E]">₹2.3 Cr</p>
            </div>
          </motion.div>

          {/* Ward Risk Rankings */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[#FAF9F6] border border-[#E4E2DC] p-6">
            <p className="text-xs font-semibold text-[#9A9AA4] uppercase tracking-widest mb-5">Highest Risk Wards</p>
            <div className="space-y-3">
              {topRisk.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E2DC] bg-white hover:border-[#D0CCC4] transition-colors">
                  <span className="text-[10px] font-bold text-[#9A9AA4] w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1A1A1C] truncate">{w.name}</p>
                      <span className="text-[9px] font-bold ml-2 flex-shrink-0" style={{ color: riskColor(w.risk) }}>{w.risk}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1 bg-[#F0EDE8] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${w.score}%`, background: scoreColor(w.score) }} />
                      </div>
                      <span className="text-[9px] font-bold font-mono-data flex-shrink-0" style={{ color: scoreColor(w.score) }}>
                        {w.score}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link href="/map" className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7A9E6E] hover:text-[#5A7A50] transition-colors group">
              View All Wards
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   VISUAL AI SHOWCASE
═══════════════════════════════════════════════════════════ */
function VisualAIShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [boxDrawn, setBoxDrawn] = useState(false);

  useEffect(() => {
    if (isInView) setTimeout(() => setBoxDrawn(true), 500);
  }, [isInView]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
        <span className="text-xs font-semibold text-[#6A88AA] uppercase tracking-[0.18em] block mb-3">Visual AI Detection</span>
        <h2 className="text-4xl font-serif text-[#1A1A1C] mb-3">What the AI sees.</h2>
        <p className="text-[#5A5A62] max-w-lg leading-relaxed">
          Computer vision trained on 2M+ Indian civic images identifies 47 issue types — from potholes to structural cracks — with 94% accuracy.
        </p>
      </motion.div>

      <div ref={ref} className="grid lg:grid-cols-3 gap-5">
        {/* Step 1: Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border border-[#E4E2DC] overflow-hidden bg-white card-0">
          <div className="relative h-48 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #7A6B58 0%, #8B7A68 60%, #6A5A48 100%)" }}>
            {/* Road lane marking */}
            <div className="absolute left-[46%] top-0 bottom-0 w-1 opacity-30"
              style={{ background: "repeating-linear-gradient(180deg, #D4C4A0 0px, #D4C4A0 20px, transparent 20px, transparent 36px)" }} />
            {/* Pothole shadow */}
            <div className="absolute" style={{ top: "42%", left: "32%", width: 72, height: 52,
              background: "radial-gradient(ellipse, rgba(30,24,18,0.9) 0%, rgba(50,40,30,0.7) 40%, transparent 72%)",
              transform: "translate(-50%,-50%) rotate(-8deg)" }} />
            {/* Camera UI */}
            <div className="absolute inset-2 border border-white/15 rounded-lg" />
            <div className="absolute top-3 left-3 bg-black/40 rounded-md px-2 py-0.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4726A]" />
              <span className="text-[8px] text-white font-mono">● REC</span>
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] text-white/50 font-mono">04:32 PM</div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[#E8EFF6] flex items-center justify-center">
                <Camera size={12} className="text-[#6A88AA]" />
              </div>
              <p className="text-[11px] font-bold text-[#1A1A1C]">Citizen Upload</p>
            </div>
            <p className="text-[9px] text-[#9A9AA4] font-mono">Ward 14 · Indiranagar · 4.2MB · just now</p>
          </div>
        </motion.div>

        {/* Step 2: Detection */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#E4E2DC] overflow-hidden bg-white card-0">
          <div className="relative h-48 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #7A6B58 0%, #8B7A68 60%, #6A5A48 100%)" }}>
            <div className="absolute left-[46%] top-0 bottom-0 w-1 opacity-30"
              style={{ background: "repeating-linear-gradient(180deg, #D4C4A0 0px, #D4C4A0 20px, transparent 20px, transparent 36px)" }} />
            <div className="absolute" style={{ top: "42%", left: "32%", width: 72, height: 52,
              background: "radial-gradient(ellipse, rgba(30,24,18,0.9) 0%, rgba(50,40,30,0.7) 40%, transparent 72%)",
              transform: "translate(-50%,-50%) rotate(-8deg)" }} />

            {/* AI bounding box */}
            <AnimatePresence>
              {boxDrawn && (
                <motion.div className="absolute rounded-sm"
                  style={{ left: "16%", top: "28%", width: 84, height: 58,
                    border: "2px solid #7A9E6E", boxShadow: "0 0 12px rgba(122,158,110,0.5)" }}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}>
                  {/* Corner brackets */}
                  {[{top:"-4px",left:"-4px"},{top:"-4px",right:"-4px"},{bottom:"-4px",left:"-4px"},{bottom:"-4px",right:"-4px"}].map((s,i) => (
                    <div key={i} className="absolute w-2.5 h-2.5 bg-[#7A9E6E]" style={s as React.CSSProperties} />
                  ))}
                  <div className="absolute -top-6 left-0 bg-[#7A9E6E] text-white text-[8px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap">
                    Pothole · 94.3%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Scan line */}
            {isInView && (
              <motion.div className="absolute left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(122,158,110,0.8),transparent)" }}
                animate={{ top: ["0%","100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EAF2E6] flex items-center justify-center">
                  <Eye size={12} className="text-[#7A9E6E]" />
                </div>
                <p className="text-[11px] font-bold text-[#7A9E6E]">Vision AI · Detecting</p>
              </div>
            </div>
            <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#7A9E6E] rounded-full"
                initial={{ width: 0 }} animate={isInView ? { width: "94%" } : {}}
                transition={{ duration: 1.4, delay: 0.3 }} />
            </div>
            <p className="text-[9px] text-[#9A9AA4] mt-1 font-mono">Confidence: 94.3%</p>
          </div>
        </motion.div>

        {/* Step 3: Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#E4E2DC] overflow-hidden bg-white card-0">
          <div className="px-4 py-3 bg-[#EAF2E6] border-b border-[#7A9E6E]/15 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-[#7A9E6E]" />
            <p className="text-[10px] font-bold text-[#5A7A50]">AI Analysis Complete · 2.3s</p>
          </div>
          <div className="p-4">
            <div className="space-y-2.5">
              {[
                { label: "Issue Type",    value: "Pothole",        color: "#1A1A1C",  mono: false },
                { label: "Confidence",    value: "94.3%",          color: "#7A9E6E",  mono: true },
                { label: "Severity",      value: "HIGH",           color: "#D4726A",  mono: false },
                { label: "Depth",         value: "~8 cm",          color: "#5A5A62",  mono: true },
                { label: "Area",          value: "0.8 m²",         color: "#5A5A62",  mono: true },
                { label: "Daily Loss",    value: "₹52,000",        color: "#C8A87A",  mono: true },
                { label: "Department",    value: "PWD",            color: "#6A88AA",  mono: false },
                { label: "Risk Score",    value: "78 / 100",       color: "#D4726A",  mono: true },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-[10px] text-[#9A9AA4]">{r.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: r.color, fontFamily: r.mono ? "monospace" : undefined }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#F0EDE8] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-[9px] text-[#7A9E6E] font-bold">Routing to PWD Officer A12…</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ECONOMIC IMPACT STORY
═══════════════════════════════════════════════════════════ */
function EconomicImpactStory() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { value: lossVal } = useCounter(240000, 1800);
  const { value: saveVal } = useCounter(40000, 1400);

  return (
    <section className="py-16 bg-white border-y border-[#E4E2DC]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs font-semibold text-[#C8A87A] uppercase tracking-[0.18em] block mb-3">Economic Impact Engine</span>
          <h2 className="text-4xl font-serif text-[#1A1A1C] mb-3">The cost of doing nothing.</h2>
          <p className="text-[#5A5A62] max-w-lg leading-relaxed">
            Every unresolved civic issue bleeds the city economy. CitySpell calculates exact impact — and routes before damage compounds.
          </p>
        </motion.div>

        <div ref={ref} className="grid lg:grid-cols-[1fr_80px_1fr] gap-0 items-stretch">
          {/* Without */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-l-2xl bg-[#FEF8F8] border border-[#D4726A]/20 p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={14} className="text-[#D4726A]" />
              <span className="text-[11px] font-bold text-[#D4726A] uppercase tracking-wider">Without CitySpell</span>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { step: "01", text: "Pothole reported via BBMP helpline", sub: "No priority triage" },
                { step: "02", text: "Officer manually inspects — +18hrs", sub: "Delay compounds loss" },
                { step: "03", text: "12,000 vehicles rerouted daily", sub: "No smart routing" },
                { step: "04", text: "Issue stays open for 9.4 days avg", sub: "Loss accumulates" },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <span className="text-[10px] font-bold text-[#D4726A]/40 w-5 mt-0.5 flex-shrink-0">{s.step}</span>
                  <div>
                    <p className="text-sm text-[#1A1A1C]">{s.text}</p>
                    <p className="text-[10px] text-[#9A9AA4]">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FAECEA] rounded-xl p-4 border border-[#D4726A]/15">
              <p className="text-[10px] text-[#D4726A] uppercase tracking-widest mb-1">Total Daily Loss</p>
              <p className="text-5xl font-bold font-mono-data text-[#D4726A]">
                ₹{isInView ? (lossVal / 1000).toFixed(0) : "0"}K
              </p>
              <p className="text-[9px] text-[#D4726A]/60 mt-1 font-mono">per unresolved incident · per day</p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="flex flex-col items-center justify-center bg-white border-y border-[#E4E2DC] py-6">
            <div className="bg-[#EAF2E6] rounded-2xl px-3 py-4 text-center border border-[#7A9E6E]/20">
              <p className="text-2xl font-bold text-[#7A9E6E]">83%</p>
              <p className="text-[8px] text-[#7A9E6E] font-bold mt-0.5">REDUCTION</p>
            </div>
          </div>

          {/* With CitySpell */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-r-2xl bg-[#F5FAF3] border border-[#7A9E6E]/20 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={14} className="text-[#7A9E6E]" />
              <span className="text-[11px] font-bold text-[#7A9E6E] uppercase tracking-wider">With CitySpell AI</span>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { step: "01", text: "Photo submitted — AI detects in 0.9s", sub: "94.3% confidence" },
                { step: "02", text: "PWD Officer auto-assigned: 4.2hr avg", sub: "Smart capacity routing" },
                { step: "03", text: "Traffic rerouted: −8,400 vehicles", sub: "Optimal detour calculated" },
                { step: "04", text: "Resolved in 4.2h average", sub: "₹41K loss contained" },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <span className="text-[10px] font-bold text-[#7A9E6E]/50 w-5 mt-0.5 flex-shrink-0">{s.step}</span>
                  <div>
                    <p className="text-sm text-[#1A1A1C]">{s.text}</p>
                    <p className="text-[10px] text-[#9A9AA4]">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#EAF2E6] rounded-xl p-4 border border-[#7A9E6E]/15">
              <p className="text-[10px] text-[#7A9E6E] uppercase tracking-widest mb-1">Total Daily Loss</p>
              <p className="text-5xl font-bold font-mono-data text-[#7A9E6E]">
                ₹{isInView ? (saveVal / 1000).toFixed(0) : "0"}K
              </p>
              <p className="text-[9px] text-[#7A9E6E]/60 mt-1 font-mono">per incident · contained & routed</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WARD INTELLIGENCE MAP (Digital Twin)
═══════════════════════════════════════════════════════════ */
function WardIntelligenceMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const hov = WARDS.find(w => w.id === hovered);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-[340px_1fr] gap-10 items-start">
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-xs font-semibold text-[#7A9E6E] uppercase tracking-[0.18em] block mb-3">Ward Intelligence Map</span>
          <h2 className="text-4xl font-serif text-[#1A1A1C] leading-tight mb-4">
            Every ward.<br />Understood.
          </h2>
          <p className="text-[#5A5A62] leading-relaxed mb-6">
            198 wards scored live. Hover any ward to see its health score, open incidents, and AI-predicted failures.
          </p>
          <div className="flex flex-col gap-2.5">
            {[["#7A9E6E","≥70","Healthy"],["#C8A87A","50–69","At Risk"],["#D4726A","<50","Critical"]].map(([c,r,l]) => (
              <div key={l} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-md flex-shrink-0" style={{ background: c }} />
                <span className="text-sm font-semibold text-[#1A1A1C]">{l}</span>
                <span className="text-sm text-[#9A9AA4]">Score {r}</span>
              </div>
            ))}
          </div>

          {/* Hover detail */}
          <AnimatePresence>
            {hov && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-5 p-4 bg-white rounded-2xl border border-[#E4E2DC] card-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-[#9A9AA4]">{hov.id}</p>
                    <p className="text-base font-bold text-[#1A1A1C]">{hov.name}</p>
                  </div>
                  <div className="text-3xl font-bold font-mono-data" style={{ color: scoreColor(hov.score) }}>
                    {hov.score}
                  </div>
                </div>
                <div className="h-1.5 bg-[#F0EDE8] rounded-full mb-3">
                  <div className="h-full rounded-full" style={{ width: `${hov.score}%`, background: scoreColor(hov.score) }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-[#FAF9F6] rounded-lg p-2"><p className="text-[#9A9AA4]">Risk Level</p><p className="font-bold mt-0.5" style={{ color: riskColor(hov.risk) }}>{hov.risk}</p></div>
                  <div className="bg-[#FAF9F6] rounded-lg p-2"><p className="text-[#9A9AA4]">Open Issues</p><p className="font-bold text-[#1A1A1C] mt-0.5">{hov.incidents}</p></div>
                  <div className="bg-[#FAF9F6] rounded-lg p-2 col-span-2"><p className="text-[#9A9AA4]">Predicted Failures</p><p className="font-bold text-[#8A6AAA] mt-0.5">{hov.predicted} in next 30 days</p></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Link href="/map" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7A9E6E] hover:text-[#5A7A50] transition-colors group">
            Open Full Map <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Ward grid */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="grid grid-cols-4 gap-3">
          {WARDS.map((ward, i) => {
            const c = scoreColor(ward.score);
            const isHov = hovered === ward.id;
            return (
              <motion.div key={ward.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, scale: 1.03 }}
                onHoverStart={() => setHovered(ward.id)}
                onHoverEnd={() => setHovered(null)}
                className="rounded-xl p-4 border cursor-default transition-all"
                style={{
                  background: isHov ? `${c}10` : "white",
                  borderColor: isHov ? `${c}50` : "#E4E2DC",
                  boxShadow: isHov ? `0 8px 24px ${c}20` : undefined,
                }}
              >
                {/* Score */}
                <div className="text-2xl font-bold font-mono-data leading-none mb-1" style={{ color: c }}>{ward.score}</div>
                {/* Bar */}
                <div className="h-1 bg-[#F0EDE8] rounded-full mb-2 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: c }}
                    initial={{ width: 0 }} whileInView={{ width: `${ward.score}%` }} viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.04 + 0.2 }} />
                </div>
                <p className="text-[10px] font-bold text-[#1A1A1C] truncate">{ward.name}</p>
                <p className="text-[9px] text-[#9A9AA4] mt-0.5">{ward.incidents} issues</p>
                <span className="text-[8px] font-bold mt-1.5 inline-block" style={{ color: riskColor(ward.risk) }}>{ward.risk}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREDICTION ENGINE
═══════════════════════════════════════════════════════════ */
function PredictionEngine() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 bg-white border-y border-[#E4E2DC]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs font-semibold text-[#8A6AAA] uppercase tracking-[0.18em] block mb-3">Predictive Failure Engine</span>
          <h2 className="text-4xl font-serif text-[#1A1A1C] mb-3">
            Failures predicted<br />before they happen.
          </h2>
          <p className="text-[#5A5A62] max-w-lg leading-relaxed">
            AI forecasts infrastructure failures 30 days ahead using structural data, maintenance history, and environmental patterns.
          </p>
        </motion.div>

        <div ref={ref} className="grid lg:grid-cols-3 gap-5">
          {PREDICTIONS.map((p, pi) => (
            <motion.div key={p.type}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: pi * 0.12 }}
              className="rounded-2xl bg-[#FAF9F6] border border-[#E4E2DC] p-6 card-0 hover:card-2 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-[#1A1A1C]">{p.type}</p>
                  <p className="text-[10px] text-[#9A9AA4] mt-0.5">{p.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold font-mono-data" style={{ color: p.color }}>{p.probability}%</p>
                  <p className="text-[9px] text-[#9A9AA4]">probability</p>
                </div>
              </div>

              {/* Sparkline trend */}
              <div className="flex items-end gap-0.5 h-10 mb-3">
                {p.trend.map((v, i) => (
                  <motion.div key={i} className="flex-1 rounded-t-sm"
                    style={{ background: i === p.trend.length - 1 ? p.color : `${p.color}40` }}
                    initial={{ height: 0 }}
                    animate={isInView ? { height: `${(v / 100) * 40}px` } : { height: 0 }}
                    transition={{ delay: pi * 0.12 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                  />
                ))}
              </div>

              {/* Probability bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[9px] font-mono mb-1.5">
                  <span className="text-[#9A9AA4]">Failure Probability</span>
                  <span style={{ color: p.color }}>{p.probability}%</span>
                </div>
                <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${p.color}80, ${p.color})` }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${p.probability}%` } : { width: 0 }}
                    transition={{ delay: pi * 0.12 + 0.6, duration: 1.2, ease: [0.22,1,0.36,1] }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 pt-3 border-t border-[#E4E2DC]">
                {[
                  { label: "Time to failure", value: p.days, color: p.color },
                  { label: "Preventive cost", value: p.preventive, color: "#7A9E6E" },
                  { label: "If ignored", value: p.damage, color: p.color },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-[10px]">
                    <span className="text-[#9A9AA4]">{r.label}</span>
                    <span className="font-bold font-mono-data" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <Link href="/authority-dashboard"
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[10px] font-bold border transition-all hover:bg-[#FAF9F6]"
                style={{ borderColor: `${p.color}30`, color: p.color }}>
                Schedule Maintenance <ArrowRight size={10} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTHORITY DASHBOARD PREVIEW
═══════════════════════════════════════════════════════════ */
function AuthorityPreview() {
  const [selected, setSelected] = useState(0);
  const priority = WARDS.sort((a,b) => a.score - b.score).slice(0, 5);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
        <span className="text-xs font-semibold text-[#6A88AA] uppercase tracking-[0.18em] block mb-3">Authority Command Center</span>
        <h2 className="text-4xl font-serif text-[#1A1A1C] mb-3">The dashboard officers use.</h2>
        <p className="text-[#5A5A62] max-w-lg leading-relaxed">
          Municipal officers get a real-time command center — priority queues, department load, and predicted failures in one place.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="glass-frost rounded-3xl overflow-hidden card-3 border border-white/80">
        {/* Mock browser bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/40 border-b border-white/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]/70" />
            <div className="w-3 h-3 rounded-full bg-[#FFB347]/70" />
            <div className="w-3 h-3 rounded-full bg-[#7A9E6E]/70" />
          </div>
          <div className="flex-1 mx-2 px-3 py-1 rounded-lg bg-[#F5F4F1]/80 border border-[#E4E2DC]/60 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7A9E6E]" />
            <span className="text-[10px] font-mono text-[#9A9AA4]">cityspell.ai/authority/bengaluru</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
            <span className="text-[9px] font-bold text-[#7A9E6E]">LIVE</span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="grid grid-cols-3 divide-x divide-[#E4E2DC]/60">
          {/* Priority Queue */}
          <div className="p-5">
            <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-widest mb-4">Priority Queue</p>
            <div className="space-y-2">
              {priority.map((w, i) => (
                <button key={w.id} onClick={() => setSelected(i)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selected === i ? "border-[#7A9E6E]/40 bg-[#EAF2E6]/50" : "border-[#E4E2DC] bg-white hover:border-[#D0CCC4]"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#1A1A1C]">{w.name}</span>
                    <span className="text-[9px] font-bold" style={{ color: riskColor(w.risk) }}>{w.risk}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w.score}%`, background: scoreColor(w.score) }} />
                    </div>
                    <span className="text-[9px] font-mono-data font-bold" style={{ color: scoreColor(w.score) }}>{w.score}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ward Detail */}
          <div className="p-5">
            <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-widest mb-4">Ward Intelligence</p>
            <AnimatePresence mode="wait">
              <motion.div key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-bold font-mono-data" style={{ color: scoreColor(priority[selected].score) }}>
                    {priority[selected].score}
                  </span>
                  <span className="text-[#9A9AA4] mb-1">/100</span>
                </div>
                <p className="text-base font-bold text-[#1A1A1C] mb-4">{priority[selected].name}</p>
                <div className="space-y-2">
                  {[
                    { label: "Risk Level",         value: priority[selected].risk,      color: riskColor(priority[selected].risk) },
                    { label: "Open Incidents",      value: `${priority[selected].incidents} active`, color: "#D4726A" },
                    { label: "Predicted Failures",  value: `${priority[selected].predicted} in 30d`, color: "#8A6AAA" },
                    { label: "AI Recommendation",   value: "Escalate to BBMP HQ",        color: "#6A88AA" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-[10px] p-2 bg-[#FAF9F6] rounded-lg">
                      <span className="text-[#9A9AA4]">{r.label}</span>
                      <span className="font-bold" style={{ color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Performance & CTA */}
          <div className="p-5 flex flex-col">
            <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-widest mb-4">System Overview</p>
            <div className="space-y-4 flex-1">
              {[
                { label: "Issues Resolved Today", value: "1,438", trend: "+12%", color: "#7A9E6E" },
                { label: "Avg Resolution Time",   value: "4.2h",  trend: "−18%", color: "#6A88AA" },
                { label: "Active Agents",          value: "8 / 8", trend: "100%", color: "#7A9E6E" },
                { label: "Predicted Failures",     value: "34",    trend: "7 new", color: "#8A6AAA" },
                { label: "Loss Prevented Today",   value: "₹84K",  trend: "+₹22K", color: "#C8A87A" },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E4E2DC]">
                  <div>
                    <p className="text-[9px] text-[#9A9AA4]">{m.label}</p>
                    <p className="text-sm font-bold font-mono-data text-[#1A1A1C]">{m.value}</p>
                  </div>
                  <span className="text-[9px] font-bold font-mono-data" style={{ color: m.color }}>{m.trend}</span>
                </div>
              ))}
            </div>
            <Link href="/authority-dashboard"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#1A1A1C] text-white text-sm font-semibold hover:bg-[#2C2C2E] transition-all">
              <Cpu size={14} />
              Open Command Center
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const itemV = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <motion.div className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,223,192,0.45) 0%, transparent 70%)" }}
          animate={{ x:[0,30,0], y:[0,-20,0], scale:[1,1.05,1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(184,216,216,0.35) 0%, transparent 70%)" }}
          animate={{ x:[0,-25,0], y:[0,20,0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16">
          {/* Left */}
          <motion.div variants={containerV} initial="hidden" animate="visible" className="flex flex-col gap-7">
            <motion.div variants={itemV}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-[#C8DFC0]/60 shadow-sm">
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#7A9E6E] pulse-dot" />
                  <div className="absolute w-4 h-4 rounded-full bg-[#7A9E6E]/20" />
                </div>
                <span className="text-xs font-semibold text-[#5A7A50]">Civic AI Platform · 8 Agents Active</span>
                <Sparkles size={12} className="text-[#7A9E6E]" />
              </div>
            </motion.div>

            <motion.div variants={itemV}>
              <h1 className="text-[clamp(44px,6vw,80px)] font-serif text-[#1A1A1C] leading-[1.03] tracking-[-0.03em]">
                The Operating
                <br />
                <span className="text-gradient-sage">System</span>{" "}for
                <br />
                Indian Cities
              </h1>
            </motion.div>

            <motion.p variants={itemV} className="text-lg text-[#5A5A62] leading-relaxed max-w-lg">
              Five AI agents working in parallel — detecting issues, calculating
              economic impact, routing to authorities, and predicting infrastructure
              failure before it happens.
            </motion.p>

            <motion.div variants={itemV} className="flex flex-wrap gap-3">
              <Link href="/report"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#1A1A1C] text-white rounded-2xl font-semibold text-sm hover:bg-[#2C2C2E] transition-all card-2 hover:card-3 hover-lift">
                <Camera size={15} />
                Report an Issue
                <ArrowRight size={14} />
              </Link>
              <Link href="/authority-dashboard"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 glass text-[#1A1A1C] rounded-2xl font-semibold text-sm hover:bg-white/80 transition-all card-1 hover:card-2 hover-lift border border-[#E4E2DC]">
                <Cpu size={15} />
                Command Center
              </Link>
            </motion.div>

            <motion.div variants={itemV} className="flex items-center gap-6 pt-1">
              {[
                { value: "145+",   label: "Issues resolved" },
                { value: "₹2.3 Cr", label: "Loss prevented" },
                { value: "6 cities", label: "Active deployments" },
              ].map(t => (
                <div key={t.label} className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-[#1A1A1C] font-mono-data">{t.value}</span>
                  <span className="text-[10px] text-[#9A9AA4]">{t.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Live Intelligence Canvas */}
          <div className="relative">
            <LiveIntelligenceCanvas />
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border-2 border-[#D4D0C8] flex items-start justify-center pt-1.5">
            <motion.div className="w-1 h-1.5 rounded-full bg-[#9A9AA4]"
              animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────── */}
      <LiveTicker />

      {/* ── PIPELINE ─────────────────────────────────────────── */}
      <AnimatedPipeline />

      {/* ── CITY HEALTH ──────────────────────────────────────── */}
      <CityHealthCenter />

      {/* ── VISUAL AI ────────────────────────────────────────── */}
      <VisualAIShowcase />

      {/* ── ECONOMIC IMPACT ──────────────────────────────────── */}
      <EconomicImpactStory />

      {/* ── WARD MAP ─────────────────────────────────────────── */}
      <WardIntelligenceMap />

      {/* ── PREDICTION ───────────────────────────────────────── */}
      <PredictionEngine />

      {/* ── AUTHORITY PREVIEW ────────────────────────────────── */}
      <AuthorityPreview />

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-3xl bg-[#1A1A1C] overflow-hidden relative">
          <div className="absolute inset-0 grid-lines opacity-[0.04]" />
          <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(122,158,110,0.15) 0%, transparent 70%)" }} />
          <div className="relative z-10 px-8 py-16 md:px-20 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A9E6E] uppercase tracking-[0.18em] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
                Open to all citizens
              </span>
              <h2 className="text-4xl lg:text-5xl font-serif text-white leading-[1.05] mb-5">
                Your city needs<br />
                <span className="text-gradient-sage">your voice.</span>
              </h2>
              <p className="text-[#9A9AA4] text-base leading-relaxed max-w-md">
                Every photo becomes intelligence. Every complaint becomes data.
                Together, we're building the civic operating system India deserves.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { href: "/report", icon: Camera, label: "Report an Issue", sub: "Upload a photo · AI analyzes in 3 seconds", primary: true },
                { href: "/citizen-dashboard", icon: BarChart3, label: "Citizen Dashboard", sub: "Track issues · Ward intelligence" },
                { href: "/login", icon: Shield, label: "Authority Login", sub: "Command center · Full intelligence access" },
              ].map(btn => {
                const Icon = btn.icon;
                return (
                  <Link key={btn.href} href={btn.href}
                    className={`group flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${btn.primary ? "bg-[#7A9E6E] hover:bg-[#5A7A50] card-2" : "bg-white/6 border border-white/10 hover:bg-white/10"}`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${btn.primary ? "bg-white/20" : "bg-white/8"}`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${btn.primary ? "text-white" : "text-white/80"}`}>{btn.label}</p>
                        <p className={`text-xs ${btn.primary ? "text-white/70" : "text-white/40"}`}>{btn.sub}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${btn.primary ? "text-white/70" : "text-white/30"}`} />
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#7A9E6E] flex items-center justify-center glow-sage">
                <MapPin size={14} className="text-white" />
              </div>
              <span className="font-bold text-[#1A1A1C] text-base">CitySpell<span className="text-[#7A9E6E]">AI</span></span>
            </Link>
            <p className="text-xs text-[#9A9AA4] leading-relaxed">
              The Civic Intelligence Layer for Indian Cities.<br />
              AI-powered civic technology for a better urban tomorrow.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF2E6] w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-[10px] font-bold text-[#5A7A50]">System Online</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-10 text-xs">
            {[
              { heading: "Platform", links: ["Report Issue", "Ward Map", "Citizen Dashboard", "Authority Dashboard"] },
              { heading: "Company",  links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Legal",    links: ["Privacy", "Terms", "Security", "API Docs"] },
            ].map(col => (
              <div key={col.heading} className="flex flex-col gap-3">
                <span className="font-bold text-[#1A1A1C] text-xs uppercase tracking-wider">{col.heading}</span>
                {col.links.map(link => (
                  <span key={link} className="text-[#9A9AA4] hover:text-[#5A5A62] cursor-pointer transition-colors">{link}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#E4E2DC] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9A9AA4]">© 2026 CitySpell AI Technologies. All rights reserved.</p>
          <p className="text-xs text-[#9A9AA4] font-mono">v2.1.0 · 8 agents active · system nominal</p>
        </div>
      </footer>
    </div>
  );
}
