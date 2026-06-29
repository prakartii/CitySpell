"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useUserIssues } from "@/lib/hooks/useIssues";
import { useRouter } from "next/navigation";
import {
  Camera,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Loader2,
  Inbox,
  ArrowLeft,
  MessageSquare
} from "lucide-react";

// Status helpers
const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case "open":
    case "reported":
      return "Reported";
    case "assigned":
      return "Assigned";
    case "in_progress":
    case "in progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    case "rejected":
      return "Rejected";
    default:
      return "Reported";
  }
};

const getStatusProgress = (status: string) => {
  switch (status?.toLowerCase()) {
    case "open":
    case "reported":
      return 25;
    case "assigned":
      return 50;
    case "in_progress":
    case "in progress":
      return 75;
    case "resolved":
    case "closed":
      return 100;
    case "rejected":
      return 100;
    default:
      return 25;
  }
};

const getStatusStyle = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "resolved" || normalized === "closed") {
    return { color: "#7A9E6E", bgColor: "#EAF2E6", barColor: "#7A9E6E" };
  }
  if (normalized === "in_progress" || normalized === "in progress") {
    return { color: "#C8A87A", bgColor: "#FAF0E0", barColor: "#C8A87A" };
  }
  if (normalized === "assigned") {
    return { color: "#6A88AA", bgColor: "#E8EFF6", barColor: "#6A88AA" };
  }
  if (normalized === "rejected") {
    return { color: "#D4726A", bgColor: "#FAECEA", barColor: "#D4726A" };
  }
  return { color: "#5E9E9E", bgColor: "#E4F2F2", barColor: "#5E9E9E" }; // Reported
};

const getCategoryEmoji = (cat: string) => {
  switch (cat?.toLowerCase()) {
    case "pothole": return "🕳️";
    case "water":
    case "waterlogging":
      return "💧";
    case "streetlight":
    case "light":
      return "💡";
    case "garbage": return "🗑️";
    case "sewage": return "🌊";
    case "road": return "🛣️";
    case "park": return "🌳";
    default: return "⚠️";
  }
};

