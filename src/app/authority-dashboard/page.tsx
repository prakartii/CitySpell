"use client";

import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  MapPin, Bell, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  TrendingDown, IndianRupee, Users, BarChart3, Zap, Shield,
  Building2, ChevronRight, Activity, ArrowUpRight, ArrowDownRight,
  Eye, Cpu, Radio, Sparkles, Circle, GitBranch,
} from "lucide-react";

/* ─── LIVE DATA SIMULATION ─────────────────────────────── */
const useLiveTick = (interval = 3000) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), interval);
    return () => clearInterval(t);
  }, [interval]);
  return tick;
};

/* ─── PRIORITY ISSUES ──────────────────────────────────── */
const priorityIssues = [
  { id: "CS-2847", type: "Road Pothole",     location: "MG Road, Ward 14",       sev: 89, eco: "₹52K", risk: 91, dept: "PWD",    status: "Pending",    time: "2h" },
  { id: "CS-2841", type: "Waterlogging",     location: "HSR Layout, Ward 21",     sev: 84, eco: "₹38K", risk: 87, dept: "BBMP",   status: "Assigned",   time: "3h" },
  { id: "CS-2836", type: "Sewage Overflow",  location: "Koramangala, Ward 22",    sev: 78, eco: "₹29K", risk: 82, dept: "BWSSB",  status: "In Progress",time: "5h" },
  { id: "CS-2829", type: "Bridge Crack",     location: "Whitefield, Ward 35",     sev: 95, eco: "₹78K", risk: 97, dept: "BBMP-E", status: "Pending",    time: "6h" },
  { id: "CS-2821", type: "Signal Failure",   location: "Indiranagar, Ward 18",    sev: 71, eco: "₹22K", risk: 69, dept: "BESCOM", status: "In Progress",time: "8h" },
  { id: "CS-2812", type: "Garbage Overflow", location: "Shivajinagar, Ward 7",    sev: 58, eco: "₹12K", risk: 55, dept: "BBMP-S", status: "Assigned",   time: "12h" },
];

const deptData = [
  { name: "PWD",    resolved: 34, pending: 8,  score: 81, trend: 1 },
  { name: "BBMP",   resolved: 67, pending: 15, score: 74, trend: 1 },
  { name: "BWSSB",  resolved: 22, pending: 7,  score: 69, trend: -1 },
  { name: "BESCOM", resolved: 41, pending: 5,  score: 88, trend: 1 },
  { name: "BBMP-S", resolved: 29, pending: 12, score: 63, trend: -1 },
];

const predictions = [
  { loc: "Silk Board Jct", type: "Bridge Structural", prob: 78, days: 7,  color: "#D4726A" },
  { loc: "Bannerghatta Rd", type: "Road Collapse",    prob: 64, days: 14, color: "#C8A87A" },
  { loc: "Hebbal Flyover",  type: "Drainage Failure", prob: 51, days: 21, color: "#6A88AA" },
];

