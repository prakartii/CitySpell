"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Camera,
  Upload,
  Brain,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Users,
  Shield,
  Building2,
  ArrowRight,
  Zap,
  MapPin,
  BarChart3,
  X,
  Loader2,
  Star,
  TrendingUp,
} from "lucide-react";

type Stage = "upload" | "analyzing" | "results";

const mockAnalysis = {
  issueType: "Road Pothole",
  severity: 87,
  confidence: 94,
  economicImpact: "₹52,000",
  economicDetail: "per day",
  affectedCitizens: 3200,
  department: "Public Works Department (PWD)",
  riskScore: 89,
  riskLevel: "High",
  recommendedAction: "Immediate patching required within 48 hours. Road surface degradation is accelerating.",
  location: "5th Cross Road, Indiranagar, Ward 14",
  category: "Infrastructure",
  subCategory: "Road & Pavement",
  tags: ["Pothole", "Road Damage", "High Traffic Zone", "Monsoon Risk"],
};

const analysisCards = [
  {
    icon: AlertTriangle,
    label: "Issue Type",
    value: "Road Pothole",
    sub: mockAnalysis.subCategory,
    color: "#D4726A",
    bg: "#FAECEA",
    delay: 0,
  },
  {
    icon: Zap,
    label: "Severity Score",
    value: "87/100",
    sub: "Critical threshold",
    color: "#D4726A",
    bg: "#FAECEA",
    delay: 0.08,
  },
  {
    icon: Brain,
    label: "AI Confidence",
    value: "94%",
    sub: "High accuracy",
    color: "#6A88AA",
    bg: "#E8EFF6",
    delay: 0.16,
  },
  {
    icon: IndianRupee,
    label: "Economic Impact",
    value: "₹52,000/day",
    sub: "Traffic delay costs",
    color: "#C8A87A",
    bg: "#FAF0E0",
    delay: 0.24,
  },
  {
    icon: Users,
    label: "Affected Citizens",
    value: "3,200+",
    sub: "Daily commuters",
    color: "#9A9C5E",
    bg: "#F2F3E0",
    delay: 0.32,
  },
  {
    icon: Building2,
    label: "Assigned Dept",
    value: "PWD",
    sub: "Public Works Dept.",
    color: "#7A9E6E",
    bg: "#EAF2E6",
    delay: 0.4,
  },
  {
    icon: Shield,
    label: "Risk Score",
    value: "89/100",
    sub: "Infrastructure risk",
    color: "#D4726A",
    bg: "#FAECEA",
    delay: 0.48,
  },
  {
    icon: TrendingUp,
    label: "Recommended Action",
    value: "Immediate",
    sub: "Patch within 48h",
    color: "#5E9E9E",
    bg: "#E4F2F2",
    delay: 0.56,
  },
];