const getSeverityStyle = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return { color: "#D4726A", bgColor: "#FAECEA" };
    case "high":
      return { color: "#D4726A", bgColor: "#FAECEA" };
    case "medium":
      return { color: "#C8A87A", bgColor: "#FAF0E0" };
    case "low":
    default:
      return { color: "#7A9E6E", bgColor: "#EAF2E6" };
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Just now";
  const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export default function MyComplaintsPage() {
  const { isAuthenticated, user, loading } = useAuthContext();
  const router = useRouter();
  const { issues, loading: issuesLoading } = useUserIssues(user?.uid || null);
  const [expandedTimeline, setExpandedTimeline] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const toggleTimeline = (id: string) => {
    setExpandedTimeline((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#7A9E6E] animate-spin mb-2" />
        <p className="text-sm font-medium text-[#5A5A62]">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      {/* Decorative Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(122,158,110,0.15) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(106,136,170,0.12) 0%, transparent 70%)" }} />

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-6 relative">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/citizen-dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#9A9AA4] hover:text-[#1A1A1C] transition-colors font-medium">
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif text-[#1A1A1C] mb-1.5">My Complaints</h1>
            <p className="text-sm text-[#9A9AA4]">Track the real-time resolution timeline of your reported issues</p>
          </div>
          <Link
            href="/report"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1A1C] text-white rounded-xl text-xs font-semibold hover:bg-[#2C2C2E] transition-all card-1 w-fit"
          >
            <Camera size={13} />
            Report New Issue
          </Link>
        </div>

        {/* Complaints List Container */}
        {issuesLoading ? (
          <div className="flex flex-col gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden">
                <div className="p-6 flex gap-4 border-b border-[#F5F4F1]">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8] shimmer-bg flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2.5">
                    <div className="h-4 w-3/4 rounded-lg shimmer-bg" />
                    <div className="h-3 w-1/2 rounded-lg shimmer-bg" />
                  </div>
                  <div className="w-20 flex flex-col gap-2 items-end">
                    <div className="h-5 w-16 rounded-full shimmer-bg" />
                    <div className="h-3 w-12 rounded-lg shimmer-bg" />
                  </div>
                </div>
                <div className="px-6 py-4 border-b border-[#F5F4F1]">
                  <div className="h-2 w-full rounded-full shimmer-bg" />
                </div>
                <div className="px-6 py-3 flex justify-between">
                  <div className="h-3 w-28 rounded shimmer-bg" />
                  <div className="h-3 w-24 rounded shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#E4E2DC] p-16 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#F8F7F4] flex items-center justify-center text-[#B0ACA4] mb-4">
              <Inbox size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1C] mb-1">No complaints reported</h3>
            <p className="text-xs text-[#9A9AA4] max-w-sm mb-6 leading-relaxed">
              You have not submitted any civic complaints yet. If you see a pothole, broken street light, or garbage accumulation, report it immediately!
            </p>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7A9E6E] text-white rounded-xl text-xs font-bold hover:bg-[#5A7A50] transition-all shadow-sm"
            >
              <Camera size={13} />
              Start AI Analysis
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-5">
            {issues.map((issue) => {
              const statusLabel = getStatusLabel(issue.status);
              const progress = getStatusProgress(issue.status);
              const statusStyle = getStatusStyle(issue.status);
              const severityStyle = getSeverityStyle(issue.severity);
              const emoji = getCategoryEmoji(issue.category);
              const dateStr = formatDate(issue.reportedAt);
              const isExpanded = !!expandedTimeline[issue.id];

              // Generate automatic historical timeline trace if not present
              const getFullTimeline = () => {
                if (issue.timeline && issue.timeline.length > 0) return issue.timeline;
                const trace = [
                  {
                    status: "Reported",
                    note: "Civic issue submitted. AI model extracted metrics and estimated economic loss.",
                    timestamp: issue.reportedAt,
                    updatedBy: "System"
                  }
                ];
                if (issue.status !== "open") {
                  trace.push({
                    status: "Assigned",
                    note: `Dispatched to ${issue.assignedTo || issue.department || "Municipal Command"}. Dispatcher assigned field crew.`,
                    timestamp: issue.assignedAt || issue.reportedAt,
                    updatedBy: "Router AI"
                  });
                }
                if (issue.status === "in_progress" || issue.status === "resolved") {
                  trace.push({
                    status: "In Progress",
                    note: "Crew deployed on site. Resolution works have commenced.",
                    timestamp: issue.updatedAt || issue.reportedAt,
                    updatedBy: "Supervisor"
                  });
                }
                if (issue.status === "resolved") {
                  trace.push({
                    status: "Resolved",
                    note: "Issue marked resolved. Visual inspection logged and updated.",
                    timestamp: issue.resolvedAt || issue.updatedAt || issue.reportedAt,
                    updatedBy: "Inspector"
                  });
                }
                return trace;
              };

              const activeTimeline = getFullTimeline();

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden card-1 hover:card-2 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Top Details Grid */}
                  <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-4 border-b border-[#F5F4F1]">
                    <div className="flex gap-4">
                      {/* Emoji Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-[#F8F7F4] border border-[#E4E2DC] flex items-center justify-center text-2xl flex-shrink-0">
                        {emoji}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="text-base font-bold text-[#1A1A1C]">{issue.title}</h2>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ backgroundColor: severityStyle.bgColor, color: severityStyle.color }}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9A9AA4] flex items-center gap-1.5">
                          <span className="font-semibold text-[#1A1A1C] uppercase font-mono-data">#{issue.id.slice(0, 8)}</span>
                          ·
                          <MapPin size={10} className="text-[#9A9AA4]" />
                          <span className="truncate max-w-[200px] md:max-w-xs">{issue.location?.address || issue.locationAddress || "Unknown location"}</span>
                          ·
                          <Calendar size={10} className="text-[#9A9AA4]" />
                          <span>{dateStr}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-1 border-t md:border-none pt-3 md:pt-0">
                      <span
                        className="text-[10px] font-bold px-3 py-1 rounded-full text-center"
                        style={{ backgroundColor: statusStyle.bgColor, color: statusStyle.color }}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-[10px] text-[#9A9AA4] font-medium">
                        {issue.department || issue.assignedTo || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="px-6 py-4 bg-[#FDFDFD] border-b border-[#F5F4F1] flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-[#9A9AA4] font-medium mb-1.5">
                        <span className={progress >= 25 ? "text-[#1A1A1C] font-semibold" : ""}>Reported</span>
                        <span className={progress >= 50 ? "text-[#1A1A1C] font-semibold" : ""}>Assigned</span>
                        <span className={progress >= 75 ? "text-[#1A1A1C] font-semibold" : ""}>In Progress</span>
                        <span className={progress >= 100 ? "text-[#1A1A1C] font-semibold" : ""}>Resolved</span>
                      </div>
                      <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: statusStyle.barColor }}
                        />
                        {/* Milestone indicators */}
                        {[25, 50, 75, 100].map((step) => (
                          <div
                            key={step}
                            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white border border-[#DDD] transition-colors"
                            style={{
                              left: `calc(${step}% - 3px)`,
                              borderColor: progress >= step ? statusStyle.barColor : "#DDD"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[9px] text-[#9A9AA4] uppercase tracking-wider">Completion</p>
                      <p className="text-sm font-bold text-[#1A1A1C] font-mono-data">{progress}%</p>
                    </div>
                  </div>

                  {/* Timeline Expander & View Details CTA */}
                  <div className="px-6 py-3 flex items-center justify-between bg-[#F8F7F4]/40">
                    <button
                      onClick={() => toggleTimeline(issue.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A9E6E] hover:text-[#5A7A50] transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide Timeline
                          <ChevronUp size={12} />
                        </>
                      ) : (
                        <>
                          Show Timeline & History
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[#5A5A62] hover:text-[#1A1A1C] font-bold transition-colors"
                      >
                        <MessageSquare size={12} className="text-[#9A9AA4]" />
                        <span>Discussion & Details</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Timeline Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#FAFAFA] border-t border-[#F5F4F1]"
                      >
                        <div className="p-6 flex flex-col gap-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#9A9AA4] mb-1">Status Timeline History</h4>
                          <div className="relative pl-6 border-l border-[#E4E2DC] flex flex-col gap-6">
                            {activeTimeline.map((item, index) => {
                              const itemStyle = getStatusStyle(item.status);
                              const isLast = index === activeTimeline.length - 1;
                              const timeStr = formatDate(item.timestamp);
                              return (
                                <div key={index} className="relative">
                                  {/* Bullet indicator */}
                                  <div
                                    className="absolute left-[-30px] top-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                                    style={{
                                      backgroundColor: isLast ? itemStyle.barColor : "#E4E2DC"
                                    }}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-bold text-[#1A1A1C] capitalize">{getStatusLabel(item.status)}</span>
                                      <span className="text-[9px] text-[#9A9AA4] font-medium font-mono-data">{timeStr}</span>
                                      {item.updatedBy && (
                                        <span className="text-[9px] text-[#5A7A50] bg-[#EAF2E6] px-1.5 py-0.2 rounded font-semibold font-mono">
                                          By {item.updatedBy}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#5A5A62] leading-relaxed">{item.note}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
