"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Camera, Upload, Brain, CheckCircle2, AlertTriangle, IndianRupee,
  Users, Shield, Building2, ArrowRight, Zap, MapPin, BarChart3,
  X, Loader2, Star, TrendingUp, Cpu, Eye, Sparkles,
  Navigation, Copy, ExternalLink, RotateCcw, FileImage,
} from "lucide-react";
import { useReportFlow, type AnalysisData } from "@/lib/hooks/useReportFlow";
import { useRouter } from "next/navigation";

type Stage = "upload" | "preview" | "analyzing" | "review" | "success";

/* ─── ANIMATION VARIANTS ──────────────────────────────────────────────────── */
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardV = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

/* ─── STEPPER ─────────────────────────────────────────────────────────────── */
const STEPS = ["Upload", "Analysis", "Review", "Done"] as const;

function stageToStepIndex(stage: Stage): number {
  if (stage === "upload" || stage === "preview") return 0;
  if (stage === "analyzing") return 1;
  if (stage === "review") return 2;
  return 3;
}

function Stepper({ stage }: { stage: Stage }) {
  const current = stageToStepIndex(stage);
  return (
    <div className="flex items-center justify-center mb-16">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={active ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.8, repeat: Infinity }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  done   ? "bg-[#7A9E6E] text-white"
                  : active ? "bg-[#1A1A1C] text-white"
                           : "bg-[#F0EDE8] text-[#9A9AA4]"
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </motion.div>
              <span className={`text-xs font-bold transition-all hidden sm:block ${active ? "text-[#1A1A1C]" : "text-[#9A9AA4]"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-12 sm:w-16 h-px mx-2 bg-[#E4E2DC] relative overflow-hidden">
                {done && (
                  <motion.div
                    className="absolute inset-0 bg-[#7A9E6E]"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── UPLOAD STAGE ────────────────────────────────────────────────────────── */
function UploadStage({ onUpload }: { onUpload: (file: File) => void }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (file && file.type.startsWith("image/")) onUpload(file);
  }, [onUpload]);

  return (
    <motion.div className="max-w-2xl mx-auto" variants={containerV} initial="hidden" animate="visible">
      <motion.div variants={cardV} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2E6] border border-[#C8DFC0] mb-6">
          <Cpu size={12} className="text-[#7A9E6E]" />
          <span className="text-[11px] font-bold text-[#5A7A50] uppercase tracking-wider">AI Vision Ready</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
        </div>
        <h1 className="text-5xl font-serif text-[#1A1A1C] mb-4">Report a civic issue</h1>
        <p className="text-[#9A9AA4] text-base leading-relaxed max-w-md mx-auto">
          Upload one photo. Five AI agents analyze, quantify, and route your report in seconds.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        variants={cardV}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        animate={drag ? { scale: 1.02 } : { scale: 1 }}
        className="relative cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
        <div className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-16 flex flex-col items-center gap-6 transition-all duration-300 ${
          drag
            ? "border-[#7A9E6E] bg-[#EAF2E6]/60"
            : "border-[#D4D0C8] bg-white hover:border-[#7A9E6E]/80 hover:bg-[#F8FAF6] hover:shadow-[0_0_32px_rgba(122,158,110,0.12)]"
        }`}>
          <div className="absolute inset-0 grid-lines opacity-30" />

          <motion.div
            className={`relative w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-300 ${
              drag ? "bg-[#7A9E6E]" : "bg-[#F5F4F1] group-hover:bg-[#EAF2E6]"
            }`}
            whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
          >
            <Camera size={36} className={`transition-colors ${drag ? "text-white" : "text-[#B0ACA4] group-hover:text-[#7A9E6E]"}`} />
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full bg-[#7A9E6E]"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "-20px center", right: "-20px", top: "50%", marginTop: "-5px" }}
            />
          </motion.div>

          <div className="relative text-center">
            <p className="text-lg font-bold text-[#1A1A1C] mb-1">
              {drag ? "Drop to analyze" : "Drop your photo here"}
            </p>
            <p className="text-sm text-[#9A9AA4]">JPG, PNG, HEIC · up to 20 MB</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#1A1A1C] rounded-xl text-white text-sm font-bold hover:bg-[#2C2C2E] transition-all card-1">
              <Upload size={14} />
              Choose photo
            </div>
            <span className="text-sm text-[#B0ACA4]">or</span>
            <div className="flex items-center gap-2 text-sm text-[#7A9E6E] font-medium">
              <Camera size={14} />
              Use camera
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {["Object Detection","Severity Analysis","Economic Modeling","Auto-Routing","Risk Prediction"].map((cap) => (
              <span key={cap} className="text-[9px] font-bold text-[#9A9AA4] bg-[#F5F4F1] px-2.5 py-1 rounded-full uppercase tracking-wide">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick categories */}
      <motion.div variants={cardV} className="mt-6">
        <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-widest mb-3">Quick Report</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: "🕳️", label: "Pothole" },
            { emoji: "💧", label: "Flooding" },
            { emoji: "💡", label: "Streetlight" },
            { emoji: "🗑️", label: "Garbage" },
            { emoji: "🌳", label: "Tree Fall" },
            { emoji: "🚰", label: "Water Leak" },
          ].map((cat) => (
            <motion.button
              key={cat.label}
              onClick={() => inputRef.current?.click()}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-white border border-[#E4E2DC] hover:border-[#C8DFC0] hover:shadow-sm transition-all text-left"
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-xs font-semibold text-[#5A5A62]">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── PREVIEW STAGE ───────────────────────────────────────────────────────── */
function PreviewStage({
  file,
  previewUrl,
  onConfirm,
  onCancel,
}: {
  file: File;
  previewUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [locating, setLocating] = useState(true);

  // Simulate location pre-detection animation (actual GPS fires during analysis)
  useEffect(() => {
    const t = setTimeout(() => setLocating(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const sizeStr = file.size > 1_000_000
    ? `${(file.size / 1_000_000).toFixed(1)} MB`
    : `${Math.round(file.size / 1_000)} KB`;

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      variants={containerV}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardV} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFF6] border border-[#C0D4E8] mb-4">
          <Navigation size={12} className="text-[#6A88AA]" />
          <span className="text-[11px] font-bold text-[#4A6A88] uppercase tracking-wider">Photo Ready</span>
        </div>
        <h2 className="text-4xl font-serif text-[#1A1A1C] mb-2">Review your photo</h2>
        <p className="text-[#9A9AA4] text-sm">Confirm this photo before AI analysis begins</p>
      </motion.div>

      {/* Image card */}
      <motion.div variants={cardV} className="bg-white rounded-3xl border border-[#E4E2DC] overflow-hidden card-1 mb-4">
        {/* Image */}
        <div className="relative h-72 bg-[#F0EDE8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected photo"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle scan overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(122,158,110,0.08) 50%, transparent 100%)" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
          />
          {/* Corner reticles */}
          {[
            "top-3 left-3 border-t-2 border-l-2",
            "top-3 right-3 border-t-2 border-r-2",
            "bottom-3 left-3 border-b-2 border-l-2",
            "bottom-3 right-3 border-b-2 border-r-2",
          ].map((cls, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`absolute w-5 h-5 border-[#7A9E6E] rounded-sm ${cls}`}
            />
          ))}
        </div>

        {/* File info row */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0EDE8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EDE8] flex items-center justify-center">
              <FileImage size={16} className="text-[#9A9AA4]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1C] truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-[#9A9AA4]">{sizeStr} · {file.type.split("/")[1]?.toUpperCase()}</p>
            </div>
          </div>

          {/* Location status */}
          <div className="flex items-center gap-2">
            {locating ? (
              <>
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#C8A87A]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs text-[#C8A87A] font-medium">Detecting location</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-[#7A9E6E]" />
                <span className="text-xs text-[#7A9E6E] font-medium">Location ready</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={cardV} className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#1A1A1C] text-white rounded-2xl font-bold text-sm hover:bg-[#2C2C2E] transition-all card-2"
        >
          <Brain size={16} />
          Start AI Analysis
          <ArrowRight size={15} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[#5A5A62] border border-[#E4E2DC] hover:bg-white hover:border-[#D0CCC4] transition-all"
        >
          <RotateCcw size={14} />
          Choose different photo
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─── ANALYZING STAGE ─────────────────────────────────────────────────────── */
const analyzeSteps = [
  { label: "Processing image",           icon: Camera      },
  { label: "Detecting your location",    icon: Navigation  },
  { label: "AI Vision analysis",         icon: Eye         },
  { label: "Computing economic impact",  icon: IndianRupee },
  { label: "Mapping affected areas",     icon: MapPin      },
  { label: "Routing to department",      icon: Building2   },
];

function AnalyzingStage({ analyzeStep }: { analyzeStep: number | null }) {
  const [activeLine, setActiveLine] = useState(analyzeStep !== null ? Math.max(analyzeStep, 0) : 0);

  useEffect(() => {
    if (analyzeStep !== null) {
      setActiveLine(analyzeStep);
      return;
    }
    const t = setInterval(() => setActiveLine((l) => Math.min(l + 1, analyzeSteps.length)), 600);
    return () => clearInterval(t);
  }, [analyzeStep]);

  return (
    <div className="max-w-md mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h2 className="text-4xl font-serif text-[#1A1A1C] mb-3">Analyzing your photo</h2>
        <p className="text-[#9A9AA4] text-sm">Five AI agents working in parallel</p>
      </motion.div>

      {/* Brain animation */}
      <div className="flex justify-center mb-10">
        <div className="relative">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full bg-[#7A9E6E]"
              animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <div className="relative w-24 h-24 rounded-3xl bg-[#7A9E6E] flex items-center justify-center shadow-xl shadow-[#7A9E6E]/30">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Brain size={36} className="text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 text-left">
        {analyzeSteps.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < activeLine;
          const isCurrent = i === activeLine;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                isCurrent
                  ? "bg-white border-[#C8DFC0] card-1"
                  : isDone
                  ? "bg-[#F8FAF6] border-transparent"
                  : "bg-transparent border-transparent opacity-35"
              }`}
            >
              {isDone ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                  className="w-7 h-7 rounded-xl bg-[#EAF2E6] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-[#7A9E6E]" />
                </motion.div>
              ) : isCurrent ? (
                <div className="w-7 h-7 rounded-xl bg-[#EAF2E6] flex items-center justify-center flex-shrink-0">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 size={14} className="text-[#7A9E6E]" />
                  </motion.div>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-xl bg-[#F0EDE8] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#C0BDB6]" />
                </div>
              )}
              <span className={`text-sm font-medium ${isDone || isCurrent ? "text-[#1A1A1C]" : "text-[#C0BDB6]"}`}>
                {step.label}
              </span>
              {isDone && (
                <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  className="ml-auto text-[10px] font-bold text-[#7A9E6E] bg-[#EAF2E6] px-2 py-0.5 rounded-full">
                  Done
                </motion.span>
              )}
              {isCurrent && (
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="ml-auto text-[10px] font-bold text-[#C8A87A] bg-[#FAF0E0] px-2 py-0.5 rounded-full">
                  Processing
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="mt-6 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[10px] text-[#9A9AA4]">Active agents:</span>
        {["Vision AI", "Location AI", "Analysis AI", "Economics AI", "Router AI"].map((a, i) => (
          <motion.span key={a} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1, type: "spring" }}
            className="text-[9px] font-bold text-[#7A9E6E] bg-[#EAF2E6] px-2 py-1 rounded-full">
            {a}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── REVIEW STAGE ────────────────────────────────────────────────────────── */
function getSeverityLabel(score: number) {
  if (score >= 80) return "Critical threshold";
  if (score >= 60) return "High severity";
  if (score >= 40) return "Moderate severity";
  return "Low severity";
}
function getConfidenceLabel(pct: number) {
  if (pct >= 90) return "High confidence";
  if (pct >= 70) return "Moderate confidence";
  return "Low confidence";
}

function ReviewStage({
  data,
  previewUrl,
  submitting,
  onSubmit,
  onReset,
}: {
  data: AnalysisData;
  previewUrl: string;
  submitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const deptShort = data.dept.match(/\(([^)]+)\)/)?.[1] ?? data.dept.split(" ")[0];
  const elapsedSec = (data.elapsedMs / 1000).toFixed(1);
  const riskLabel = data.riskScore >= 80 ? "High Risk" : data.riskScore >= 50 ? "Medium Risk" : "Low Risk";
  const filledBars = Math.round((data.riskScore / 100) * 25);
  const urgencyShort = data.urgency.split(" ")[0];

  const analysisCards = [
    { icon: AlertTriangle, label: "Issue Type",        value: data.type,                                    sub: data.subcategory,                       color: "#D4726A", bg: "#FAECEA" },
    { icon: Zap,           label: "Severity Score",    value: `${data.severityScore}/100`,                  sub: getSeverityLabel(data.severityScore),    color: "#D4726A", bg: "#FAECEA" },
    { icon: Brain,         label: "AI Confidence",     value: `${data.confidence}%`,                        sub: getConfidenceLabel(data.confidence),     color: "#6A88AA", bg: "#E8EFF6" },
    { icon: IndianRupee,   label: "Economic Impact",   value: `${data.economic}/day`,                       sub: "Estimated daily loss",                 color: "#C8A87A", bg: "#FAF0E0" },
    { icon: Users,         label: "Affected Citizens", value: `${data.affected.toLocaleString("en-IN")}+`,  sub: "Daily commuters",                      color: "#9A9C5E", bg: "#F2F3E0" },
    { icon: Building2,     label: "Assigned Dept",     value: deptShort,                                    sub: "Auto-routed by AI",                    color: "#7A9E6E", bg: "#EAF2E6" },
    { icon: Shield,        label: "Risk Score",        value: `${data.riskScore}/100`,                      sub: "Infrastructure risk",                  color: "#D4726A", bg: "#FAECEA" },
    { icon: TrendingUp,    label: "Urgency",           value: urgencyShort,                                 sub: data.urgency,                           color: "#5E9E9E", bg: "#E4F2F2" },
  ];

  return (
    <motion.div className="max-w-5xl mx-auto" variants={containerV} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={cardV} className="flex items-start justify-between mb-8">
        <div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2E6] border border-[#C8DFC0] mb-3">
            <CheckCircle2 size={12} className="text-[#7A9E6E]" />
            <span className="text-[11px] font-bold text-[#5A7A50]">AI Analysis Complete · {elapsedSec}s</span>
          </motion.div>
          <h2 className="text-4xl font-serif text-[#1A1A1C]">Issue Intelligence Report</h2>
          <p className="text-sm text-[#9A9AA4] mt-1.5 flex items-center gap-1.5">
            <MapPin size={11} />
            {data.location}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onReset}
          className="p-2.5 rounded-xl bg-white border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all text-[#9A9AA4] hover:text-[#5A5A62]">
          <X size={16} />
        </motion.button>
      </motion.div>

      {/* Image + key metrics */}
      <motion.div variants={cardV} className="bg-white rounded-3xl border border-[#E4E2DC] overflow-hidden mb-5 card-1">
        <div className="grid md:grid-cols-5">
          <div className="md:col-span-2 relative h-56 md:h-72 bg-gradient-to-br from-[#F0EDE8] via-[#E8E4DC] to-[#DDD8D0] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Reported issue" className="absolute inset-0 w-full h-full object-cover" />
            <motion.div
              className="absolute rounded-xl border-2 border-[#D4726A]"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ top: "20%", left: "15%", right: "15%", bottom: "20%" }}
            />
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }} className="absolute top-[18%] left-[14%]">
              <span className="bg-[#D4726A] text-white text-[9px] font-bold px-2.5 py-1 rounded-md">
                {data.category.toUpperCase().replace(/_/g, " ")} DETECTED
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute bottom-3 right-3 glass rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Star size={11} className="text-[#C8A87A] fill-[#C8A87A]" />
              <span className="text-[10px] font-bold text-[#1A1A1C]">{data.confidence}% confidence</span>
            </motion.div>
          </div>

          <div className="md:col-span-3 p-6 flex flex-col gap-5 justify-center">
            <div>
              <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-wider mb-1">Classified as</p>
              <p className="text-3xl font-serif text-[#1A1A1C]">{data.type}</p>
              <p className="text-xs text-[#9A9AA4] mt-1">{data.subcategory}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {data.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-bold text-[#5A5A62] bg-[#F5F4F1] px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-[#1A1A1C]">Severity</span>
                <span className="text-xs font-bold text-[#D4726A] font-mono-data">{data.severityScore}/100</span>
              </div>
              <div className="h-2.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.severityScore}%` }}
                  transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(to right, #C8A87A, #D4726A)" }} />
              </div>
            </div>
            <motion.div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF0E0] border border-[#EDD9B8]"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <div className="w-10 h-10 rounded-xl bg-[#C8A87A]/20 flex items-center justify-center">
                <IndianRupee size={18} className="text-[#C8A87A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C8A87A] font-mono-data">{data.economic}</p>
                <p className="text-xs text-[#A87840]">{data.period} in estimated economic loss</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Analysis cards */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5" variants={containerV}>
        {analysisCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={cardV} whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-4 border border-[#E4E2DC] card-0 hover:card-2 transition-all cursor-default">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                <Icon size={15} style={{ color: card.color }} />
              </div>
              <p className="text-[9px] font-bold text-[#B0ACA4] uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-sm font-bold text-[#1A1A1C] font-mono-data leading-tight">{card.value}</p>
              <p className="text-[9px] text-[#C0BDB6] mt-0.5">{card.sub}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Risk score */}
      <motion.div variants={cardV} className="bg-white rounded-2xl border border-[#E4E2DC] p-5 mb-5 card-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-[#D4726A]" />
            <span className="text-sm font-bold text-[#1A1A1C]">Infrastructure Risk Visualization</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[#D4726A] font-mono-data">{data.riskScore}</span>
            <span className="text-[10px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-1 rounded-full uppercase tracking-wide">{riskLabel}</span>
          </div>
        </div>
        <div className="flex gap-1 h-4 mb-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div key={i} className="flex-1 rounded-sm"
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.6 + i * 0.025, ease: "backOut" }}
              style={{
                background: i < filledBars
                  ? i < Math.round(filledBars * 0.35) ? "#7A9E6E"
                  : i < Math.round(filledBars * 0.7) ? "#C8A87A"
                  : "#D4726A"
                  : "#F0EDE8",
                transformOrigin: "bottom",
              }} />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-[#9A9AA4]">
          <span>Safe (0)</span>
          <span className="font-bold text-[#D4726A]">Your issue: {data.riskScore}/100</span>
          <span>Critical (100)</span>
        </div>
      </motion.div>

      {/* Recommended action */}
      <motion.div variants={cardV} className="bg-white rounded-2xl border border-[#E4E2DC] p-5 mb-6 card-0">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAECEA] flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-[#D4726A]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-bold text-[#1A1A1C]">AI Recommended Action</p>
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full uppercase">
                {data.urgency}
              </motion.span>
            </div>
            <p className="text-sm text-[#5A5A62] leading-relaxed">{data.action}</p>
          </div>
        </div>
      </motion.div>

      {/* Submit CTAs */}
      <motion.div variants={cardV} className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={submitting ? {} : { scale: 1.02 }}
          whileTap={submitting ? {} : { scale: 0.98 }}
          onClick={onSubmit}
          disabled={submitting}
          className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all ${
            submitting
              ? "bg-[#7A9E6E]/70 text-white cursor-wait"
              : "bg-[#1A1A1C] text-white hover:bg-[#2C2C2E] card-2"
          }`}
        >
          {submitting ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={16} />
              </motion.div>
              Submitting to authorities...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Submit Report to {deptShort}
              <ArrowRight size={15} />
            </>
          )}
        </motion.button>
        <Link
          href="/citizen-dashboard"
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[#5A5A62] border border-[#E4E2DC] hover:border-[#D0CCC4] hover:bg-white transition-all"
        >
          <BarChart3 size={15} />
          My Dashboard
        </Link>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[#9A9AA4] hover:text-[#5A5A62] border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all"
        >
          <Camera size={15} />
          New Report
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─── CONFETTI ────────────────────────────────────────────────────────────── */
const CONFETTI_COLORS = ["#7A9E6E","#C8A87A","#D4726A","#6A88AA","#5E9E9E","#FFD700","#FF69B4","#4ECDC4"];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.5 + Math.random() * 2,
      size: 4 + Math.floor(Math.random() * 8),
      shape: i % 3 === 0 ? "rounded-full" : i % 3 === 1 ? "rounded-sm" : "",
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1, x: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
            rotate: 720 + Math.random() * 360,
            opacity: [1, 1, 0.8, 0],
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.23, 0.57, 0.92, 0.8] }}
        />
      ))}
    </div>
  );
}

/* ─── SUCCESS STAGE ───────────────────────────────────────────────────────── */
function SuccessStage({
  issueId,
  data,
  onReset,
}: {
  issueId: string;
  data: AnalysisData;
  onReset: () => void;
}) {
  const router = useRouter();
  const isLocal = issueId.startsWith("local_");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const deptShort = data.dept.match(/\(([^)]+)\)/)?.[1] ?? data.dept.split(" ")[0];
  const sevColor = data.severity === "critical" ? "#D4726A"
    : data.severity === "high" ? "#C8A87A"
    : data.severity === "medium" ? "#6A88AA"
    : "#7A9E6E";

  const handleCopy = () => {
    navigator.clipboard.writeText(issueId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-navigate to issue page after countdown
  useEffect(() => {
    if (isLocal) return;
    const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [isLocal]);

  useEffect(() => {
    if (!isLocal && countdown <= 0) {
      router.push(`/issues/${issueId}`);
    }
  }, [countdown, isLocal, issueId, router]);

  const stats = [
    { label: "Department", value: deptShort, color: "#7A9E6E", bg: "#EAF2E6" },
    { label: "Severity",   value: data.severity.charAt(0).toUpperCase() + data.severity.slice(1), color: sevColor, bg: sevColor + "18" },
    { label: "Daily Cost", value: data.economic, color: "#C8A87A", bg: "#FAF0E0" },
  ];

  return (
    <motion.div
      className="max-w-lg mx-auto text-center"
      variants={containerV}
      initial="hidden"
      animate="visible"
    >
      {showConfetti && <Confetti />}
      {/* Animated checkmark */}
      <motion.div variants={cardV} className="flex justify-center mb-8">
        <div className="relative flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: 96, height: 96, background: `rgba(122, 158, 110, ${0.15 / i})` }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.6, 0] }}
              transition={{ delay: i * 0.15, duration: 1.4, ease: "easeOut", repeat: Infinity, repeatDelay: 2.8 }}
            />
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
            className="relative w-24 h-24 rounded-3xl bg-[#7A9E6E] flex items-center justify-center shadow-xl shadow-[#7A9E6E]/30"
          >
            <CheckCircle2 size={44} className="text-white" strokeWidth={2} />
          </motion.div>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div variants={cardV}>
        <h2 className="text-5xl font-serif text-[#1A1A1C] mb-3">Issue Reported! 🎉</h2>
        <p className="text-[#9A9AA4] text-base mb-6">Your report is live and AI is routing it to the right authority.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAF2E6] border border-[#C8DFC0]">
          <span className="w-2 h-2 rounded-full bg-[#7A9E6E] pulse-dot" />
          <span className="text-xs font-bold text-[#5A7A50]">Live — Resolution tracking activated</span>
        </div>
      </motion.div>

      {/* Issue ID */}
      {!isLocal && (
        <motion.div variants={cardV}
          className="inline-flex items-center gap-2 bg-[#F5F4F1] border border-[#E4E2DC] rounded-xl px-4 py-2.5 mb-6 mt-6">
          <span className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-wider">Issue ID</span>
          <span className="text-xs font-mono text-[#5A5A62]">{issueId.slice(0, 22)}…</span>
          <button onClick={handleCopy}
            className="ml-1 p-1 rounded-lg hover:bg-[#E8E4DC] transition-colors text-[#9A9AA4] hover:text-[#5A5A62]">
            {copied ? <CheckCircle2 size={13} className="text-[#7A9E6E]" /> : <Copy size={13} />}
          </button>
        </motion.div>
      )}

      {/* Stats row */}
      <motion.div variants={cardV} className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E4E2DC] p-4 bg-white">
            <p className="text-[9px] font-bold text-[#B0ACA4] uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-sm font-bold font-mono-data" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* What happens next */}
      <motion.div variants={cardV} className="bg-[#F5F4F1] rounded-2xl p-5 mb-8 text-left">
        <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-wider mb-3">What happens next</p>
        <div className="flex flex-col gap-2.5">
          {[
            { step: "1", text: `Your report reaches ${deptShort} authorities`, done: true },
            { step: "2", text: "Field officer scheduled for inspection", done: false },
            { step: "3", text: "Work order issued and tracked live", done: false },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                item.done ? "bg-[#7A9E6E] text-white" : "bg-[#E4E2DC] text-[#9A9AA4]"
              }`}>
                {item.done ? "✓" : item.step}
              </div>
              <p className="text-xs text-[#5A5A62]">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={cardV} className="flex flex-col gap-3">
        {!isLocal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/issues/${issueId}`)}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#1A1A1C] text-white rounded-2xl font-bold text-sm hover:bg-[#2C2C2E] transition-all card-2"
          >
            <ExternalLink size={15} />
            Track This Issue
            {countdown > 0 && (
              <span className="ml-1 text-[10px] font-normal text-white/60">({countdown}s)</span>
            )}
          </motion.button>
        )}
        <div className="flex gap-3">
          <Link href="/citizen-dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-[#5A5A62] border border-[#E4E2DC] hover:bg-white transition-all">
            <BarChart3 size={14} />
            My Dashboard
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-[#9A9AA4] hover:text-[#5A5A62] border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all"
          >
            <Camera size={14} />
            Report Another
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────────────────── */
export default function ReportPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [issueId, setIssueId] = useState<string | null>(null);
  const prevBlobUrlRef = useRef<string | null>(null);

  const { analyzeStep, submitting, analyzeImage, submitIssue, reset } = useReportFlow();

  // Revoke old blob URL when a new one is created
  const setPreviewSafe = useCallback((file: File) => {
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    const url = URL.createObjectURL(file);
    prevBlobUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewSafe(file);
    setStage("preview");
  }, [setPreviewSafe]);

  const handleStartAnalysis = useCallback(async () => {
    if (!selectedFile) return;
    setStage("analyzing");
    const data = await analyzeImage(selectedFile);
    setAnalysisData(data);
    setStage("review");
  }, [selectedFile, analyzeImage]);

  const handleSubmit = useCallback(async () => {
    if (!analysisData || !selectedFile) return;
    const id = await submitIssue(analysisData, selectedFile);
    setIssueId(id);
    setStage("success");
  }, [analysisData, selectedFile, submitIssue]);

  const handleReset = useCallback(() => {
    reset();
    setSelectedFile(null);
    setAnalysisData(null);
    setIssueId(null);
    setStage("upload");
  }, [reset]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      {/* Background orbs */}
      <div className="fixed top-[-120px] right-[-120px] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,223,192,0.3) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(184,216,216,0.25) 0%, transparent 70%)" }} />

      <div className="pt-28 pb-24 px-6">
        <Stepper stage={stage} />

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {stage === "upload" && (
              <UploadStage onUpload={handleFileSelect} />
            )}
            {stage === "preview" && selectedFile && previewUrl && (
              <PreviewStage
                file={selectedFile}
                previewUrl={previewUrl}
                onConfirm={handleStartAnalysis}
                onCancel={handleReset}
              />
            )}
            {stage === "analyzing" && (
              <AnalyzingStage analyzeStep={analyzeStep} />
            )}
            {stage === "review" && analysisData && previewUrl && (
              <ReviewStage
                data={analysisData}
                previewUrl={previewUrl}
                submitting={submitting}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            )}
            {stage === "success" && issueId && analysisData && (
              <SuccessStage
                issueId={issueId}
                data={analysisData}
                onReset={handleReset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
