"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  MapPin,
  Camera,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Bell,
  ChevronRight,
  Activity,
  Star,
  Zap,
  CircleDot,
} from "lucide-react";

const wardIssues = [
  { id: 1, type: "Pothole", location: "MG Road, Ward 14", severity: "High", status: "In Progress", time: "2h ago", icon: "🕳️", color: "#D4726A", bgColor: "#FAECEA" },
  { id: 2, type: "Waterlogging", location: "HSR Layout, Ward 21", severity: "Critical", status: "Assigned", time: "4h ago", icon: "💧", color: "#6A88AA", bgColor: "#E8EFF6" },
  { id: 3, type: "Broken Light", location: "Indiranagar, Ward 18", severity: "Medium", status: "Resolved", time: "1d ago", icon: "💡", color: "#7A9E6E", bgColor: "#EAF2E6" },
  { id: 4, type: "Garbage", location: "Koramangala, Ward 22", severity: "Low", status: "Pending", time: "3d ago", icon: "🗑️", color: "#C8A87A", bgColor: "#FAF0E0" },
  { id: 5, type: "Road Crack", location: "Bellandur, Ward 31", severity: "High", status: "In Progress", time: "5h ago", icon: "🔧", color: "#D4726A", bgColor: "#FAECEA" },
];

const myComplaints = [
  { id: "CS-2847", type: "Pothole on 5th Cross", ward: "Ward 14", status: "In Progress", progress: 65, date: "Jun 18", dept: "PWD" },
  { id: "CS-2801", type: "Streetlight not working", ward: "Ward 14", status: "Resolved", progress: 100, date: "Jun 12", dept: "BBMP-E" },
  { id: "CS-2789", type: "Garbage overflow", ward: "Ward 14", status: "Assigned", progress: 30, date: "Jun 10", dept: "BBMP-S" },
];

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
        <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="70%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Grid */}
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
          {m.pulse && <circle cx={m.cx} cy={m.cy} r={m.r + 5} fill={m.color} opacity="0.15" />}
          <circle cx={m.cx} cy={m.cy} r={m.r} fill={m.color} />
          <circle cx={m.cx} cy={m.cy} r={m.r - 2} fill="white" opacity="0.35" />
        </g>
      ))}
      <rect x="0" y="0" width="400" height="220" fill="url(#fadeBottom)" />
    </svg>
  );
}

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <p className="text-sm text-[#9A9AA4] mb-1">Good morning,</p>
            <h1 className="text-3xl font-serif text-[#1A1A1C]">Arjun Sharma</h1>
            <p className="text-sm text-[#9A9AA4] mt-1">Ward 14 · Indiranagar, Bengaluru</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white rounded-xl border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all">
              <Bell size={16} className="text-[#5A5A62]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4726A]" />
            </button>
            <Link
              href="/report"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1C] text-white rounded-xl text-sm font-medium hover:bg-[#2C2C2E] transition-all shadow-sm"
            >
              <Camera size={14} />
              Report Issue
            </Link>
          </div>
        </motion.div>

        {/* Ward Health + Quick Stats row */}
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          {/* Ward Health Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-1 bg-white rounded-2xl p-6 border border-[#E4E2DC] flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#9A9AA4] uppercase tracking-wide">Ward Health Score</span>
              <span className="text-[10px] font-medium text-[#7A9E6E] bg-[#EAF2E6] px-2 py-1 rounded-full">Ward 14</span>
            </div>

            {/* Circular score */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#F0EDE8" strokeWidth="8" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#7A9E6E"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - 0.78) }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#1A1A1C]">78</span>
                  <span className="text-xs text-[#7A9E6E] font-medium">Good</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Open Issues", value: "5", delta: "-2", good: true },
                { label: "Avg Response", value: "4.2h", delta: "-0.8h", good: true },
                { label: "Resolved", value: "23", delta: "+4", good: true },
                { label: "Critical", value: "2", delta: "+1", good: false },
              ].map((m) => (
                <div key={m.label} className="bg-[#F8F7F4] rounded-xl p-3">
                  <p className="text-[10px] text-[#9A9AA4] mb-1">{m.label}</p>
                  <p className="text-base font-bold text-[#1A1A1C]">{m.value}</p>
                  <p className={`text-[10px] font-medium ${m.good ? "text-[#7A9E6E]" : "text-[#D4726A]"}`}>
                    {m.delta} this week
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#7A9E6E]" />
                <span className="text-sm font-medium text-[#1A1A1C]">Live Issue Map · Ward 14</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
                  <span className="text-[10px] text-[#7A9E6E] font-medium">LIVE</span>
                </div>
                <Link href="/map" className="text-xs text-[#9A9AA4] hover:text-[#5A5A62] flex items-center gap-1 transition-colors">
                  Full map <ChevronRight size={12} />
                </Link>
              </div>
            </div>
            <div className="h-[260px] relative bg-[#F8F7F4]">
              <SmallMapSVG />
              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2.5 glass rounded-xl px-3 py-2 text-[10px]">
                {[{ c: "#D4726A", l: "Critical" }, { c: "#C8A87A", l: "Medium" }, { c: "#7A9E6E", l: "Resolved" }].map(l => (
                  <div key={l.l} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.c }} />
                    <span className="text-[#5A5A62]">{l.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* My Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1C]">My Complaints</span>
              <button className="text-xs text-[#7A9E6E] hover:text-[#5A7A50] font-medium transition-colors">View all</button>
            </div>
            <div className="divide-y divide-[#F5F4F1]">
              {myComplaints.map((c) => (
                <div key={c.id} className="px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1C]">{c.type}</p>
                      <p className="text-[11px] text-[#9A9AA4] mt-0.5">{c.id} · {c.ward} · {c.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          c.status === "Resolved"
                            ? "bg-[#EAF2E6] text-[#5A7A50]"
                            : c.status === "In Progress"
                            ? "bg-[#FAF0E0] text-[#A87840]"
                            : "bg-[#E8EFF6] text-[#4A6888]"
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-[10px] text-[#9A9AA4]">{c.dept}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{
                          background: c.progress === 100 ? "#7A9E6E" : c.progress > 50 ? "#C8A87A" : "#6A88AA"
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9A9AA4] font-medium w-8 text-right">{c.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[#F5F4F1]">
              <Link
                href="/report"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#D0CCC4] text-sm text-[#9A9AA4] hover:text-[#5A5A62] hover:border-[#B8B4AC] hover:bg-[#F8F7F4] transition-all"
              >
                <Camera size={14} />
                Report a new issue
              </Link>
            </div>
          </motion.div>

          {/* Recent Ward Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1C]">Recent Ward Activity</span>
              <span className="text-[10px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-1 rounded-full">{wardIssues.length} issues</span>
            </div>
            <div className="divide-y divide-[#F5F4F1]">
              {wardIssues.map((issue) => (
                <div key={issue.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#FAFAF8] transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: issue.bgColor }}
                  >
                    {issue.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1C] truncate">{issue.type}</p>
                    <p className="text-[10px] text-[#9A9AA4] truncate">{issue.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${issue.color}18`, color: issue.color }}
                    >
                      {issue.status}
                    </span>
                    <span className="text-[10px] text-[#C0BDB6]">{issue.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { icon: Camera, label: "Report Issue", sub: "Upload a photo", href: "/report", color: "#1A1A1C", textColor: "white", bg: "#1A1A1C" },
            { icon: MapPin, label: "View Map", sub: "Ward intelligence", href: "/map", color: "#7A9E6E", textColor: "#5A7A50", bg: "#EAF2E6" },
            { icon: Activity, label: "Issue Status", sub: "Track complaints", href: "#", color: "#6A88AA", textColor: "#4A6888", bg: "#E8EFF6" },
            { icon: Star, label: "Rate Service", sub: "Give feedback", href: "#", color: "#C8A87A", textColor: "#A87840", bg: "#FAF0E0" },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-[#E4E2DC] hover:border-[#D0CCC4] hover:shadow-sm transition-all group"
                  style={{ background: action.bg === "#1A1A1C" ? "#1A1A1C" : "white" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: action.bg === "#1A1A1C" ? "rgba(255,255,255,0.1)" : action.bg }}
                  >
                    <Icon size={16} style={{ color: action.bg === "#1A1A1C" ? "white" : action.color }} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${action.bg === "#1A1A1C" ? "text-white" : "text-[#1A1A1C]"}`}>{action.label}</p>
                    <p className={`text-[10px] ${action.bg === "#1A1A1C" ? "text-[#9A9AA4]" : "text-[#9A9AA4]"}`}>{action.sub}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
