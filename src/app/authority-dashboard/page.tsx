"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  BarChart3,
  Zap,
  Shield,
  Building2,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
} from "lucide-react";

const priorityQueue = [
  { id: "CS-2847", type: "Road Pothole", location: "MG Road, Ward 14", severity: 89, economic: "₹52K/day", risk: 91, dept: "PWD", time: "2h ago", status: "Pending" },
  { id: "CS-2841", type: "Waterlogging", location: "HSR Layout, Ward 21", severity: 84, economic: "₹38K/day", risk: 87, dept: "BBMP", time: "3h ago", status: "Assigned" },
  { id: "CS-2836", type: "Sewage Overflow", location: "Koramangala, Ward 22", severity: 78, economic: "₹29K/day", risk: 82, dept: "BWSSB", time: "5h ago", status: "In Progress" },
  { id: "CS-2829", type: "Bridge Crack", location: "Whitefield, Ward 35", severity: 95, economic: "₹78K/day", risk: 97, dept: "BBMP-E", time: "6h ago", status: "Pending" },
  { id: "CS-2821", type: "Broken Signal", location: "Indiranagar, Ward 18", severity: 71, economic: "₹22K/day", risk: 69, dept: "BESCOM", time: "8h ago", status: "In Progress" },
  { id: "CS-2812", type: "Garbage Dump", location: "Shivajinagar, Ward 7", severity: 58, economic: "₹12K/day", risk: 55, dept: "BBMP-S", time: "12h ago", status: "Assigned" },
];

const deptPerformance = [
  { name: "PWD", resolved: 34, pending: 8, score: 81, trend: "up" },
  { name: "BBMP", resolved: 67, pending: 15, score: 74, trend: "up" },
  { name: "BWSSB", resolved: 22, pending: 7, score: 69, trend: "down" },
  { name: "BESCOM", resolved: 41, pending: 5, score: 88, trend: "up" },
  { name: "BBMP-S", resolved: 29, pending: 12, score: 63, trend: "down" },
];

const predictedFailures = [
  { location: "Silk Board Junction, Ward 45", type: "Bridge Structural", probability: 78, timeframe: "7 days", severity: "Critical", color: "#D4726A" },
  { location: "Bannerghatta Road, Ward 38", type: "Road Collapse", probability: 64, timeframe: "14 days", severity: "High", color: "#C8A87A" },
  { location: "Hebbal Flyover, Ward 12", type: "Drainage Failure", probability: 51, timeframe: "21 days", severity: "Medium", color: "#6A88AA" },
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function SeverityDot({ score }: { score: number }) {
  const color = score >= 85 ? "#D4726A" : score >= 70 ? "#C8A87A" : "#7A9E6E";
  const bg = score >= 85 ? "#FAECEA" : score >= 70 ? "#FAF0E0" : "#EAF2E6";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
      {score}
    </span>
  );
}

function ImpactChart() {
  const data = [38, 52, 45, 67, 58, 74, 61, 83, 72, 89, 76, 92];
  const labels = ["Jun 11", "Jun 12", "Jun 13", "Jun 14", "Jun 15", "Jun 16", "Jun 17", "Jun 18", "Jun 19", "Jun 20", "Jun 21", "Jun 22"];
  const max = Math.max(...data);
  const h = 120;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${data.length * 36} ${h + 20}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A9E6E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7A9E6E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <line
            key={i}
            x1="0"
            y1={frac * h}
            x2={data.length * 36}
            y2={frac * h}
            stroke="#F0EDE8"
            strokeWidth="1"
          />
        ))}
        {/* Area fill */}
        <path
          d={`M ${data.map((v, i) => `${i * 36 + 18},${h - (v / max) * h}`).join(" L ")} L ${(data.length - 1) * 36 + 18},${h} L 18,${h} Z`}
          fill="url(#chartGrad)"
        />
        {/* Line */}
        <polyline
          points={data.map((v, i) => `${i * 36 + 18},${h - (v / max) * h}`).join(" ")}
          fill="none"
          stroke="#7A9E6E"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {data.map((v, i) => (
          <circle
            key={i}
            cx={i * 36 + 18}
            cy={h - (v / max) * h}
            r={i === data.length - 1 ? 4 : 3}
            fill={i === data.length - 1 ? "#7A9E6E" : "white"}
            stroke="#7A9E6E"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ resolved, pending }: { resolved: number; pending: number }) {
  const total = resolved + pending;
  const pct = resolved / total;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F0EDE8" strokeWidth="10" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#7A9E6E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#1A1A1C]">{Math.round(pct * 100)}%</span>
        <span className="text-[9px] text-[#9A9AA4]">resolved</span>
      </div>
    </div>
  );
}

