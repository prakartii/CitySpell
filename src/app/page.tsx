"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Camera,
  Brain,
  TrendingUp,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  Star,
  Activity,
  Users,
  IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";

const floatingCards = [
  {
    id: 1,
    icon: AlertTriangle,
    iconColor: "#D4726A",
    iconBg: "#FAECEA",
    label: "Pothole Detected",
    sub: "Ward 14 · High Severity",
    delay: 0,
    yOffset: 0,
  },
  {
    id: 2,
    icon: IndianRupee,
    iconColor: "#C8A87A",
    iconBg: "#FAF0E0",
    label: "₹45,000/day loss",
    sub: "Economic Impact",
    delay: 0.5,
    yOffset: 20,
  },
  {
    id: 3,
    icon: CheckCircle2,
    iconColor: "#7A9E6E",
    iconBg: "#EAF2E6",
    label: "PWD Assigned",
    sub: "ETA: 4 hours",
    delay: 1,
    yOffset: -10,
  },
  {
    id: 4,
    icon: Zap,
    iconColor: "#6A88AA",
    iconBg: "#E8EFF6",
    label: "Risk Score 89",
    sub: "Predictive AI",
    delay: 1.5,
    yOffset: 30,
  },
];

const steps = [
  {
    n: "01",
    icon: Camera,
    title: "Citizen Uploads Photo",
    desc: "Take a photo of any civic issue — pothole, waterlogging, broken streetlight — and submit it with your location.",
    color: "#EAF2E6",
    iconColor: "#7A9E6E",
  },
  {
    n: "02",
    icon: Brain,
    title: "AI Detects Issue",
    desc: "Our vision AI identifies the issue type, severity, and urgency with 94% accuracy using contextual city data.",
    color: "#E8EFF6",
    iconColor: "#6A88AA",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "AI Calculates Impact",
    desc: "Economic impact is computed in real-time — traffic delay costs, productivity loss, and infrastructure decay rates.",
    color: "#FAF0E0",
    iconColor: "#C8A87A",
  },
  {
    n: "04",
    icon: CheckCircle2,
    title: "Authority Takes Action",
    desc: "Issues are auto-routed to the right department with priority scores. Authorities act faster with full AI context.",
    color: "#FAECEA",
    iconColor: "#D4726A",
  },
];

const features = [
  {
    icon: Camera,
    title: "Photo Detection",
    desc: "Computer vision AI trained on 2M+ Indian civic images for precise issue classification.",
    tag: "Vision AI",
    tagColor: "#E8EFF6",
    tagText: "#6A88AA",
  },
  {
    icon: IndianRupee,
    title: "Economic Impact",
    desc: "Real-time cost modeling: traffic delays, productivity loss, and infrastructure depreciation.",
    tag: "Analytics",
    tagColor: "#FAF0E0",
    tagText: "#C8A87A",
  },
  {
    icon: Zap,
    title: "Auto Routing",
    desc: "Smart department assignment using issue context, ward mapping, and departmental load.",
    tag: "Automation",
    tagColor: "#EAF2E6",
    tagText: "#7A9E6E",
  },
  {
    icon: Shield,
    title: "Risk Intelligence",
    desc: "Predictive failure modeling forecasts infrastructure breakdown 30 days in advance.",
    tag: "Prediction",
    tagColor: "#FAECEA",
    tagText: "#D4726A",
  },
  {
    icon: BarChart3,
    title: "Authority Dashboard",
    desc: "Premium analytics for municipal officers with ward-level performance scorecards.",
    tag: "Dashboard",
    tagColor: "#F5F0FA",
    tagText: "#8A6AAA",
  },
];

const stats = [
  { value: "145", suffix: "+", label: "Issues Resolved", icon: CheckCircle2, color: "#7A9E6E" },
  { value: "₹2.3", suffix: " Cr", label: "Loss Prevented", icon: IndianRupee, color: "#C8A87A" },
  { value: "87", suffix: "%", label: "Prediction Accuracy", icon: Activity, color: "#6A88AA" },
  { value: "12", suffix: "K+", label: "Active Citizens", icon: Users, color: "#D4726A" },
];

