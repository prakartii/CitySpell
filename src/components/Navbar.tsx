"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Ward Map" },
  { href: "/report", label: "Report Issue" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <Link
              href="/login"
              className="text-sm font-medium text-[#5A5A62] hover:text-[#1A1A1C] px-3.5 py-1.5 rounded-xl hover:bg-[#F5F4F1] transition-all"
            >
              Login
            </Link>
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
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#5A5A62] hover:bg-[#F5F4F1] transition-all"
              >
                Login
              </Link>
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