export default function AuthorityDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#E4E2DC] flex flex-col z-40 hidden lg:flex">
        <div className="px-5 py-5 border-b border-[#E4E2DC]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7A9E6E] flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-semibold text-[#1A1A1C] text-sm">
              CitySpell<span className="text-[#7A9E6E]">AI</span>
            </span>
          </Link>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFF6] flex items-center justify-center text-xs font-bold text-[#6A88AA]">
              SK
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1A1A1C]">Suresh Kumar</p>
              <p className="text-[10px] text-[#9A9AA4]">BBMP Officer · Ward 1–30</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {[
            { icon: BarChart3, label: "Overview", active: true },
            { icon: AlertTriangle, label: "Priority Queue", count: 12 },
            { icon: MapPin, label: "Ward Map" },
            { icon: Shield, label: "Risk Intelligence" },
            { icon: Building2, label: "Departments" },
            { icon: Activity, label: "Analytics" },
            { icon: Users, label: "Citizens" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  item.active
                    ? "bg-[#EAF2E6] text-[#5A7A50] font-medium"
                    : "text-[#5A5A62] hover:bg-[#F5F4F1] hover:text-[#1A1A1C]"
                }`}
              >
                <Icon size={15} />
                {item.label}
                {item.count && (
                  <span className="ml-auto text-[10px] font-bold bg-[#D4726A] text-white w-4.5 h-4.5 rounded-full flex items-center justify-center px-1.5">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#E4E2DC]">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#5A5A62] hover:bg-[#F5F4F1] w-full transition-all">
            <Settings size={15} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-[#E4E2DC] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-semibold text-[#1A1A1C]">Authority Dashboard</h1>
            <p className="text-xs text-[#9A9AA4]">BBMP Zone — Live Intelligence Feed · Jun 22, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF2E6] text-[#5A7A50]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-xs font-medium">Live</span>
            </div>
            <button className="relative p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E4E2DC] hover:bg-[#F0EDE8] transition-all">
              <Bell size={15} className="text-[#5A5A62]" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4726A]" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Overview metrics */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Issues", value: "248", delta: "+12 today", up: false, icon: AlertTriangle, color: "#D4726A", bg: "#FAECEA" },
              { label: "Resolved Today", value: "34", delta: "+8 vs yesterday", up: true, icon: CheckCircle2, color: "#7A9E6E", bg: "#EAF2E6" },
              { label: "Avg Response Time", value: "5.2h", delta: "-0.8h this week", up: true, icon: Clock, color: "#6A88AA", bg: "#E8EFF6" },
              { label: "Economic Loss Saved", value: "₹4.7 Cr", delta: "+₹0.3 Cr today", up: true, icon: IndianRupee, color: "#C8A87A", bg: "#FAF0E0" },
            ].map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-5 border border-[#E4E2DC] hover:border-[#D0CCC4] hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: metric.bg }}>
                      <Icon size={16} style={{ color: metric.color }} />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-medium ${metric.up ? "text-[#7A9E6E]" : "text-[#D4726A]"}`}>
                      {metric.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {metric.delta}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1C] mb-0.5">{metric.value}</p>
                  <p className="text-xs text-[#9A9AA4]">{metric.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Main grid */}
          <div className="grid xl:grid-cols-3 gap-5 mb-5">
            {/* Priority Queue — spans 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="xl:col-span-2 bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-[#D4726A]" />
                  <span className="text-sm font-semibold text-[#1A1A1C]">Priority Queue</span>
                  <span className="text-[10px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-0.5 rounded-full">
                    {priorityQueue.length} open
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs text-[#9A9AA4] hover:text-[#5A5A62] transition-colors">
                    <Filter size={12} />
                    Filter
                  </button>
                </div>
              </div>

              {/* Column headers */}
              <div className="px-5 py-2 border-b border-[#F5F4F1] grid grid-cols-12 gap-2 text-[9px] font-semibold text-[#9A9AA4] uppercase tracking-wider">
                <span className="col-span-5">Issue</span>
                <span className="col-span-2 text-center">Severity</span>
                <span className="col-span-2 text-center">Economic</span>
                <span className="col-span-2 text-center">Risk</span>
                <span className="col-span-1" />
              </div>

              <div className="divide-y divide-[#F5F4F1]">
                {priorityQueue.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="px-5 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-[#FAFAF8] transition-colors group"
                  >
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs font-semibold text-[#1A1A1C]">{item.type}</p>
                          <p className="text-[10px] text-[#9A9AA4] truncate max-w-[140px]">{item.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-[#9A9AA4] font-mono">{item.id}</span>
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            item.status === "Pending"
                              ? "bg-[#FAF0E0] text-[#A87840]"
                              : item.status === "In Progress"
                              ? "bg-[#E8EFF6] text-[#4A6888]"
                              : "bg-[#EAF2E6] text-[#5A7A50]"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[9px] text-[#C0BDB6]">{item.time}</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <SeverityDot score={item.severity} />
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-semibold text-[#C8A87A]">{item.economic}</span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <SeverityDot score={item.risk} />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#F0EDE8] transition-all">
                        <Eye size={13} className="text-[#9A9AA4]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Economic Impact Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#E4E2DC] p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-[#7A9E6E]" />
                  <span className="text-sm font-semibold text-[#1A1A1C]">Impact Prevented</span>
                </div>
                <span className="text-[10px] text-[#9A9AA4]">12 days</span>
              </div>

              <div>
                <p className="text-3xl font-bold text-[#1A1A1C]">₹4.7 Cr</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight size={13} className="text-[#7A9E6E]" />
                  <span className="text-xs text-[#7A9E6E] font-medium">+18% vs last period</span>
                </div>
              </div>

              <ImpactChart />

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "This Month", value: "₹2.3 Cr", color: "#7A9E6E" },
                  { label: "Avg/Issue", value: "₹19K", color: "#6A88AA" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F8F7F4] rounded-xl p-3">
                    <p className="text-[10px] text-[#9A9AA4] mb-0.5">{s.label}</p>
                    <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom grid */}
          <div className="grid xl:grid-cols-2 gap-5">
            {/* Department Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={15} className="text-[#6A88AA]" />
                  <span className="text-sm font-semibold text-[#1A1A1C]">Department Performance</span>
                </div>
                <button className="text-xs text-[#7A9E6E] hover:text-[#5A7A50] font-medium transition-colors">Full Report</button>
              </div>
              <div className="p-5 flex items-start gap-6">
                <DonutChart
                  resolved={deptPerformance.reduce((a, d) => a + d.resolved, 0)}
                  pending={deptPerformance.reduce((a, d) => a + d.pending, 0)}
                />
                <div className="flex-1 flex flex-col gap-3">
                  {deptPerformance.map((dept, i) => (
                    <div key={dept.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#1A1A1C]">{dept.name}</span>
                          {dept.trend === "up" ? (
                            <TrendingUp size={10} className="text-[#7A9E6E]" />
                          ) : (
                            <TrendingDown size={10} className="text-[#D4726A]" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#9A9AA4]">{dept.resolved}/{dept.resolved + dept.pending}</span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: dept.score >= 80 ? "#EAF2E6" : dept.score >= 70 ? "#FAF0E0" : "#FAECEA",
                              color: dept.score >= 80 ? "#5A7A50" : dept.score >= 70 ? "#A87840" : "#C04848",
                            }}
                          >
                            {dept.score}
                          </span>
                        </div>
                      </div>
                      <MiniBar
                        value={dept.resolved}
                        max={dept.resolved + dept.pending}
                        color={dept.score >= 80 ? "#7A9E6E" : dept.score >= 70 ? "#C8A87A" : "#D4726A"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Predicted Infrastructure Failures */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center gap-2">
                <Shield size={15} className="text-[#D4726A]" />
                <span className="text-sm font-semibold text-[#1A1A1C]">Predicted Infrastructure Failures</span>
                <span className="ml-auto text-[10px] font-medium text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full">AI Forecast</span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {predictedFailures.map((failure, i) => (
                  <motion.div
                    key={failure.location}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-[#F0EDE8] hover:border-[#E4E2DC] hover:shadow-sm transition-all"
                    style={{ background: `${failure.color}06` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#1A1A1C] truncate">{failure.type}</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${failure.color}18`, color: failure.color }}
                        >
                          {failure.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9A9AA4] truncate">
                        <MapPin size={9} className="inline mr-1" />
                        {failure.location}
                      </p>
                      <p className="text-[10px] text-[#B0ACA4] mt-1">
                        Likely within <strong>{failure.timeframe}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div
                        className="text-lg font-bold"
                        style={{ color: failure.color }}
                      >
                        {failure.probability}%
                      </div>
                      <div className="w-16">
                        <MiniBar value={failure.probability} max={100} color={failure.color} />
                      </div>
                      <button
                        className="text-[9px] font-medium text-[#9A9AA4] hover:text-[#5A5A62] flex items-center gap-0.5 transition-colors"
                      >
                        Inspect <ChevronRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Risk summary */}
              <div className="px-5 pb-5">
                <div className="bg-[#FAECEA] rounded-xl p-4 flex items-center gap-3">
                  <Shield size={16} className="text-[#D4726A] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#C04848]">3 High-Risk Zones Detected</p>
                    <p className="text-[10px] text-[#D48480]">Preventive maintenance can save ₹1.8 Cr in repairs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