function CityMapSVG() {
  const gridLines = [];
  for (let i = 0; i <= 10; i++) {
    gridLines.push(
      <line
        key={`h${i}`}
        x1="0"
        y1={i * 40}
        x2="400"
        y2={i * 40}
        stroke="#E4E2DC"
        strokeWidth="1"
      />,
      <line
        key={`v${i}`}
        x1={i * 40}
        y1="0"
        x2={i * 40}
        y2="400"
        stroke="#E4E2DC"
        strokeWidth="1"
      />
    );
  }

  const blocks = [
    { x: 20, y: 20, w: 60, h: 60 },
    { x: 100, y: 20, w: 80, h: 40 },
    { x: 200, y: 20, w: 40, h: 60 },
    { x: 260, y: 20, w: 120, h: 40 },
    { x: 20, y: 100, w: 40, h: 80 },
    { x: 80, y: 100, w: 100, h: 40 },
    { x: 200, y: 100, w: 60, h: 80 },
    { x: 280, y: 80, w: 100, h: 60 },
    { x: 20, y: 200, w: 80, h: 60 },
    { x: 120, y: 180, w: 60, h: 80 },
    { x: 200, y: 200, w: 100, h: 40 },
    { x: 320, y: 180, w: 60, h: 100 },
    { x: 20, y: 280, w: 120, h: 100 },
    { x: 160, y: 280, w: 80, h: 60 },
    { x: 260, y: 300, w: 120, h: 80 },
  ];

  const markers = [
    { cx: 80, cy: 50, color: "#D4726A", r: 7, pulse: true },
    { cx: 180, cy: 140, color: "#D4726A", r: 6, pulse: true },
    { cx: 240, cy: 60, color: "#C8A87A", r: 5, pulse: false },
    { cx: 310, cy: 120, color: "#C8A87A", r: 5, pulse: false },
    { cx: 60, cy: 240, color: "#7A9E6E", r: 5, pulse: false },
    { cx: 150, cy: 320, color: "#7A9E6E", r: 5, pulse: false },
    { cx: 280, cy: 220, color: "#7A9E6E", r: 5, pulse: false },
    { cx: 350, cy: 260, color: "#C8A87A", r: 5, pulse: false },
    { cx: 100, cy: 160, color: "#D4726A", r: 6, pulse: true },
  ];

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-red">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="fadeOut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines}

      {/* City blocks */}
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="3"
          fill="#F0EDE8"
          stroke="#E4E2DC"
          strokeWidth="1"
        />
      ))}

      {/* Road highlights */}
      <rect x="160" y="0" width="20" height="400" fill="#FAF9F6" opacity="0.8" />
      <rect x="0" y="160" width="400" height="20" fill="#FAF9F6" opacity="0.8" />

      {/* Markers */}
      {markers.map((m, i) => (
        <g key={i}>
          {m.pulse && (
            <circle cx={m.cx} cy={m.cy} r={m.r + 6} fill={m.color} opacity="0.15" />
          )}
          <circle
            cx={m.cx}
            cy={m.cy}
            r={m.r}
            fill={m.color}
            filter={m.pulse ? "url(#glow-red)" : undefined}
          />
          <circle cx={m.cx} cy={m.cy} r={m.r - 2} fill="white" opacity="0.4" />
        </g>
      ))}

      {/* Fade overlays */}
      <rect x="0" y="0" width="400" height="400" fill="url(#fadeOut)" />
      <rect x="0" y="0" width="400" height="400" fill="url(#fadeRight)" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
        {/* Background decorations */}
        <div
          className="absolute top-[-120px] right-[-120px] w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #C8DFC0 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #B8D8D8 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left: Text */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2E6] text-[#5A7A50] text-xs font-medium border border-[#C8DFC0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot inline-block" />
                Civic Intelligence Layer · India
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-1"
            >
              <h1 className="text-5xl lg:text-7xl font-serif text-[#1A1A1C] leading-[1.05]">
                Civic Intelligence,
              </h1>
              <h1 className="text-5xl lg:text-7xl font-serif leading-[1.05]" style={{ color: "#7A9E6E" }}>
                Powered by AI
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#5A5A62] leading-relaxed max-w-lg"
            >
              Transform city complaints into actionable intelligence using AI agents,
              economic impact analysis, and predictive infrastructure monitoring.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1C] text-white rounded-xl font-medium text-sm hover:bg-[#2C2C2E] transition-all shadow-sm hover:shadow-md"
              >
                <Camera size={15} />
                Report an Issue
              </Link>
              <Link
                href="/citizen-dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1A1A1C] rounded-xl font-medium text-sm hover:bg-[#F5F4F1] transition-all border border-[#E4E2DC] shadow-sm"
              >
                Explore Dashboard
                <ArrowRight size={15} />
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {["#D4B896", "#A8C8C8", "#C8DFC0", "#D0C0E8"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#FAF9F6] flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ background: c }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#9A9AA4]">
                <span className="text-[#1A1A1C] font-medium">12,000+</span> citizens across 6 cities
              </p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} className="text-[#C8A87A] fill-[#C8A87A]" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Map + floating cards */}
          <div className="relative h-[500px] lg:h-[580px]">
            {/* Map card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute inset-0 glass rounded-3xl overflow-hidden border border-white/80 shadow-xl shadow-black/8"
            >
              <div className="absolute top-0 left-0 right-0 px-4 py-3 border-b border-[#E4E2DC]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#7A9E6E]" />
                  <span className="text-xs font-medium text-[#5A5A62]">Live Ward Intelligence · Bengaluru</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
                  <span className="text-[10px] text-[#7A9E6E] font-medium">LIVE</span>
                </div>
              </div>
              <div className="absolute inset-0 top-10">
                <CityMapSVG />
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3 glass rounded-xl px-3 py-2">
                {[
                  { color: "#D4726A", label: "Critical" },
                  { color: "#C8A87A", label: "Medium" },
                  { color: "#7A9E6E", label: "Resolved" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                    <span className="text-[10px] text-[#5A5A62] font-medium">{l.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating cards */}
            {floatingCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  className="absolute z-10 glass rounded-2xl px-3.5 py-3 flex items-center gap-3 shadow-lg shadow-black/8 border border-white/80 min-w-[170px]"
                  style={{
                    top: `${10 + card.id * 22}%`,
                    right: card.id % 2 === 0 ? "-60px" : undefined,
                    left: card.id % 2 === 1 ? "-60px" : undefined,
                  }}
                  initial={{ opacity: 0, x: card.id % 2 === 0 ? 20 : -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, card.yOffset, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.4 + card.delay * 0.1 },
                    x: { duration: 0.5, delay: 0.4 + card.delay * 0.1 },
                    y: {
                      duration: 4 + card.id,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: card.delay,
                    },
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: card.iconBg }}
                  >
                    <Icon size={14} style={{ color: card.iconColor }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1C] leading-tight">{card.label}</p>
                    <p className="text-[10px] text-[#9A9AA4] mt-0.5">{card.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 border-y border-[#E4E2DC] bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `${stat.color}18` }}
                  >
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#1A1A1C] tracking-tight">
                      {stat.value}
                      <span style={{ color: stat.color }}>{stat.suffix}</span>
                    </p>
                    <p className="text-xs text-[#9A9AA4] mt-0.5 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium text-[#7A9E6E] uppercase tracking-widest">Process</span>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1A1A1C] mt-3">
            How it works
          </h2>
          <p className="text-[#5A5A62] mt-4 max-w-lg mx-auto text-base leading-relaxed">
            From citizen observation to authority action — in under 4 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-5 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#E4E2DC] to-transparent z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative z-10 flex flex-col gap-4 bg-white rounded-2xl p-6 border border-[#E4E2DC] hover:border-[#D4D0C8] hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: step.color }}
                  >
                    <Icon size={20} style={{ color: step.iconColor }} />
                  </div>
                  <span className="text-4xl font-bold text-[#F0EDE8] select-none">{step.n}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1C] text-sm leading-tight">{step.title}</h3>
                  <p className="text-xs text-[#9A9AA4] mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white border-y border-[#E4E2DC]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium text-[#7A9E6E] uppercase tracking-widest">Features</span>
            <h2 className="text-4xl lg:text-5xl font-serif text-[#1A1A1C] mt-3">
              Built for real cities
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-[#FAF9F6] rounded-2xl p-5 border border-[#E4E2DC] hover:border-[#D0CCC4] hover:bg-white hover:shadow-sm transition-all group cursor-default"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.tagColor }}
                  >
                    <Icon size={18} style={{ color: f.tagText }} />
                  </div>
                  <h3 className="font-semibold text-[#1A1A1C] text-sm mb-2">{f.title}</h3>
                  <p className="text-[11px] text-[#9A9AA4] leading-relaxed mb-3">{f.desc}</p>
                  <span
                    className="inline-flex text-[10px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: f.tagColor, color: f.tagText }}
                  >
                    {f.tag}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Ward Intelligence preview */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <span className="text-xs font-medium text-[#7A9E6E] uppercase tracking-widest">Ward Intelligence</span>
            <h2 className="text-4xl lg:text-5xl font-serif text-[#1A1A1C] leading-tight">
              Your city,<br />understood in real time
            </h2>
            <p className="text-[#5A5A62] leading-relaxed text-base">
              Every ward has a live health score. Watch issues emerge, escalate, and resolve on a beautiful interactive intelligence map — updated every 15 minutes.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Ward 14 · Indiranagar", score: 82, color: "#7A9E6E", issues: 3 },
                { label: "Ward 21 · Koramangala", score: 61, color: "#C8A87A", issues: 8 },
                { label: "Ward 7 · Shivajinagar", score: 38, color: "#D4726A", issues: 14 },
              ].map((ward) => (
                <div key={ward.label} className="bg-white rounded-xl p-4 border border-[#E4E2DC] flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#1A1A1C]">{ward.label}</span>
                      <span className="text-xs text-[#9A9AA4]">{ward.issues} issues</span>
                    </div>
                    <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${ward.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: ward.color }}
                      />
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `${ward.color}18`, color: ward.color }}
                  >
                    {ward.score}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#7A9E6E] hover:text-[#5A7A50] transition-colors"
            >
              View Full Map <ArrowRight size={15} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-[480px] glass rounded-3xl overflow-hidden border border-white/80 shadow-xl shadow-black/8"
          >
            <div className="px-4 py-3 border-b border-[#E4E2DC]/60 flex items-center gap-2">
              <MapPin size={13} className="text-[#7A9E6E]" />
              <span className="text-xs font-medium text-[#5A5A62]">Ward Intelligence Map</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
                <span className="text-[10px] text-[#7A9E6E] font-medium">LIVE</span>
              </div>
            </div>
            <div className="relative h-full">
              <CityMapSVG />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-[#1A1A1C] mx-6 mb-6 rounded-3xl overflow-hidden relative">
        <div
          className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #C8DFC0 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif text-white leading-tight mb-6">
              Your city needs<br />your voice
            </h2>
            <p className="text-[#9A9AA4] text-base mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of citizens who are transforming Indian cities with AI-powered civic intelligence.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A9E6E] text-white rounded-xl font-medium text-sm hover:bg-[#5A7A50] transition-all shadow-sm"
              >
                <Camera size={15} />
                Report an Issue
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Explore Platform
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7A9E6E] flex items-center justify-center">
                <MapPin size={13} className="text-white" />
              </div>
              <span className="font-semibold text-[#1A1A1C] text-sm">
                CitySpell<span className="text-[#7A9E6E]">AI</span>
              </span>
            </Link>
            <p className="text-xs text-[#9A9AA4] max-w-xs leading-relaxed">
              The Civic Intelligence Layer for Indian Cities. AI-powered civic tech for a better urban tomorrow.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs">
            {[
              { heading: "Platform", links: ["Report Issue", "Ward Map", "Dashboard", "Authority Login"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <span className="font-semibold text-[#1A1A1C]">{col.heading}</span>
                {col.links.map((link) => (
                  <span key={link} className="text-[#9A9AA4] hover:text-[#5A5A62] cursor-pointer transition-colors">
                    {link}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#E4E2DC] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9A9AA4]">© 2026 CitySpell AI. All rights reserved.</p>
          <p className="text-xs text-[#9A9AA4]">
            Built with care for Indian cities 🌿
          </p>
        </div>
      </footer>
    </div>
  );
}
