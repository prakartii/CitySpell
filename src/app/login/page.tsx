"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  Shield,
  Loader2,
  KeyRound,
  RotateCcw,
  UserCheck,
  ChevronLeft,
  Info,
} from "lucide-react";
import { useAuthContext } from "@/lib/context/AuthContext";
import type { ConfirmationResult } from "firebase/auth";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = "citizen" | "authority";
type Method = "email" | "phone";
type PhoneStep = "input" | "verify";

// ─── Constants ─────────────────────────────────────────────────────────────────

const OTP_RESEND_SECONDS = 60;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRedirectPath(role: string): string {
  if (role === "authority" || role === "admin") return "/authority-dashboard";
  return "/citizen-dashboard";
}

// ─── Shared input style ────────────────────────────────────────────────────────

function inputCls(accent: string) {
  return `w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-sm text-[#1A1A1C] placeholder-[#C0BDB6] focus:outline-none focus:ring-2 ${accent} focus:border-current transition-all disabled:opacity-50 hover:border-[#D0CCC4] hover:bg-white`;
}

// ─── Left panel stats ───────────────────────────────────────────────────────────

const STATS = [
  { label: "Issues resolved this month", value: "1,247", color: "#7A9E6E", icon: "✓" },
  { label: "Economic impact prevented", value: "₹2.3 Cr", color: "#C8A87A", icon: "₹" },
  { label: "Average resolution time", value: "6.2 hrs", color: "#5E9E9E", icon: "⏱" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const {
    signIn,
    sendOTP,
    verifyOTP,
    resetPassword,
    continueAsGuest,
    isAuthenticated,
    profile,
    loading: authLoading,
    demoMode,
  } = useAuthContext();

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("citizen");
  const [method, setMethod] = useState<Method>("email");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmResultRef = useRef<ConfirmationResult | null>(null);

  // ── Redirect if already authenticated ─────────────────────────────────────
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      router.push(getRedirectPath(profile.role));
    }
  }, [isAuthenticated, profile, authLoading, router]);

  // ── Countdown timer for OTP resend ────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(OTP_RESEND_SECONDS);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  // ── Tab / method change resets form ───────────────────────────────────────
  function resetForm() {
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setPhoneStep("input");
    confirmResultRef.current = null;
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }

  // ── Email / password login ─────────────────────────────────────────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const doc = await signIn(email.trim(), password);
      if (tab === "authority" && doc.role !== "authority" && doc.role !== "admin") {
        // Signed out will be handled by signOut, but we just redirect wrong users
        router.push("/login");
        return;
      }
      if (tab === "citizen" && doc.role !== "citizen") {
        router.push("/login");
        return;
      }
      router.push(getRedirectPath(doc.role));
    } catch {
      // Error toast already shown by AuthContext
    } finally {
      setLoading(false);
    }
  }

  // ── Phone: send OTP ───────────────────────────────────────────────────────
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const result = await sendOTP(phone.trim(), "recaptcha-container");
      confirmResultRef.current = result;
      setPhoneStep("verify");
      startCountdown();
    } catch {
      // toast shown by AuthContext
    } finally {
      setLoading(false);
    }
  }

  // ── Phone: verify OTP ─────────────────────────────────────────────────────
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) return;
    if (!confirmResultRef.current) return;
    setLoading(true);
    try {
      const doc = await verifyOTP(confirmResultRef.current, otp.trim());
      if (tab === "authority" && doc.role !== "authority" && doc.role !== "admin") {
        router.push("/login");
        return;
      }
      if (tab === "citizen" && doc.role !== "citizen") {
        router.push("/login");
        return;
      }
      router.push(getRedirectPath(doc.role));
    } catch {
      // toast shown by AuthContext
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  async function handleResendOTP() {
    if (countdown > 0 || !phone.trim()) return;
    setLoading(true);
    try {
      const result = await sendOTP(phone.trim(), "recaptcha-container");
      confirmResultRef.current = result;
      setOtp("");
      startCountdown();
    } catch {
      // toast shown
    } finally {
      setLoading(false);
    }
  }

  // ── Guest ──────────────────────────────────────────────────────────────────
  function handleGuest() {
    continueAsGuest();
    router.push("/citizen-dashboard");
  }

  // ── Forgot password ────────────────────────────────────────────────────────
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setShowForgot(false);
      setForgotEmail("");
    } catch {
      // toast shown
    } finally {
      setForgotLoading(false);
    }
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-[#E4E2DC] border-t-[#7A9E6E]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin size={12} className="text-[#7A9E6E]" />
          </div>
        </div>
        <p className="text-sm font-medium text-[#5A5A62]">Loading CitySpell AI…</p>
        <div className="loading-dots text-[#C8DFC0] flex gap-1.5">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  // ── Colors per tab ─────────────────────────────────────────────────────────
  const isAuthority = tab === "authority";
  const accent = isAuthority ? "focus:ring-[#6A88AA]/30" : "focus:ring-[#7A9E6E]/30";
  const btnColor = isAuthority
    ? "bg-[#6A88AA] hover:bg-[#4A6888] shadow-[#6A88AA]/20"
    : "bg-[#7A9E6E] hover:bg-[#5A7A50] shadow-[#7A9E6E]/20";
  const tabActiveColor = isAuthority ? "text-[#6A88AA]" : "text-[#7A9E6E]";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 md:p-6">
      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" className="hidden" />

      {/* Background orbs */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.22, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-160px] right-[-160px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8DFC0 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.16, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #B8D8D8 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 shadow-2xl shadow-black/12 rounded-3xl overflow-hidden">
        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div className="relative bg-[#1A1A1C] p-10 flex-col justify-between hidden md:flex overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-12"
            animate={{ opacity: [0.10, 0.15, 0.10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, #7A9E6E 0%, transparent 50%), radial-gradient(circle at 70% 80%, #5E9E9E 0%, transparent 40%)",
            }}
          />
          {/* Floating orbs */}
          <motion.div
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[10%] w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(122,158,110,0.12) 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ y: [8, -8, 8], x: [4, -4, 4] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[25%] left-[5%] w-24 h-24 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(94,158,158,0.10) 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center gap-2.5 mb-12">
                <div className="w-8 h-8 rounded-xl bg-[#7A9E6E] flex items-center justify-center shadow-lg shadow-[#7A9E6E]/30">
                  <MapPin size={15} className="text-white" />
                </div>
                <span className="font-semibold text-white text-base">
                  CitySpell<span className="text-[#7A9E6E]">AI</span>
                </span>
              </Link>

              <h2 className="text-3xl font-serif text-white leading-tight mb-4">
                The Civic Intelligence<br />Layer for Indian Cities
              </h2>
              <p className="text-[#9A9AA4] text-sm leading-relaxed mb-8">
                Join thousands of citizens and officials transforming how Indian cities respond to civic issues.
              </p>
            </motion.div>

            <div className="flex flex-col gap-3">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-center justify-between py-2.5 border-b border-white/8 group"
                >
                  <span className="text-xs text-[#6A6A72] group-hover:text-[#8A8A92] transition-colors">{s.label}</span>
                  <span className="text-sm font-bold font-mono-data tabular-nums" style={{ color: s.color }}>{s.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Live indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#7A9E6E] pulse-dot" />
              <span className="text-[10px] text-[#5A5A62]">Live data · Updated in real-time</span>
            </motion.div>
          </div>

          <p className="relative z-10 text-[10px] text-[#5A5A62]">
            © 2026 CitySpell AI · Civic Intelligence Platform
          </p>
        </div>

        {/* ── Right panel ────────────────────────────────────────────────── */}
        <div className="relative bg-white p-8 md:p-10 flex flex-col justify-center min-h-[600px] overflow-hidden">
          {/* Subtle corner glow */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-8 pointer-events-none"
            style={{ background: "radial-gradient(circle, #EAF2E6 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#7A9E6E] flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-semibold text-[#1A1A1C] text-sm">
              CitySpell<span className="text-[#7A9E6E]">AI</span>
            </span>
          </Link>

          {/* Demo mode banner */}
          {demoMode && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8E6] border border-[#F0D890] mb-5 text-xs text-[#8A6A20] font-medium">
              <Info size={13} className="flex-shrink-0" />
              Demo mode — Firebase not configured. Any credentials work.
            </div>
          )}

          <div className="mb-7">
            <h1 className="text-2xl font-serif text-[#1A1A1C] mb-1">Welcome back</h1>
            <p className="text-sm text-[#9A9AA4]">Sign in to your CitySpell account</p>
          </div>

          {/* ── Role tabs ──────────────────────────────────────────────── */}
          <div className="relative flex gap-1 bg-[#F5F4F1] p-1 rounded-xl mb-6">
            {/* Sliding indicator */}
            <motion.div
              className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
              style={{ width: "calc(50% - 4px)" }}
              animate={{ x: tab === "citizen" ? 0 : "calc(100% + 4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            {(["citizen", "authority"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); resetForm(); }}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  tab === t
                    ? "text-[#1A1A1C]"
                    : "text-[#9A9AA4] hover:text-[#5A5A62]"
                }`}
              >
                {t === "citizen" ? <User size={14} /> : <Building2 size={14} />}
                {t === "citizen" ? "Citizen" : "Authority"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {/* Authority badge */}
              {isAuthority && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#E8EFF6] border border-[#B8CCE0] mb-5">
                  <Shield size={14} className="text-[#6A88AA] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6A88AA] font-medium leading-snug">
                    Authority access requires verified credentials issued by your Municipal Corporation.
                    Only admins can create authority accounts.
                  </p>
                </div>
              )}

              {/* ── Method tabs ──────────────────────────────────────── */}
              <div className="flex gap-4 mb-6">
                {(["email", "phone"] as Method[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); resetForm(); }}
                    className={`flex items-center gap-1.5 text-sm font-medium pb-1.5 border-b-2 transition-all cursor-pointer ${
                      method === m
                        ? `border-current ${tabActiveColor}`
                        : "border-transparent text-[#9A9AA4] hover:text-[#5A5A62]"
                    }`}
                  >
                    {m === "email" ? <Mail size={13} /> : <Phone size={13} />}
                    {m === "email" ? "Email" : "Phone OTP"}
                  </button>
                ))}
              </div>

              {/* ── Forgot password modal (authority + email only) ───── */}
              <AnimatePresence>
                {showForgot && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5"
                  >
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-3 p-4 rounded-xl bg-[#F5F4F1] border border-[#E4E2DC]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#1A1A1C]">Reset your password</p>
                        <button
                          type="button"
                          onClick={() => setShowForgot(false)}
                          className="text-xs text-[#9A9AA4] hover:text-[#5A5A62] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                        <input
                          type="email"
                          placeholder="Your registered email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className={`${inputCls("focus:ring-[#6A88AA]/30")} text-xs`}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6A88AA] hover:bg-[#4A6888] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {forgotLoading ? <Loader2 size={14} className="animate-spin" /> : "Send reset email"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Email / Password form ─────────────────────────── */}
              {method === "email" && (
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                      {isAuthority ? "Official Email" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                      <input
                        type="email"
                        placeholder={isAuthority ? "officer@bbmp.gov.in" : "you@example.com"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className={inputCls(accent)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className={`${inputCls(accent)} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4] hover:text-[#5A5A62] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {isAuthority && (
                    <div className="flex justify-end -mt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs text-[#9A9AA4] hover:text-[#6A88AA] transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading || !email || !password}
                    whileHover={loading || !email || !password ? {} : { scale: 1.015, y: -1 }}
                    whileTap={loading || !email || !password ? {} : { scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg cursor-pointer disabled:opacity-50 mt-1 ${btnColor}`}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Sign in as {isAuthority ? "Authority" : "Citizen"}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* ── Phone OTP form ────────────────────────────────── */}
              {method === "phone" && (
                <AnimatePresence mode="wait">
                  {phoneStep === "input" ? (
                    <motion.form
                      key="phone-input"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={handleSendOTP}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                            required
                            className={inputCls(accent)}
                          />
                        </div>
                        <p className="text-[11px] text-[#9A9AA4] mt-1.5">
                          We&apos;ll send a 6-digit OTP to this number.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !phone.trim()}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg cursor-pointer disabled:opacity-50 ${btnColor}`}
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <KeyRound size={15} />
                            Send OTP
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="otp-verify"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={handleVerifyOTP}
                      className="flex flex-col gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => { setPhoneStep("input"); setOtp(""); }}
                        className="flex items-center gap-1.5 text-xs text-[#9A9AA4] hover:text-[#5A5A62] transition-colors cursor-pointer self-start"
                      >
                        <ChevronLeft size={14} />
                        Change phone
                      </button>

                      <div className="p-3 rounded-xl bg-[#F0F7EC] border border-[#C8DFC0] text-xs text-[#4A7040] font-medium">
                        OTP sent to <span className="font-bold">{phone}</span>
                        {demoMode && <span className="ml-1 text-[#8A6A20]">(demo: any 6 digits)</span>}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                          Enter 6-digit OTP
                        </label>
                        <div className="relative">
                          <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="• • • • • •"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            disabled={loading}
                            required
                            className={`${inputCls(accent)} tracking-widest text-center text-lg`}
                            autoFocus
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg cursor-pointer disabled:opacity-50 ${btnColor}`}
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <UserCheck size={15} />
                            Verify & Sign In
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        {countdown > 0 ? (
                          <p className="text-xs text-[#9A9AA4]">
                            Resend OTP in <span className="font-semibold text-[#5A5A62]">{countdown}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="flex items-center gap-1.5 text-xs text-[#9A9AA4] hover:text-[#5A5A62] transition-colors cursor-pointer mx-auto disabled:opacity-50"
                          >
                            <RotateCcw size={12} />
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              )}

              {/* ── Continue as Guest (citizen only) ──────────────── */}
              {tab === "citizen" && (
                <div className="mt-5 pt-5 border-t border-[#F0EDE8]">
                  <motion.button
                    type="button"
                    onClick={handleGuest}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-[#5A5A62] bg-[#F5F4F1] hover:bg-[#EDECEA] border border-[#E4E2DC] hover:border-[#D4D0C8] transition-all cursor-pointer"
                  >
                    <User size={14} className="text-[#9A9AA4]" />
                    Continue as Guest
                  </motion.button>
                  <p className="text-[11px] text-[#B0ADA8] text-center mt-2">
                    Browse ward info without an account. Some features are limited.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-xs text-[#9A9AA4] text-center mt-7">
            New to CitySpell?{" "}
            <Link
              href="/register"
              className="text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
