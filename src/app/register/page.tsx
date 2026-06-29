"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  Building2,
  Loader2,
  Camera,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { getAllWards } from "@/lib/services/wardService";

// ─── Fallback wards ────────────────────────────────────────────────────────────

const FALLBACK_WARDS = [
  { id: "ward_14", name: "Indiranagar", wardNumber: 14 },
  { id: "ward_21", name: "HSR Layout", wardNumber: 21 },
  { id: "ward_22", name: "Koramangala", wardNumber: 22 },
  { id: "ward_18", name: "Domlur", wardNumber: 18 },
  { id: "ward_31", name: "Bellandur", wardNumber: 31 },
  { id: "ward_07", name: "Shivajinagar", wardNumber: 7 },
  { id: "ward_11", name: "Rajajinagar", wardNumber: 11 },
  { id: "ward_25", name: "Whitefield", wardNumber: 25 },
];

// ─── Password strength ─────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#D4726A" };
  if (score <= 3) return { score, label: "Fair", color: "#C8A87A" };
  return { score, label: "Strong", color: "#7A9E6E" };
}

// ─── Input style ────────────────────────────────────────────────────────────────

function inputCls(valid = true) {
  return `w-full pl-10 pr-4 py-2.5 rounded-xl border ${
    valid ? "border-[#E4E2DC]" : "border-[#D4726A]"
  } bg-[#FAF9F6] text-sm text-[#1A1A1C] placeholder-[#C0BDB6] focus:outline-none focus:ring-2 focus:ring-[#7A9E6E]/30 focus:border-[#7A9E6E] transition-all disabled:opacity-50`;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, profile, loading: authLoading, demoMode } = useAuthContext();

  // ── Wards ──────────────────────────────────────────────────────────────────
  const [wards, setWards] = useState(FALLBACK_WARDS);

  useEffect(() => {
    getAllWards()
      .then((data) => { if (data?.length) setWards(data as typeof FALLBACK_WARDS); })
      .catch(() => {});
  }, []);

  // ── Redirect if already authenticated ─────────────────────────────────────
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      router.push(profile.role === "citizen" ? "/citizen-dashboard" : "/authority-dashboard");
    }
  }, [isAuthenticated, profile, authLoading, router]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    wardId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Photo picker ───────────────────────────────────────────────────────────
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return; // 4 MB limit (silent, user can retry)
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }, [photoPreview]);

  // ── Field helpers ──────────────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password || !form.wardId) return;

    setLoading(true);
    try {
      const selectedWard = wards.find((w) => w.id === form.wardId);
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        wardId: form.wardId,
        ward: selectedWard?.name,
        photoFile: photoFile ?? null,
      });
      setDone(true);
      setTimeout(() => router.push("/citizen-dashboard"), 1200);
    } catch {
      // Error toast shown by AuthContext
    } finally {
      setLoading(false);
    }
  }

  const pwStrength = passwordStrength(form.password);
  const selectedWardName = wards.find((w) => w.id === form.wardId)?.name;

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-[#E4E2DC] border-t-[#7A9E6E]"
        />
        <p className="text-sm font-medium text-[#5A5A62]">Loading CitySpell AI…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 md:p-6">
      {/* Background orbs */}
      <div
        className="fixed top-[-160px] right-[-160px] w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8DFC0 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B8D8D8 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden">
        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div className="relative bg-[#1A1A1C] p-10 flex-col justify-between hidden md:flex">
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
                CitySpell<span className="text-[#7A9E6E]">AI</span>
              </span>
            </Link>

            <h2 className="text-3xl font-serif text-white leading-tight mb-4">
              Your Voice Shapes<br />Your Ward
            </h2>
            <p className="text-[#9A9AA4] text-sm leading-relaxed mb-8">
              Join Indian citizens raising local issues, tracking BBMP departments, and monitoring ward health scores in real-time.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { label: "Active citizens online", value: "8,940", color: "#7A9E6E" },
                { label: "Preventive suggestions generated", value: "342", color: "#C8A87A" },
                { label: "Community satisfaction score", value: "4.5/5", color: "#5E9E9E" },
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

        {/* ── Right panel ────────────────────────────────────────────────── */}
        <div className="bg-white p-8 md:p-10 flex flex-col">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-6 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#7A9E6E] flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-semibold text-[#1A1A1C] text-sm">
              CitySpell<span className="text-[#7A9E6E]">AI</span>
            </span>
          </Link>

          {/* Demo mode banner */}
          {demoMode && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8E6] border border-[#F0D890] mb-4 text-xs text-[#8A6A20] font-medium">
              <Info size={13} className="flex-shrink-0" />
              Demo mode — account data is not persisted.
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-serif text-[#1A1A1C] mb-1">Create an account</h1>
            <p className="text-sm text-[#9A9AA4]">Register as a citizen to report and track issues</p>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 size={48} className="text-[#7A9E6E]" />
                </motion.div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1A1A1C]">Welcome aboard!</p>
                  <p className="text-sm text-[#9A9AA4] mt-1">Redirecting to your dashboard…</p>
                </div>
                <motion.div
                  className="h-1 bg-[#7A9E6E] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "160px" }}
                  transition={{ duration: 1.1, ease: "linear" }}
                />
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3.5 flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* ── Profile photo ─────────────────────────────────── */}
                <div className="flex items-center gap-4 mb-1">
                  <div className="relative flex-shrink-0">
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl bg-[#F5F4F1] border-2 border-dashed border-[#D4D0C8] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#7A9E6E] hover:bg-[#EAF2E6] transition-all group"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={18} className="text-[#C0BDB6] group-hover:text-[#7A9E6E] transition-colors" />
                      )}
                    </div>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D4726A] flex items-center justify-center cursor-pointer shadow-sm"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#5A5A62]">Profile photo <span className="text-[#B0ADA8]">(optional)</span></p>
                    <p className="text-[11px] text-[#9A9AA4] mt-0.5">JPG, PNG · max 4 MB</p>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="text-[11px] text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors cursor-pointer mt-0.5"
                    >
                      {photoPreview ? "Change photo" : "Upload photo"}
                    </button>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                {/* ── Full name ──────────────────────────────────────── */}
                <div>
                  <label className="text-xs font-medium text-[#5A5A62] mb-1 block">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Arjun Sharma"
                      value={form.name}
                      onChange={handleInput}
                      disabled={loading}
                      required
                      className={inputCls()}
                    />
                  </div>
                </div>

                {/* ── Email ─────────────────────────────────────────── */}
                <div>
                  <label className="text-xs font-medium text-[#5A5A62] mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                    <input
                      type="email"
                      name="email"
                      placeholder="arjun@example.com"
                      value={form.email}
                      onChange={handleInput}
                      disabled={loading}
                      required
                      className={inputCls()}
                    />
                  </div>
                </div>

                {/* ── Phone ─────────────────────────────────────────── */}
                <div>
                  <label className="text-xs font-medium text-[#5A5A62] mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleInput}
                      disabled={loading}
                      required
                      className={inputCls()}
                    />
                  </div>
                </div>

                {/* ── Ward ──────────────────────────────────────────── */}
                <div>
                  <label className="text-xs font-medium text-[#5A5A62] mb-1 block">Select Ward</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4] z-10" />
                    <select
                      name="wardId"
                      value={form.wardId}
                      onChange={handleInput}
                      disabled={loading}
                      required
                      className={`${inputCls()} appearance-none`}
                    >
                      <option value="" disabled>Choose your ward</option>
                      {wards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {(w as { wardNumber?: number }).wardNumber
                            ? `Ward ${(w as { wardNumber?: number }).wardNumber} — ${w.name}`
                            : w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedWardName && (
                    <p className="text-[11px] text-[#7A9E6E] mt-1 font-medium">
                      ✓ {selectedWardName} selected
                    </p>
                  )}
                </div>

                {/* ── Password ──────────────────────────────────────── */}
                <div>
                  <label className="text-xs font-medium text-[#5A5A62] mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleInput}
                      disabled={loading}
                      required
                      minLength={6}
                      className={`${inputCls()} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9AA4] hover:text-[#5A5A62] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: i <= pwStrength.score ? pwStrength.color : "#E4E2DC",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Submit ────────────────────────────────────────── */}
                <button
                  type="submit"
                  disabled={loading || !form.name || !form.email || !form.phone || !form.wardId || !form.password}
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-1 rounded-xl text-sm font-semibold text-white bg-[#7A9E6E] hover:bg-[#5A7A50] transition-all shadow-lg shadow-[#7A9E6E]/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-xs text-[#9A9AA4] text-center mt-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#7A9E6E] font-medium hover:text-[#5A7A50] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