/* ─── CHART DATA ────────────────────────────────────────── */
const chartPts = [38,52,45,67,58,74,61,83,72,89,76,94];
const chartMax = 100;

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = data.length * 20;
  const h = 36;
  const pts = data.map((v, i) => `${i * 20 + 10},${h - (v / chartMax) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${pts.split(" ").map((p,i)=>i===0?`${p}`:p).join(" ")} V ${h} H 10 Z`}
        fill={`url(#sg-${color.replace("#","")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ImpactChart() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const h = 110;
  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${chartPts.length * 32} ${h + 24}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A9E6E" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7A9E6E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25,0.5,0.75,1].map((f,i) => (
          <line key={i} x1="0" y1={f*h} x2={chartPts.length*32} y2={f*h} stroke="#F0EDE8" strokeWidth="1" />
        ))}
        <path
          d={`M ${chartPts.map((v,i)=>`${i*32+16},${h-(v/chartMax)*h}`).join(" L ")} L ${(chartPts.length-1)*32+16},${h} L 16,${h} Z`}
          fill="url(#impactGrad)"
        />
        <polyline
          points={chartPts.map((v,i)=>`${i*32+16},${h-(v/chartMax)*h}`).join(" ")}
          fill="none" stroke="#7A9E6E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
        />
        {chartPts.map((v,i) => (
          <motion.circle
            key={i}
            cx={i*32+16} cy={h-(v/chartMax)*h}
            r={i===chartPts.length-1?4.5:3}
            fill={i===chartPts.length-1?"#7A9E6E":"white"}
            stroke="#7A9E6E" strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView?{ opacity: 1, scale: 1 }:{ opacity: 0, scale: 0 }}
            transition={{ delay: i*0.06 }}
          />
        ))}
      </svg>
    </div>
  );
}

function RiskGauge({ score, color }: { score: number; color: string }) {
  const ref = useRef<SVGCircleElement>(null);
  const isInView = useInView(useRef<HTMLDivElement>(null), { once: true });
  const r = 28; const c = 2*Math.PI*r;
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#F0EDE8" strokeWidth="6" />
        <motion.circle
          cx="36" cy="36" r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c*(1-score/100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold font-mono-data" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function SevBadge({ score }: { score: number }) {
  const color = score>=85?"#D4726A":score>=70?"#C8A87A":"#7A9E6E";
  const bg    = score>=85?"#FAECEA":score>=70?"#FAF0E0":"#EAF2E6";
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-data" style={{background:bg,color}}>{score}</span>;
}

const containerV = { hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } };
const rowV = {
  hidden:  { opacity:0, x:-16 },
  visible: { opacity:1, x:0, transition:{ duration:0.45, ease:[0.22,1,0.36,1] } },
};
const cardV = {
  hidden:  { opacity:0, y:20 },
  visible: { opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } },
};

export default function AuthorityDashboard() {
  const tick = useLiveTick(4000);
  const [selectedIssue, setSelectedIssue] = useState<number|null>(null);
  const liveValues = [248+tick, 34+Math.floor(tick*0.3), 5.2-tick*0.02, 47+tick*3];

  const navItems = [
    { icon: BarChart3, label: "Overview",      active: true },
    { icon: AlertTriangle, label: "Priority Queue", count: 12 },
    { icon: MapPin,    label: "Ward Map" },
    { icon: Shield,    label: "Risk Intelligence" },
    { icon: Building2, label: "Departments" },
    { icon: Activity,  label: "Analytics" },
    { icon: Users,     label: "Citizens" },
    { icon: Radio,     label: "Live Feed" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F1] flex">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-[#E4E2DC] flex-col z-40 hidden lg:flex card-1">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#E4E2DC]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#7A9E6E] flex items-center justify-center glow-sage">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-bold text-[#1A1A1C] text-sm">CitySpell<span className="text-[#7A9E6E]">AI</span></span>
          </Link>
          {/* Officer tag */}
          <div className="mt-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFF6] flex items-center justify-center text-xs font-bold text-[#6A88AA]">SK</div>
            <div>
              <p className="text-[11px] font-bold text-[#1A1A1C]">Suresh Kumar</p>
              <p className="text-[9px] text-[#9A9AA4]">BBMP Officer · Zone A</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, active, count }) => (
            <motion.button
              key={label}
              whileHover={{ x: 2 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                active
                  ? "bg-[#EAF2E6] text-[#5A7A50] font-bold"
                  : "text-[#5A5A62] hover:bg-[#F5F4F1] hover:text-[#1A1A1C] font-medium"
              }`}
            >
              <Icon size={14} />
              {label}
              {count && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-auto text-[9px] font-bold bg-[#D4726A] text-white px-1.5 py-0.5 rounded-full"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* System status */}
        <div className="px-4 py-4 border-t border-[#E4E2DC]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
            <span className="text-[9px] font-bold text-[#7A9E6E] uppercase tracking-widest">System Nominal</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {[["8 AI Agents","Active"],["42ms","Latency"],["99.8%","Uptime"]].map(([v,l]) => (
              <div key={l} className="flex justify-between text-[9px]">
                <span className="text-[#9A9AA4]">{l}</span>
                <span className="font-mono-data text-[#5A5A62] font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="lg:ml-56 flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="bg-white border-b border-[#E4E2DC] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 card-0">
          <div>
            <h1 className="text-base font-bold text-[#1A1A1C]">Authority Command Center</h1>
            <p className="text-[10px] text-[#9A9AA4] font-mono mt-0.5">BBMP Zone A · Live Intelligence · {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={tick}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-xl border border-[#E4E2DC]"
              >
                <Cpu size={12} className="text-[#7A9E6E]" />
                <span className="text-[10px] font-mono text-[#5A5A62]">
                  {["Processing 3 issues","AI Routing active","Risk scan complete","Economic model updated"][tick%4]}
                </span>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF2E6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-[10px] font-bold text-[#5A7A50]">Live</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E4E2DC] hover:bg-[#F0EDE8] transition-all"
            >
              <Bell size={15} className="text-[#5A5A62]" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4726A]"
              />
            </motion.button>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">

          {/* ── OVERVIEW METRICS ─────────────────────────────── */}
          <motion.div
            className="grid grid-cols-2 xl:grid-cols-4 gap-4"
            variants={containerV}
            initial="hidden"
            animate="visible"
          >
            {[
              { label:"Total Active Issues", value: liveValues[0].toString(), delta:"+12 today",   up:false, icon:AlertTriangle, color:"#D4726A", bg:"#FAECEA",   spark:[45,38,52,67,58,74,61,80] },
              { label:"Resolved Today",      value: Math.floor(liveValues[1]).toString(), delta:"+8 vs yesterday",up:true,  icon:CheckCircle2,color:"#7A9E6E", bg:"#EAF2E6",   spark:[20,28,22,35,38,31,34,40] },
              { label:"Avg Response Time",   value:`${Math.max(3.8,liveValues[2]).toFixed(1)}h`,   delta:"-0.8h this wk",up:true,  icon:Clock,       color:"#6A88AA", bg:"#E8EFF6",   spark:[6.5,6.1,5.8,6.2,5.5,5.8,5.2,4.9] },
              { label:"Economic Prevented",  value:`₹${(4.7+tick*0.01).toFixed(1)} Cr`,         delta:"+₹0.3 Cr today",up:true,icon:IndianRupee,color:"#C8A87A", bg:"#FAF0E0",   spark:[3.1,3.4,3.8,3.6,4.0,3.9,4.3,4.6] },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  variants={cardV}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-5 border border-[#E4E2DC] card-0 hover:card-2 transition-all cursor-default"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:m.bg}}>
                      <Icon size={16} style={{color:m.color}} />
                    </div>
                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${m.up?"text-[#7A9E6E]":"text-[#D4726A]"}`}>
                      {m.up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}
                      <span>{m.delta}</span>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={m.value}
                      initial={{ opacity:0, y:6 }}
                      animate={{ opacity:1, y:0 }}
                      className="text-2xl font-bold text-[#1A1A1C] font-mono-data mb-0.5"
                    >
                      {m.value}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-[10px] text-[#9A9AA4] mb-3">{m.label}</p>
                  <MiniSparkline data={m.spark} color={m.color} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── MAIN GRID: Priority Queue + Chart ──────────────── */}
          <div className="grid xl:grid-cols-3 gap-5">

            {/* Priority Queue */}
            <motion.div
              variants={containerV}
              initial="hidden"
              animate="visible"
              className="xl:col-span-2 bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden card-0"
            >
              <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#FAECEA] flex items-center justify-center">
                    <AlertTriangle size={13} className="text-[#D4726A]" />
                  </div>
                  <span className="text-sm font-bold text-[#1A1A1C]">Priority Queue</span>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full"
                  >
                    {priorityIssues.length} pending
                  </motion.span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#9A9AA4]">
                  <span>Sort by:</span>
                  {["Risk","Severity","Economic"].map((s,i) => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.05 }}
                      className={`px-2.5 py-1 rounded-lg transition-all ${i===0?"bg-[#EAF2E6] text-[#5A7A50] font-semibold":"hover:bg-[#F5F4F1] text-[#9A9AA4]"}`}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Column headers */}
              <div className="px-5 py-2 grid grid-cols-12 gap-2 text-[9px] font-bold text-[#B0ACA4] uppercase tracking-wider border-b border-[#F5F4F1]">
                <span className="col-span-5">Issue / Location</span>
                <span className="col-span-2 text-center">Severity</span>
                <span className="col-span-2 text-center">Impact/day</span>
                <span className="col-span-2 text-center">Risk</span>
                <span className="col-span-1"/>
              </div>

              <motion.div variants={containerV} className="divide-y divide-[#F8F7F4]">
                {priorityIssues.map((issue, i) => (
                  <motion.div
                    key={issue.id}
                    variants={rowV}
                    className={`px-5 py-3.5 grid grid-cols-12 gap-2 items-center cursor-pointer group transition-colors ${
                      selectedIssue===i?"bg-[#F8FAF6]":"hover:bg-[#FAFAF8]"
                    }`}
                    onClick={() => setSelectedIssue(selectedIssue===i?null:i)}
                  >
                    <div className="col-span-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-1.5 flex-shrink-0 rounded-full self-stretch"
                          style={{ background: issue.sev>=85?"#D4726A":issue.sev>=70?"#C8A87A":"#7A9E6E" }}
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1C] leading-tight">{issue.type}</p>
                          <p className="text-[10px] text-[#9A9AA4] truncate max-w-[140px]">{issue.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono text-[#B0ACA4]">{issue.id}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              issue.status==="Pending"?"bg-[#FAF0E0] text-[#A87840]":
                              issue.status==="In Progress"?"bg-[#E8EFF6] text-[#4A6888]":
                              "bg-[#EAF2E6] text-[#5A7A50]"
                            }`}>{issue.status}</span>
                            <span className="text-[9px] text-[#C0BDB6]">{issue.time} ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center"><SevBadge score={issue.sev}/></div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-bold text-[#C8A87A] font-mono-data">{issue.eco}/day</span>
                    </div>
                    <div className="col-span-2 flex justify-center"><SevBadge score={issue.risk}/></div>
                    <div className="col-span-1 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#EAF2E6] transition-all"
                      >
                        <Eye size={12} className="text-[#7A9E6E]" />
                      </motion.button>
                    </div>

                    {/* Expanded row */}
                    <AnimatePresence>
                      {selectedIssue===i && (
                        <motion.div
                          className="col-span-12"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="mt-2 p-3 bg-[#F8F7F4] rounded-xl grid grid-cols-4 gap-3">
                            {[["Dept",issue.dept],["Report time",`${issue.time} ago`],["Category","Infrastructure"],["Citizens affected","2,400+"]].map(([k,v]) => (
                              <div key={k}>
                                <p className="text-[9px] text-[#9A9AA4]">{k}</p>
                                <p className="text-[11px] font-bold text-[#1A1A1C] mt-0.5">{v}</p>
                              </div>
                            ))}
                            <div className="col-span-4 flex gap-2 mt-1">
                              <button className="px-3 py-1.5 bg-[#7A9E6E] text-white text-[10px] font-bold rounded-lg hover:bg-[#5A7A50] transition-all">
                                Assign Officer
                              </button>
                              <button className="px-3 py-1.5 bg-white text-[#5A5A62] text-[10px] font-bold rounded-lg border border-[#E4E2DC] hover:bg-[#F5F4F1] transition-all">
                                View Full Report
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Economic Impact chart */}
            <motion.div
              variants={cardV}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-[#E4E2DC] p-5 card-0 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#7A9E6E]" />
                  <span className="text-sm font-bold text-[#1A1A1C]">Impact Prevented</span>
                </div>
                <span className="text-[9px] text-[#9A9AA4] bg-[#F5F4F1] px-2 py-1 rounded-lg">12 days</span>
              </div>

              <div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tick}
                    initial={{ opacity:0, y:8 }}
                    animate={{ opacity:1, y:0 }}
                    className="text-4xl font-bold text-[#1A1A1C] font-mono-data"
                  >
                    ₹{(4.7+tick*0.01).toFixed(1)} Cr
                  </motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight size={13} className="text-[#7A9E6E]" />
                  <span className="text-xs text-[#7A9E6E] font-semibold">+18% vs last period</span>
                </div>
              </div>

              <ImpactChart />

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:"This Month", value:"₹2.3 Cr", color:"#7A9E6E" },
                  { label:"Per Issue",  value:"₹19K",    color:"#6A88AA" },
                  { label:"Largest",    value:"₹78K",    color:"#D4726A" },
                  { label:"Smallest",   value:"₹8K",     color:"#9A9C5E" },
                ].map(s => (
                  <div key={s.label} className="bg-[#F8F7F4] rounded-xl p-3">
                    <p className="text-[9px] text-[#9A9AA4] mb-0.5">{s.label}</p>
                    <p className="text-sm font-bold font-mono-data" style={{color:s.color}}>{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM GRID ──────────────────────────────────── */}
          <div className="grid xl:grid-cols-2 gap-5">

            {/* Dept Performance */}
            <motion.div
              variants={cardV}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden card-0"
            >
              <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-[#6A88AA]" />
                  <span className="text-sm font-bold text-[#1A1A1C]">Department Performance</span>
                </div>
                <button className="text-xs text-[#7A9E6E] font-semibold hover:text-[#5A7A50] transition-colors">
                  Full Report
                </button>
              </div>
              <div className="p-5 flex items-start gap-6">
                {/* Donut */}
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#F0EDE8" strokeWidth="8" />
                    <motion.circle
                      cx="40" cy="40" r="32"
                      fill="none" stroke="#7A9E6E" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2*Math.PI*32}
                      initial={{ strokeDashoffset: 2*Math.PI*32 }}
                      whileInView={{ strokeDashoffset: 2*Math.PI*32*(1-0.75) }}
                      viewport={{ once: true }}
                      transition={{ duration:1.3, ease:"easeOut", delay:0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#1A1A1C] font-mono-data">75%</span>
                    <span className="text-[8px] text-[#9A9AA4]">resolved</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2.5">
                  {deptData.map((d, i) => (
                    <motion.div
                      key={d.name}
                      initial={{ opacity:0, x:16 }}
                      whileInView={{ opacity:1, x:0 }}
                      viewport={{ once:true }}
                      transition={{ delay:i*0.07 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A1A1C]">{d.name}</span>
                          {d.trend===1
                            ? <TrendingUp size={9} className="text-[#7A9E6E]" />
                            : <TrendingDown size={9} className="text-[#D4726A]" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-[#9A9AA4]">{d.resolved}/{d.resolved+d.pending}</span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono-data"
                            style={{
                              background: d.score>=80?"#EAF2E6":d.score>=70?"#FAF0E0":"#FAECEA",
                              color:      d.score>=80?"#5A7A50":d.score>=70?"#A87840":"#C04848",
                            }}
                          >
                            {d.score}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width:0 }}
                          whileInView={{ width:`${(d.resolved/(d.resolved+d.pending))*100}%` }}
                          viewport={{ once:true }}
                          transition={{ duration:0.9, delay:i*0.08+0.2, ease:"easeOut" }}
                          className="h-full rounded-full"
                          style={{ background:d.score>=80?"#7A9E6E":d.score>=70?"#C8A87A":"#D4726A" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Predicted Failures */}
            <motion.div
              variants={cardV}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden card-0"
            >
              <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#FAECEA] flex items-center justify-center">
                  <Shield size={13} className="text-[#D4726A]" />
                </div>
                <span className="text-sm font-bold text-[#1A1A1C]">Predicted Infrastructure Failures</span>
                <motion.span
                  animate={{ opacity:[1,0.5,1] }}
                  transition={{ duration:2, repeat:Infinity }}
                  className="ml-auto text-[9px] font-bold text-[#D4726A] bg-[#FAECEA] px-2 py-0.5 rounded-full uppercase tracking-wide"
                >
                  AI Forecast
                </motion.span>
              </div>

              <div className="p-5 flex flex-col gap-3">
                {predictions.map((p, i) => (
                  <motion.div
                    key={p.loc}
                    initial={{ opacity:0, x:16 }}
                    whileInView={{ opacity:1, x:0 }}
                    viewport={{ once:true }}
                    transition={{ delay:i*0.1 }}
                    whileHover={{ y:-1, transition:{ duration:0.2 } }}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-[#F0EDE8] hover:border-[#E4E2DC] hover:shadow-sm transition-all cursor-default"
                    style={{ background:`${p.color}05` }}
                  >
                    <RiskGauge score={p.prob} color={p.color} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#1A1A1C] truncate">{p.type}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{background:`${p.color}15`,color:p.color}}>
                          {p.prob}% likely
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9A9AA4]">
                        <MapPin size={9} className="inline mr-1" />{p.loc}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width:0 }}
                            whileInView={{ width:`${p.prob}%` }}
                            viewport={{ once:true }}
                            transition={{ duration:1, delay:i*0.1+0.3, ease:"easeOut" }}
                            className="h-full rounded-full"
                            style={{ background:p.color }}
                          />
                        </div>
                        <span className="text-[9px] text-[#9A9AA4] flex-shrink-0">
                          within <strong>{p.days} days</strong>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity:0 }}
                  whileInView={{ opacity:1 }}
                  viewport={{ once:true }}
                  transition={{ delay:0.5 }}
                  className="bg-[#FAECEA] rounded-2xl p-4 flex items-center gap-3 mt-1"
                >
                  <Shield size={15} className="text-[#D4726A] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#C04848]">3 High-Risk Zones Detected</p>
                    <p className="text-[9px] text-[#D48480]">Preventive action could save ₹1.8 Cr in repair costs</p>
                  </div>
                  <button className="ml-auto text-[9px] font-bold text-[#D4726A] border border-[#D4726A]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#D4726A]/10 transition-all flex-shrink-0">
                    Schedule
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