function UploadZone({ onUpload }: { onUpload: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 max-w-lg mx-auto text-center">
      <div>
        <h1 className="text-4xl font-serif text-[#1A1A1C] mb-3">Report a civic issue</h1>
        <p className="text-[#9A9AA4] text-base leading-relaxed">
          Upload a photo and our AI will analyze the issue, calculate economic impact, and route it to the right authority.
        </p>
      </div>

      <motion.button
        onClick={() => { inputRef.current?.click(); onUpload(); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); onUpload(); }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center gap-5 transition-all cursor-pointer ${
          dragging
            ? "border-[#7A9E6E] bg-[#EAF2E6]"
            : "border-[#D4D0C8] bg-white hover:border-[#7A9E6E] hover:bg-[#F8FAF6]"
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
            dragging ? "bg-[#7A9E6E]" : "bg-[#F5F4F1]"
          }`}
        >
          <Camera size={32} className={dragging ? "text-white" : "text-[#9A9AA4]"} />
        </div>
        <div>
          <p className="text-base font-semibold text-[#1A1A1C]">
            {dragging ? "Drop your photo here" : "Upload or drag a photo"}
          </p>
          <p className="text-sm text-[#9A9AA4] mt-1">JPG, PNG, HEIC up to 20MB</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1C] rounded-xl text-white text-sm font-medium">
            <Upload size={14} />
            Choose photo
          </div>
          <span className="text-sm text-[#9A9AA4]">or use camera</span>
        </div>
      </motion.button>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { icon: "📸", tip: "Clear, well-lit photos work best" },
          { icon: "📍", tip: "Enable location for precise routing" },
          { icon: "🎯", tip: "Focus on the main issue area" },
        ].map((t, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-[#E4E2DC] text-center">
            <span className="text-xl">{t.icon}</span>
            <p className="text-[10px] text-[#9A9AA4] leading-relaxed">{t.tip}</p>
          </div>
        ))}
      </div>

      {/* Quick categories */}
      <div className="w-full">
        <p className="text-xs font-medium text-[#9A9AA4] mb-3 text-left uppercase tracking-wider">Common issues</p>
        <div className="flex flex-wrap gap-2">
          {["🕳️ Pothole", "💧 Waterlogging", "💡 Streetlight", "🗑️ Garbage", "🌳 Tree Fall", "🚰 Water Leak"].map((tag) => (
            <button
              key={tag}
              onClick={onUpload}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E4E2DC] text-xs text-[#5A5A62] hover:border-[#7A9E6E] hover:text-[#5A7A50] hover:bg-[#EAF2E6] transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyzingState() {
  const steps = [
    { label: "Processing image", done: true },
    { label: "Detecting issue type", done: true },
    { label: "Calculating severity", done: true },
    { label: "Computing economic impact", current: true },
    { label: "Identifying affected areas", upcoming: true },
    { label: "Routing to department", upcoming: true },
  ];

  return (
    <div className="flex flex-col items-center gap-10 max-w-md mx-auto text-center">
      <div>
        <h2 className="text-3xl font-serif text-[#1A1A1C] mb-2">AI Analysis in progress</h2>
        <p className="text-[#9A9AA4] text-sm">Our vision AI is processing your image</p>
      </div>

      {/* Pulsing brain animation */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-[-20px] rounded-full bg-[#EAF2E6]"
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          className="absolute inset-[-10px] rounded-full bg-[#EAF2E6]"
        />
        <div className="relative w-20 h-20 rounded-3xl bg-[#7A9E6E] flex items-center justify-center shadow-lg shadow-[#7A9E6E]/30">
          <Brain size={32} className="text-white" />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full flex flex-col gap-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              step.current
                ? "bg-white border border-[#E4E2DC] shadow-sm"
                : step.done
                ? "bg-[#F8F7F4]"
                : "opacity-40"
            }`}
          >
            {step.done ? (
              <CheckCircle2 size={16} className="text-[#7A9E6E] flex-shrink-0" />
            ) : step.current ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={16} className="text-[#7A9E6E] flex-shrink-0" />
              </motion.div>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-[#D4D0C8] flex-shrink-0" />
            )}
            <span className={`text-sm ${step.done || step.current ? "text-[#1A1A1C] font-medium" : "text-[#9A9AA4]"}`}>
              {step.label}
            </span>
            {step.done && (
              <span className="ml-auto text-[10px] text-[#7A9E6E] font-medium">Done</span>
            )}
            {step.current && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-auto text-[10px] text-[#C8A87A] font-medium"
              >
                Processing...
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ResultsView({ onReset }: { onReset: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#EAF2E6] flex items-center justify-center">
              <CheckCircle2 size={13} className="text-[#7A9E6E]" />
            </div>
            <span className="text-xs font-medium text-[#7A9E6E]">AI Analysis Complete</span>
          </div>
          <h2 className="text-3xl font-serif text-[#1A1A1C]">Issue Analysis Report</h2>
          <p className="text-sm text-[#9A9AA4] mt-1">
            <MapPin size={11} className="inline mr-1" />
            {mockAnalysis.location}
          </p>
        </div>
        <button
          onClick={onReset}
          className="p-2.5 rounded-xl bg-white border border-[#E4E2DC] text-[#9A9AA4] hover:text-[#5A5A62] hover:bg-[#F5F4F1] transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Mock image placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden mb-6"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-52 md:h-64 bg-gradient-to-br from-[#F5F4F1] via-[#EDE9E0] to-[#E0DBD0] flex items-center justify-center overflow-hidden">
            <div className="text-center opacity-50">
              <Camera size={40} className="text-[#B0ACA4] mx-auto mb-2" />
              <p className="text-xs text-[#B0ACA4]">Road photo uploaded</p>
            </div>
            {/* Bounding box overlay */}
            <div className="absolute inset-8 border-2 border-[#D4726A] rounded-lg border-dashed opacity-60" />
            <div className="absolute top-8 left-8 bg-[#D4726A] text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
              POTHOLE DETECTED
            </div>
            {/* Confidence badge */}
            <div className="absolute bottom-3 right-3 glass rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
              <Star size={11} className="text-[#C8A87A] fill-[#C8A87A]" />
              <span className="text-[10px] font-bold text-[#1A1A1C]">94% confidence</span>
            </div>
          </div>

          {/* Key info */}
          <div className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs text-[#9A9AA4] mb-1">Issue Type</p>
              <p className="text-xl font-bold text-[#1A1A1C]">{mockAnalysis.issueType}</p>
              <div className="flex items-center gap-2 mt-2">
                {mockAnalysis.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[9px] font-medium text-[#5A5A62] bg-[#F5F4F1] px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Severity bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-[#9A9AA4]">Severity</p>
                <span className="text-xs font-bold text-[#D4726A]">{mockAnalysis.severity}/100</span>
              </div>
              <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mockAnalysis.severity}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#C8A87A] to-[#D4726A]"
                />
              </div>
            </div>

            {/* Economic impact highlight */}
            <div className="bg-[#FAF0E0] rounded-xl p-4">
              <p className="text-[10px] text-[#9A9AA4] mb-1">Economic Impact</p>
              <p className="text-2xl font-bold text-[#C8A87A]">{mockAnalysis.economicImpact}</p>
              <p className="text-xs text-[#A87840]">{mockAnalysis.economicDetail} in traffic delay costs</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analysis cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {analysisCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: card.delay }}
              className="bg-white rounded-2xl p-4 border border-[#E4E2DC] hover:border-[#D0CCC4] hover:shadow-sm transition-all"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg }}
              >
                <Icon size={15} style={{ color: card.color }} />
              </div>
              <p className="text-[10px] text-[#9A9AA4] mb-0.5 font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-sm font-bold text-[#1A1A1C]">{card.value}</p>
              <p className="text-[10px] text-[#B0ACA4] mt-0.5">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recommended action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-5 border border-[#E4E2DC] mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAECEA] flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-[#D4726A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-[#1A1A1C]">Recommended Action</p>
              <span className="text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full uppercase tracking-wide">Urgent</span>
            </div>
            <p className="text-sm text-[#5A5A62] leading-relaxed">{mockAnalysis.recommendedAction}</p>
          </div>
        </div>
      </motion.div>

      {/* Risk score visual */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white rounded-2xl p-5 border border-[#E4E2DC] mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#D4726A]" />
            <span className="text-sm font-semibold text-[#1A1A1C]">Infrastructure Risk Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#D4726A]">89</span>
            <span className="text-[10px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-1 rounded-full">HIGH RISK</span>
          </div>
        </div>
        <div className="flex gap-1 h-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.7 + i * 0.03 }}
              className="flex-1 rounded-sm"
              style={{
                background: i < 17
                  ? i < 6 ? "#7A9E6E" : i < 12 ? "#C8A87A" : "#D4726A"
                  : "#F0EDE8",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#9A9AA4]">Safe (0)</span>
          <span className="text-[9px] text-[#9A9AA4]">Critical (100)</span>
        </div>
      </motion.div>

      {/* Submit CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-[#1A1A1C] text-white rounded-xl font-semibold text-sm hover:bg-[#2C2C2E] transition-all shadow-sm">
          <CheckCircle2 size={16} />
          Submit to PWD
          <ArrowRight size={15} />
        </button>
        <Link
          href="/citizen-dashboard"
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-[#5A5A62] border border-[#E4E2DC] hover:border-[#D0CCC4] hover:bg-[#F5F4F1] transition-all"
        >
          <BarChart3 size={15} />
          View Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

export default function ReportPage() {
  const [stage, setStage] = useState<Stage>("upload");

  const handleUpload = () => {
    setStage("analyzing");
    setTimeout(() => setStage("results"), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      {/* Background */}
      <div
        className="fixed top-[-160px] right-[-160px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8DFC0 0%, transparent 70%)" }}
      />

      <div className="pt-28 pb-20 px-6">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {(["upload", "analyzing", "results"] as Stage[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${stage === s || (stage === "results" && s !== "upload") ? "opacity-100" : "opacity-40"}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    (stage === "results" && s !== "results") || (stage === "analyzing" && s === "upload")
                      ? "bg-[#7A9E6E] text-white"
                      : stage === s
                      ? "bg-[#1A1A1C] text-white"
                      : "bg-[#F0EDE8] text-[#9A9AA4]"
                  }`}
                >
                  {(stage === "results" && s !== "results") || (stage === "analyzing" && s === "upload") ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs font-medium capitalize ${stage === s ? "text-[#1A1A1C]" : "text-[#9A9AA4]"}`}>
                  {s === "upload" ? "Upload" : s === "analyzing" ? "Analyzing" : "Results"}
                </span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-[#E4E2DC]" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {stage === "upload" && <UploadZone onUpload={handleUpload} />}
            {stage === "analyzing" && <AnalyzingState />}
            {stage === "results" && <ResultsView onReset={() => setStage("upload")} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
