"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Camera, Upload, Brain, CheckCircle2, AlertTriangle, IndianRupee,
  Users, Shield, Building2, ArrowRight, Zap, MapPin, BarChart3,
  X, Loader2, Star, TrendingUp, Cpu, Eye, Activity, Sparkles,
} from "lucide-react";
import { useReportFlow, type AnalysisResult } from "@/lib/hooks/useReportFlow";
import { useRouter } from "next/navigation";

type Stage = "upload" | "analyzing" | "results";

/* ─── STAGGER ──────────────────────────────────────────── */
const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } };
const cardV = {
  hidden:  { opacity:0, y:24, scale:0.95 },
  visible: { opacity:1, y:0,  scale:1, transition:{ duration:0.5, ease:[0.22,1,0.36,1] as [number,number,number,number] } },
};

/* ─── UPLOAD STAGE ─────────────────────────────────────── */
function UploadStage({ onUpload, error }: { onUpload: (file: File) => void; error: string | null }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      variants={containerV}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardV} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2E6] border border-[#C8DFC0] mb-6">
          <Cpu size={12} className="text-[#7A9E6E]" />
          <span className="text-[11px] font-bold text-[#5A7A50] uppercase tracking-wider">AI Vision Ready</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
        </div>
        <h1 className="text-5xl font-serif text-[#1A1A1C] mb-4">Report a civic issue</h1>
        <p className="text-[#9A9AA4] text-base leading-relaxed max-w-md mx-auto">
          Upload one photo. Five AI agents will analyze, quantify, and route your report in under 3 seconds.
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-2xl bg-[#FAECEA] border border-[#F0C0BC] text-sm text-[#B05050] font-medium text-center"
        >
          {error}
        </motion.div>
      )}

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
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-16 flex flex-col items-center gap-6 transition-all duration-300 ${
            drag
              ? "border-[#7A9E6E] bg-[#EAF2E6]/60"
              : "border-[#D4D0C8] bg-white hover:border-[#7A9E6E]/60 hover:bg-[#F8FAF6]"
          }`}
        >
          {/* Animated background grid */}
          <div className="absolute inset-0 grid-lines opacity-30" />

          {/* Center icon */}
          <motion.div
            className={`relative w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-300 ${
              drag ? "bg-[#7A9E6E]" : "bg-[#F5F4F1] group-hover:bg-[#EAF2E6]"
            }`}
            whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
          >
            <Camera size={36} className={`transition-colors ${drag ? "text-white" : "text-[#B0ACA4] group-hover:text-[#7A9E6E]"}`} />
            {/* Orbiting dot */}
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
            <p className="text-sm text-[#9A9AA4]">JPG, PNG, HEIC · up to 20MB</p>
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

          {/* AI capability chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["Object Detection","Severity Analysis","Economic Modeling","Auto-Routing","Risk Prediction"].map((cap) => (
              <span key={cap} className="text-[9px] font-bold text-[#9A9AA4] bg-[#F5F4F1] px-2.5 py-1 rounded-full uppercase tracking-wide">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick report categories */}
      <motion.div variants={cardV} className="mt-6">
        <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-widest mb-3">Quick Report</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji:"🕳️", label:"Pothole",      color:"#FAECEA" },
            { emoji:"💧", label:"Flooding",     color:"#E8EFF6" },
            { emoji:"💡", label:"Streetlight",  color:"#FAF0E0" },
            { emoji:"🗑️", label:"Garbage",      color:"#F2F3E0" },
            { emoji:"🌳", label:"Tree Fall",    color:"#EAF2E6" },
            { emoji:"🚰", label:"Water Leak",   color:"#E4F2F2" },
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

/* ─── ANALYZING STAGE ──────────────────────────────────── */
const analyzeSteps = [
  { label: "Processing image",          icon: Camera,      },
  { label: "Detecting issue type",      icon: Eye,         },
  { label: "Classifying severity",      icon: Zap,         },
  { label: "Computing economic impact", icon: IndianRupee, },
  { label: "Mapping affected areas",    icon: MapPin,      },
  { label: "Routing to department",     icon: Building2,   },
];

function AnalyzingStage({ activeStep }: { activeStep: number | null }) {
  // Mirror real progress if available, otherwise auto-advance for visual polish
  const [activeLine, setActiveLine] = useState(
    activeStep !== null ? Math.max(activeStep, 0) : 0,
  );

  useEffect(() => {
    if (activeStep !== null) {
      setActiveLine(activeStep);
      return;
    }
    const t = setInterval(
      () => setActiveLine((l) => Math.min(l + 1, analyzeSteps.length)),
      600,
    );
    return () => clearInterval(t);
  }, [activeStep]);

  return (
    <div className="max-w-md mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-4xl font-serif text-[#1A1A1C] mb-3">Analyzing your photo</h2>
        <p className="text-[#9A9AA4] text-sm">Five AI agents working in parallel</p>
      </motion.div>

      {/* Central animation */}
      <div className="flex justify-center mb-10">
        <div className="relative">
          {[1,2,3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full bg-[#7A9E6E]"
              animate={{ scale: [1, 1.5 + i*0.3, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <div className="relative w-24 h-24 rounded-3xl bg-[#7A9E6E] flex items-center justify-center shadow-xl shadow-[#7A9E6E]/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-7 h-7 rounded-xl bg-[#EAF2E6] flex items-center justify-center flex-shrink-0"
                >
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
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-auto text-[10px] font-bold text-[#7A9E6E] bg-[#EAF2E6] px-2 py-0.5 rounded-full"
                >
                  Done
                </motion.span>
              )}
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-auto text-[10px] font-bold text-[#C8A87A] bg-[#FAF0E0] px-2 py-0.5 rounded-full"
                >
                  Processing
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Agents active row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex items-center justify-center gap-2"
      >
        <span className="text-[10px] text-[#9A9AA4]">Active agents:</span>
        {["Vision AI","Analysis AI","Economics AI","Router AI","Alert AI"].map((a, i) => (
          <motion.span
            key={a}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1, type: "spring" }}
            className="text-[9px] font-bold text-[#7A9E6E] bg-[#EAF2E6] px-2 py-1 rounded-full"
          >
            {a}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── RESULTS STAGE ────────────────────────────────────── */
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

function ResultsStage({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const router = useRouter();

  const deptShort = result.dept.match(/\(([^)]+)\)/)?.[1] ?? result.dept.split(' ')[0];
  const elapsedSec = (result.elapsedMs / 1000).toFixed(1);

  const riskLabel = result.riskScore >= 80 ? "High Risk" : result.riskScore >= 50 ? "Medium Risk" : "Low Risk";
  const urgencyShort = result.urgency.split(' ')[0]; // "Immediate", "Within", "Non-urgent"
  const urgencyLine = result.urgency === "Immediate" ? "Right now" : result.urgency;

  const analysisCards = [
    { icon: AlertTriangle, label: "Issue Type",        value: result.type,                                      sub: result.subcategory,                      color: "#D4726A", bg: "#FAECEA", delay: 0 },
    { icon: Zap,           label: "Severity Score",    value: `${result.severityScore}/100`,                    sub: getSeverityLabel(result.severityScore),   color: "#D4726A", bg: "#FAECEA", delay: 0.07 },
    { icon: Brain,         label: "AI Confidence",     value: `${result.confidence}%`,                          sub: getConfidenceLabel(result.confidence),    color: "#6A88AA", bg: "#E8EFF6", delay: 0.14 },
    { icon: IndianRupee,   label: "Economic Impact",   value: `${result.economic}/day`,                         sub: "Traffic delay costs",                   color: "#C8A87A", bg: "#FAF0E0", delay: 0.21 },
    { icon: Users,         label: "Affected Citizens", value: `${result.affected.toLocaleString("en-IN")}+`,    sub: "Daily commuters",                       color: "#9A9C5E", bg: "#F2F3E0", delay: 0.28 },
    { icon: Building2,     label: "Assigned Dept",     value: deptShort,                                        sub: "Auto-routed by AI",                     color: "#7A9E6E", bg: "#EAF2E6", delay: 0.35 },
    { icon: Shield,        label: "Risk Score",        value: `${result.riskScore}/100`,                        sub: "Infrastructure risk",                   color: "#D4726A", bg: "#FAECEA", delay: 0.42 },
    { icon: TrendingUp,    label: "Action",            value: urgencyShort,                                     sub: urgencyLine,                             color: "#5E9E9E", bg: "#E4F2F2", delay: 0.49 },
  ];

  const filledBars = Math.round((result.riskScore / 100) * 25);

  return (
    <motion.div
      className="max-w-5xl mx-auto"
      variants={containerV}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={cardV} className="flex items-start justify-between mb-8">
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2E6] border border-[#C8DFC0] mb-3"
          >
            <CheckCircle2 size={12} className="text-[#7A9E6E]" />
            <span className="text-[11px] font-bold text-[#5A7A50]">AI Analysis Complete · {elapsedSec} seconds</span>
          </motion.div>
          <h2 className="text-4xl font-serif text-[#1A1A1C]">Issue Intelligence Report</h2>
          <p className="text-sm text-[#9A9AA4] mt-1.5 flex items-center gap-1.5">
            <MapPin size={11} />
            {result.location}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="p-2.5 rounded-xl bg-white border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all text-[#9A9AA4] hover:text-[#5A5A62]"
        >
          <X size={16} />
        </motion.button>
      </motion.div>

      {/* Top section: Image + key metrics */}
      <motion.div variants={cardV} className="bg-white rounded-3xl border border-[#E4E2DC] overflow-hidden mb-5 card-1">
        <div className="grid md:grid-cols-5">
          {/* Image panel */}
          <div className="md:col-span-2 relative h-56 md:h-72 bg-gradient-to-br from-[#F0EDE8] via-[#E8E4DC] to-[#DDD8D0] flex items-center justify-center overflow-hidden">
            {result.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt="Reported issue"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="text-center opacity-40">
                <Camera size={48} className="text-[#B0ACA4] mx-auto mb-2" />
              </div>
            )}
            {/* Detection bounding box */}
            <motion.div
              className="absolute rounded-xl border-2 border-[#D4726A]"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ top: "20%", left: "15%", right: "15%", bottom: "20%" }}
            />
            {/* Detection label */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-[20%] left-[15%] -translate-y-full mb-1"
            >
              <span className="bg-[#D4726A] text-white text-[9px] font-bold px-2.5 py-1 rounded-md">
                {result.category.toUpperCase().replace(/_/g, " ")} DETECTED
              </span>
            </motion.div>
            {/* Confidence badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute bottom-3 right-3 glass rounded-xl px-3 py-2 flex items-center gap-1.5"
            >
              <Star size={11} className="text-[#C8A87A] fill-[#C8A87A]" />
              <span className="text-[10px] font-bold text-[#1A1A1C]">{result.confidence}% confidence</span>
            </motion.div>
          </div>

          {/* Key metrics right */}
          <div className="md:col-span-3 p-6 flex flex-col gap-5 justify-center">
            <div>
              <p className="text-[10px] font-bold text-[#9A9AA4] uppercase tracking-wider mb-1">Classified as</p>
              <p className="text-3xl font-serif text-[#1A1A1C]">{result.type}</p>
              <p className="text-xs text-[#9A9AA4] mt-1">{result.subcategory}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {result.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-[#5A5A62] bg-[#F5F4F1] px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>

            {/* Severity bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-[#1A1A1C]">Severity</span>
                <span className="text-xs font-bold text-[#D4726A] font-mono-data">{result.severityScore}/100</span>
              </div>
              <div className="h-2.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.severityScore}%` }}
                  transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(to right, #C8A87A, #D4726A)" }}
                />
              </div>
            </div>

            {/* Economic impact highlight */}
            <motion.div
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF0E0] border border-[#EDD9B8]"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#C8A87A]/20 flex items-center justify-center">
                <IndianRupee size={18} className="text-[#C8A87A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C8A87A] font-mono-data">{result.economic}</p>
                <p className="text-xs text-[#A87840]">{result.period} in economic loss</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Analysis cards grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        variants={containerV}
      >
        {analysisCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={cardV}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-4 border border-[#E4E2DC] card-0 hover:card-2 transition-all cursor-default"
              style={{ transitionDelay: `${card.delay}s` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg }}
              >
                <Icon size={15} style={{ color: card.color }} />
              </div>
              <p className="text-[9px] font-bold text-[#B0ACA4] uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-sm font-bold text-[#1A1A1C] font-mono-data leading-tight">{card.value}</p>
              <p className="text-[9px] text-[#C0BDB6] mt-0.5">{card.sub}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Risk score visualization */}
      <motion.div variants={cardV} className="bg-white rounded-2xl border border-[#E4E2DC] p-5 mb-5 card-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-[#D4726A]" />
            <span className="text-sm font-bold text-[#1A1A1C]">Infrastructure Risk Visualization</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[#D4726A] font-mono-data">{result.riskScore}</span>
            <span className="text-[10px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-1 rounded-full uppercase tracking-wide">{riskLabel}</span>
          </div>
        </div>
        <div className="flex gap-1 h-4 mb-2">
          {Array.from({length:25}).map((_,i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.6 + i*0.025, ease: "backOut" }}
              style={{
                background: i < filledBars
                  ? i < Math.round(filledBars * 0.35) ? "#7A9E6E"
                  : i < Math.round(filledBars * 0.7) ? "#C8A87A"
                  : "#D4726A"
                  : "#F0EDE8",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-[#9A9AA4]">
          <span>Safe (0)</span>
          <span className="font-bold text-[#D4726A]">Your issue: {result.riskScore}/100</span>
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
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full uppercase"
              >
                {result.urgency}
              </motion.span>
            </div>
            <p className="text-sm text-[#5A5A62] leading-relaxed">{result.action}</p>
          </div>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={cardV} className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/citizen-dashboard?issue=${result.issueId}`)}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#1A1A1C] text-white rounded-2xl font-bold text-sm hover:bg-[#2C2C2E] transition-all card-2 hover:card-3"
        >
          <CheckCircle2 size={16} />
          Submit to {deptShort} Authority
          <ArrowRight size={15} />
        </motion.button>
        <Link
          href="/citizen-dashboard"
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm text-[#5A5A62] border border-[#E4E2DC] hover:border-[#D0CCC4] hover:bg-white transition-all card-0 hover:card-1"
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

/* ─── PAGE ─────────────────────────────────────────────── */
const MIN_ANALYZE_MS = 2_600; // keep the animation visible for at least this long

export default function ReportPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [analyzeStartMs, setAnalyzeStartMs] = useState(0);
  const { activeStep, result, error, startFlow, reset } = useReportFlow();

  // Transition to results once flow is done + minimum display time has elapsed
  useEffect(() => {
    if (result && stage === "analyzing") {
      const elapsed = Date.now() - analyzeStartMs;
      const delay = Math.max(0, MIN_ANALYZE_MS - elapsed);
      const id = setTimeout(() => setStage("results"), delay);
      return () => clearTimeout(id);
    }
  }, [result, stage, analyzeStartMs]);

  // On error, return to upload with message shown
  useEffect(() => {
    if (error && stage === "analyzing") {
      setStage("upload");
    }
  }, [error, stage]);

  const handleUpload = useCallback(async (file: File) => {
    setAnalyzeStartMs(Date.now());
    setStage("analyzing");
    await startFlow(file);
  }, [startFlow]);

  const handleReset = useCallback(() => {
    reset();
    setStage("upload");
  }, [reset]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      {/* Orbs */}
      <div className="fixed top-[-120px] right-[-120px] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(200,223,192,0.3) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(184,216,216,0.25) 0%, transparent 70%)" }} />

      <div className="pt-28 pb-20 px-6">
        {/* Progress stepper */}
        <div className="flex items-center justify-center mb-16">
          {(["upload","analyzing","results"] as Stage[]).map((s, i) => {
            const done = stage==="results" && s!=="results" || stage==="analyzing" && s==="upload";
            const active = stage===s;
            return (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    animate={active ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      done ? "bg-[#7A9E6E] text-white"
                           : active ? "bg-[#1A1A1C] text-white card-1"
                           : "bg-[#F0EDE8] text-[#9A9AA4]"
                    }`}
                  >
                    {done ? <CheckCircle2 size={14} /> : i+1}
                  </motion.div>
                  <span className={`text-xs font-bold capitalize transition-all ${active?"text-[#1A1A1C]":"text-[#9A9AA4]"}`}>
                    {s==="upload"?"Upload":s==="analyzing"?"Analyzing":"Results"}
                  </span>
                </div>
                {i<2 && (
                  <div className="w-12 h-px mx-2 bg-[#E4E2DC] relative overflow-hidden">
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

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {stage === "upload" && (
              <UploadStage onUpload={handleUpload} error={error} />
            )}
            {stage === "analyzing" && (
              <AnalyzingStage activeStep={activeStep} />
            )}
            {stage === "results" && result && (
              <ResultsStage result={result} onReset={handleReset} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
