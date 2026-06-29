"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useIssue } from "@/lib/hooks/useIssues";
import { toggleUpvote, addComment } from "@/lib/services/issueService";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  Brain,
  IndianRupee,
  Users,
  Shield,
  Clock,
  ThumbsUp,
  MessageSquare,
  Send,
  Loader2,
  Trash
} from "lucide-react";

// Status styling helpers
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

const formatINR = (amount: number): string => {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${Math.round(amount / 1_000)}K`;
  return `₹${amount}`;
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Just now";
  const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;

  const { isAuthenticated, user, profile, loading: authLoading } = useAuthContext();
  const { issue, loading: issueLoading } = useIssue(issueId);

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleUpvote = async () => {
    if (!user || !issue || upvoting) return;
    try {
      setUpvoting(true);
      const hasVoted = issue.upvotedBy?.includes(user.uid) || false;
      await toggleUpvote(issue.id, user.uid, hasVoted);
    } catch (err) {
      console.error("Failed to toggle upvote:", err);
    } finally {
      setUpvoting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !issue || !commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const displayName = profile?.displayName || user.displayName || "Anonymous Citizen";
      await addComment(issue.id, user.uid, displayName, commentText.trim());
      setCommentText("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (authLoading || issueLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
          <div className="h-4 w-32 rounded shimmer-bg mb-8" />
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="aspect-square rounded-3xl shimmer-bg" />
              <div className="bg-white rounded-2xl border border-[#E4E2DC] p-5 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-28 rounded shimmer-bg" />
                  <div className="h-5 w-36 rounded shimmer-bg" />
                </div>
                <div className="h-9 w-20 rounded-xl shimmer-bg" />
              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-white rounded-3xl border border-[#E4E2DC] p-6">
                <div className="h-8 w-2/3 rounded shimmer-bg mb-3" />
                <div className="h-4 w-1/2 rounded shimmer-bg mb-6" />
                <div className="h-2 w-full rounded-full shimmer-bg mb-6" />
                <div className="grid grid-cols-3 gap-3">
                  {[0,1,2,3,4,5].map((i) => (
                    <div key={i} className="bg-[#F8F7F4] rounded-xl p-3 border border-[#E4E2DC]/50">
                      <div className="h-3 w-full rounded shimmer-bg mb-2" />
                      <div className="h-5 w-2/3 rounded shimmer-bg" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-[#E4E2DC] p-6">
                <div className="h-5 w-40 rounded shimmer-bg mb-5" />
                <div className="flex flex-col gap-5">
                  {[0,1,2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-4 h-4 rounded-full shimmer-bg mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-3 w-32 rounded shimmer-bg mb-2" />
                        <div className="h-3 w-full rounded shimmer-bg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="pt-32 pb-20 max-w-xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E2DC] flex items-center justify-center text-[#D4726A] mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-2xl font-serif text-[#1A1A1C] mb-2">Issue not found</h2>
          <p className="text-sm text-[#9A9AA4] mb-6">The issue identifier is invalid or the document has been removed.</p>
          <Link href="/citizen-dashboard" className="px-5 py-2.5 bg-[#1A1A1C] text-white rounded-xl text-xs font-semibold hover:bg-[#2C2C2E] transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const progress = getStatusProgress(issue.status);
  const statusStyle = getStatusStyle(issue.status);
  const severityStyle = getSeverityStyle(issue.severity);
  const emoji = getCategoryEmoji(issue.category);
  const dateStr = formatDate(issue.reportedAt);
  const hasUpvoted = issue.upvotedBy?.includes(user?.uid || "") || false;

  // Build standard timeline trace fallback if empty
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
        note: "Issue marked resolved. Visual inspection logged and completed.",
        timestamp: issue.resolvedAt || issue.updatedAt || issue.reportedAt,
        updatedBy: "Inspector"
      });
    }
    return trace;
  };

  const activeTimeline = getFullTimeline();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={profile?.role === "authority" ? "/authority-dashboard" : "/my-complaints"}
            className="inline-flex items-center gap-1.5 text-xs text-[#9A9AA4] hover:text-[#1A1A1C] transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>
          <span className="text-[10px] text-[#9A9AA4] font-mono uppercase tracking-wider font-mono-data">ID: {issue.id}</span>
        </div>

        {/* Outer Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image and Actions */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-3xl border border-[#E4E2DC] bg-white aspect-square shadow-sm flex items-center justify-center hover:shadow-md transition-shadow duration-300">
              {issue.imageUrl || (issue.images && issue.images[0]) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={issue.imageUrl || issue.images?.[0]}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8 opacity-40 flex flex-col items-center gap-2">
                  <div className="text-4xl">{emoji}</div>
                  <p className="text-xs font-semibold">No Photo Uploaded</p>
                </div>
              )}
              {/* Category Emoji Badge */}
              <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl shadow-md">
                {emoji}
              </div>
            </div>

            {/* Upvote Widget */}
            <div className="bg-white rounded-2xl border border-[#E4E2DC] p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] text-[#9A9AA4] uppercase tracking-wider font-medium">Community Upvotes</p>
                <p className="text-base font-bold text-[#1A1A1C] mt-0.5 flex items-center gap-1.5">
                  <ThumbsUp size={15} className="text-[#7A9E6E]" />
                  <span className="font-mono-data">{issue.upvotes || 0} Citizens Supported</span>
                </p>
              </div>
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hasUpvoted
                    ? "bg-[#EAF2E6] text-[#7A9E6E] border border-[#C8DFC0]"
                    : "bg-[#1A1A1C] text-white hover:bg-[#2C2C2E]"
                }`}
              >
                {upvoting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ThumbsUp size={12} fill={hasUpvoted ? "currentColor" : "none"} />
                )}
                {hasUpvoted ? "Upvoted" : "Upvote"}
              </button>
            </div>
          </div>

          {/* Right Column: Details, Timeline, and Comments */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Main Details Card */}
            <div className="bg-white rounded-3xl border border-[#E4E2DC] p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-serif text-[#1A1A1C] mb-1.5">{issue.title || "Unclassified Issue"}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#9A9AA4] font-medium">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ backgroundColor: severityStyle.bgColor, color: severityStyle.color }}
                    >
                      {issue.severity}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {issue.location?.address || issue.locationAddress || "General Ward"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-[10px] font-bold px-3 py-1 rounded-full capitalize"
                    style={{ backgroundColor: statusStyle.bgColor, color: statusStyle.color }}
                  >
                    {getStatusLabel(issue.status)}
                  </span>
                  <span className="text-[10px] text-[#9A9AA4] font-semibold">{issue.department || issue.assignedTo || "AI Routing"}</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="py-4 border-y border-[#F5F4F1] my-4">
                <div className="flex justify-between text-[10px] text-[#9A9AA4] font-medium mb-1.5">
                  <span className={progress >= 25 ? "text-[#1A1A1C] font-semibold" : ""}>Reported</span>
                  <span className={progress >= 50 ? "text-[#1A1A1C] font-semibold" : ""}>Assigned</span>
                  <span className={progress >= 75 ? "text-[#1A1A1C] font-semibold" : ""}>In Progress</span>
                  <span className={progress >= 100 ? "text-[#1A1A1C] font-semibold" : ""}>Resolved</span>
                </div>
                <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-800"
                    style={{ width: `${progress}%`, backgroundColor: statusStyle.barColor }}
                  />
                  {[25, 50, 75, 100].map((step) => (
                    <div
                      key={step}
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white border border-[#DDD]"
                      style={{
                        left: `calc(${step}% - 3px)`,
                        borderColor: progress >= step ? statusStyle.barColor : "#DDD"
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9A9AA4] mb-2">AI Vision Description</h3>
                <p className="text-sm text-[#5A5A62] leading-relaxed">
                  {issue.description || "No description provided."}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Brain, label: "AI Confidence", value: issue.aiAnalysis?.confidence ? `${Math.round(issue.aiAnalysis.confidence * 100)}%` : "92%", color: "#6A88AA", bg: "#E8EFF6" },
                  { icon: Shield, label: "Severity Score", value: issue.aiAnalysis?.priority ? `${issue.aiAnalysis.priority * 10}/100` : "78/100", color: "#D4726A", bg: "#FAECEA" },
                  { icon: IndianRupee, label: "Daily Economic Loss", value: formatINR(issue.economicImpact?.estimatedLossINR || issue.aiAnalysis?.estimatedCost || 15000), color: "#C8A87A", bg: "#FAF0E0" },
                  { icon: Users, label: "Affected Citizens", value: `${(issue.economicImpact?.affectedResidents || 1000).toLocaleString("en-IN")}+`, color: "#9A9C5E", bg: "#F2F3E0" },
                  { icon: Building2, label: "Routing Ward", value: issue.location?.wardName || "Ward 14", color: "#7A9E6E", bg: "#EAF2E6" },
                  { icon: Clock, label: "Report Date", value: dateStr.split(',')[0], color: "#5E9E9E", bg: "#E4F2F2" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="bg-[#F8F7F4] rounded-xl p-3 border border-[#E4E2DC]/50 hover:bg-white hover:border-[#D4D0C8] hover:shadow-sm transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-[#9A9AA4] uppercase tracking-wider">
                        <Icon size={10} style={{ color: m.color }} />
                        <span>{m.label}</span>
                      </div>
                      <p className="text-sm font-bold text-[#1A1A1C]">{m.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline History Card */}
            <div className="bg-white rounded-3xl border border-[#E4E2DC] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#1A1A1C] mb-4 flex items-center gap-2">
                <Clock size={16} className="text-[#7A9E6E]" />
                Resolution Timeline
              </h2>
              <div className="relative pl-6 border-l border-[#E4E2DC] flex flex-col gap-6">
                {activeTimeline.map((item, index) => {
                  const itemStyle = getStatusStyle(item.status);
                  const isLast = index === activeTimeline.length - 1;
                  return (
                    <div key={index} className="relative">
                      {/* Bullet point */}
                      <div
                        className="absolute left-[-30px] top-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors"
                        style={{ backgroundColor: isLast ? itemStyle.barColor : "#E4E2DC" }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-[#1A1A1C] capitalize">{getStatusLabel(item.status)}</span>
                          <span className="text-[10px] text-[#9A9AA4] font-medium font-mono-data">{formatDate(item.timestamp)}</span>
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

            {/* Comments Card */}
            <div className="bg-white rounded-3xl border border-[#E4E2DC] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#1A1A1C] mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-[#6A88AA]" />
                Discussion ({issue.comments?.length || 0})
              </h2>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Ask a question or add details..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-xs text-[#1A1A1C] placeholder-[#B0ACA4] focus:outline-none focus:ring-2 focus:ring-[#7A9E6E]/20 focus:border-[#7A9E6E] transition-all"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1A1A1C] text-white text-xs font-bold hover:bg-[#2C2C2E] disabled:opacity-50 disabled:hover:bg-[#1A1A1C] transition-all cursor-pointer flex-shrink-0"
                >
                  {submittingComment ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                </button>
              </form>

              {/* Comments List */}
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-[#F8F7F4] rounded-2xl border border-[#E4E2DC]/40 flex gap-3 items-start">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-[#EAF2E6] text-[#5A7A50] font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {comment.userName ? comment.userName[0].toUpperCase() : "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#1A1A1C] truncate">{comment.userName || "Anonymous"}</span>
                          <span className="text-[9px] text-[#9A9AA4] font-mono-data">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-[#5A5A62] leading-relaxed break-words">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F4F1] flex items-center justify-center text-[#C0BDB6] mb-1">
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-sm font-medium text-[#9A9AA4]">No comments yet</p>
                    <p className="text-xs text-[#C0BDB6]">Be the first to add context to this issue.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
