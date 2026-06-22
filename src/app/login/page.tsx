"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

type Tab = "citizen" | "authority";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({ email: "", phone: "", password: "" });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormState((s) => ({ ...s, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      {/* Background orbs */}
      <div
        className="fixed top-[-160px] right-[-160px] w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8DFC0 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B8D8D8 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden relative">
        {/* Left panel */}
        <div className="relative bg-[#1A1A1C] p-10 flex flex-col justify-between hidden md:flex">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, #7A9E6E 0%, transparent 50%), radial-gradient(circle at 70% 80%, #5E9E9E 0%, transparent 40%)",
            }}
          />
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2.5 mb-12">
              <div className="w-8 h-8 rounded-xl bg-[#7A9E6E] flex items-center justify-center">
                <MapPin size={15} className="text-white" />
              </div>
              <span className="font-semibold text-white text-base">
                CitySpell<span style={{ color: "#7A9E6E" }}>AI</span>
              </span>
            </Link>

            <h2 className="text-3xl font-serif text-white leading-tight mb-4">
              The Civic Intelligence<br />Layer for Indian Cities
            </h2>
            <p className="text-[#9A9AA4] text-sm leading-relaxed mb-8">
              Join thousands of citizens and officials transforming how Indian cities respond to civic issues.
            </p>

            {/* Mini stats */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Issues resolved this month", value: "1,247", color: "#7A9E6E" },
                { label: "Economic impact prevented", value: "₹2.3 Cr", color: "#C8A87A" },
                { label: "Average resolution time", value: "6.2 hrs", color: "#5E9E9E" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-white/10">
                  <span className="text-xs text-[#6A6A72]">{s.label}</span>
                  <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[10px] text-[#5A5A62]">
            © 2026 CitySpell AI · Civic Intelligence Platform
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-white p-8 md:p-10 flex flex-col">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#7A9E6E] flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-semibold text-[#1A1A1C] text-sm">
              CitySpell<span className="text-[#7A9E6E]">AI</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-serif text-[#1A1A1C] mb-1">Welcome back</h1>
            <p className="text-sm text-[#9A9AA4]">Sign in to your account</p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-[#F5F4F1] p-1 rounded-xl mb-8">
            {(["citizen", "authority"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-white text-[#1A1A1C] shadow-sm"
                    : "text-[#9A9AA4] hover:text-[#5A5A62]"
                }`}
              >
                {t === "citizen" ? (
                  <User size={14} />
                ) : (
                  <Building2 size={14} />
                )}
                {t === "citizen" ? "Citizen" : "Authority"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5 flex-1"
            >
              {/* Authority badge */}
              {tab === "authority" && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#E8EFF6] border border-[#B8CCE0]">
                  <Shield size={15} className="text-[#6A88AA] flex-shrink-0" />
                  <p className="text-xs text-[#6A88AA] font-medium">
                    Authority access requires verified credentials issued by your Municipal Corporation.
                  </p>
                </div>
              )}

              {/* Form fields */}
              {tab === "citizen" ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formState.phone}
                        onChange={handleInput}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-sm text-[#1A1A1C] placeholder-[#C0BDB6] focus:outline-none focus:ring-2 focus:ring-[#7A9E6E]/30 focus:border-[#7A9E6E] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Your password"
                        value={formState.password}
                        onChange={handleInput}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-sm text-[#1A1A1C] placeholder-[#C0BDB6] focus:outline-none focus:ring-2 focus:ring-[#7A9E6E]/30 focus:border-[#7A9E6E] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4] hover:text-[#5A5A62] transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                      Official Email
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                      <input
                        type="email"
                        name="email"
                        placeholder="officer@bbmp.gov.in"
                        value={formState.email}
                        onChange={handleInput}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-sm text-[#1A1A1C] placeholder-[#C0BDB6] focus:outline-none focus:ring-2 focus:ring-[#6A88AA]/30 focus:border-[#6A88AA] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#5A5A62] mb-1.5 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Your password"
                        value={formState.password}
                        onChange={handleInput}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E4E2DC] bg-[#FAF9F6] text-sm text-[#1A1A1C] placeholder-[#C0BDB6] focus:outline-none focus:ring-2 focus:ring-[#6A88AA]/30 focus:border-[#6A88AA] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4] hover:text-[#5A5A62] transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <button className="text-xs text-[#9A9AA4] hover:text-[#5A5A62] transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Link
                href={tab === "citizen" ? "/citizen-dashboard" : "/authority-dashboard"}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${
                  tab === "citizen"
                    ? "bg-[#7A9E6E] hover:bg-[#5A7A50]"
                    : "bg-[#6A88AA] hover:bg-[#4A6888]"
                }`}
              >
                Sign in as {tab === "citizen" ? "Citizen" : "Authority"}
                <ArrowRight size={15} />
              </Link>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E4E2DC]" />
                <span className="text-[10px] text-[#9A9AA4] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-[#E4E2DC]" />
              </div>

              {/* OTP option */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-[#5A5A62] hover:text-[#1A1A1C] border border-[#E4E2DC] hover:border-[#D0CCC4] hover:bg-[#FAF9F6] transition-all">
                <Phone size={14} />
                Continue with OTP
              </button>
            </motion.div>
          </AnimatePresence>

          <p className="text-xs text-[#9A9AA4] text-center mt-6">
            New to CitySpell?{" "}
            <button className="text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
