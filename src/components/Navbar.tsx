"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/lib/hooks/useNotifications";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Ward Map" },
  { href: "/report", label: "Report Issue" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, profile, user, signOut, isAuthority, isAdmin } = useAuthContext();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(user?.uid || null);
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <nav className="glass rounded-2xl px-5 py-3 flex items-center justify-between max-w-6xl mx-auto shadow-sm shadow-black/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#7A9E6E] flex items-center justify-center shadow-sm">
              <MapPin size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[#1A1A1C] text-sm tracking-[-0.01em]">
              CitySpell
              <span className="text-[#7A9E6E] ml-0.5">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[#EAF2E6] text-[#5A7A50]"
                    : "text-[#5A5A62] hover:text-[#1A1A1C] hover:bg-[#F5F4F1]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <span className="text-xs font-semibold text-[#5A5A62] px-2 py-1 bg-[#F5F4F1] rounded-lg">
                  {profile?.displayName || user?.displayName || 'User'}
                </span>
                <Link
                  href={isAuthority || isAdmin ? "/authority-dashboard" : "/citizen-dashboard"}
                  className="text-sm font-medium text-[#5A5A62] hover:text-[#1A1A1C] px-3.5 py-1.5 rounded-xl hover:bg-[#F5F4F1] transition-all"
                >
                  Dashboard
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setBellOpen(!bellOpen)}
                    className="relative p-2.5 text-[#5A5A62] hover:text-[#1A1A1C] rounded-xl hover:bg-[#F5F4F1] transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4726A] shadow-sm animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {bellOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E4E2DC] shadow-xl p-4 z-50 flex flex-col gap-2.5 max-h-[350px] card-2"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#F5F4F1]">
                          <span className="text-xs font-bold text-[#1A1A1C]">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                markAllRead();
                                setBellOpen(false);
                              }}
                              className="text-[10px] font-bold text-[#7A9E6E] hover:text-[#5A7A50] cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 overflow-y-auto pr-1 max-h-[240px]">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <Link
                                key={n.id}
                                href={`/issues/${n.issueId}`}
                                onClick={() => {
                                  markRead(n.id);
                                  setBellOpen(false);
                                }}
                                className={`p-2.5 rounded-xl text-left block border transition-all ${
                                  !n.read
                                    ? "bg-[#EAF2E6]/30 border-[#C8DFC0]/40 hover:bg-[#EAF2E6]/60"
                                    : "bg-white border-transparent hover:bg-[#F5F4F1]"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 justify-between">
                                  <span className={`text-[11px] font-bold ${!n.read ? "text-[#1A1A1C]" : "text-[#5A5A62]"}`}>{n.title}</span>
                                  {!n.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E6E]" />
                                  )}
                                </div>
                                <p className="text-[10px] text-[#9A9AA4] mt-0.5 leading-relaxed truncate">{n.message}</p>
                              </Link>
                            ))
                          ) : (
                            <div className="text-center py-8 text-xs text-[#9A9AA4]">
                              No notifications yet
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/login";
                  }}
                  className="text-sm font-medium text-[#D4726A] hover:text-[#C04848] px-3.5 py-1.5 rounded-xl hover:bg-[#FAECEA] transition-all cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[#5A5A62] hover:text-[#1A1A1C] px-3.5 py-1.5 rounded-xl hover:bg-[#F5F4F1] transition-all"
              >
                Login
              </Link>
            )}
            <Link
              href="/report"
              className="text-sm font-medium bg-[#1A1A1C] text-white px-4 py-1.5 rounded-xl hover:bg-[#2C2C2E] transition-all shadow-sm"
            >
              Report Issue
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-[#5A5A62] hover:bg-[#F5F4F1] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="glass rounded-2xl mt-2 px-4 py-4 flex flex-col gap-1 max-w-6xl mx-auto shadow-sm shadow-black/5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[#EAF2E6] text-[#5A7A50]"
                    : "text-[#5A5A62] hover:text-[#1A1A1C] hover:bg-[#F5F4F1]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#E4E2DC] mt-2 pt-2 flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <div className="px-3.5 py-2 text-xs font-semibold text-[#5A5A62]">
                    Hi, {profile?.displayName || user?.displayName || 'User'}
                  </div>
                  <Link
                    href={isAuthority || isAdmin ? "/authority-dashboard" : "/citizen-dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#5A5A62] hover:bg-[#F5F4F1] transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileOpen(false);
                      await signOut();
                      window.location.href = "/login";
                    }}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#D4726A] text-left hover:bg-[#FAECEA] transition-all cursor-pointer w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#5A5A62] hover:bg-[#F5F4F1] transition-all"
                >
                  Login
                </Link>
              )}
              <Link
                href="/report"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium bg-[#1A1A1C] text-white text-center hover:bg-[#2C2C2E] transition-all"
              >
                Report Issue
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
