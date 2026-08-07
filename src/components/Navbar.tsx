"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
  { href: "/search", label: "UBO Analysis", icon: "bi-search" },
  { href: "/history", label: "History", icon: "bi-clock-history" },
  { href: "/settings", label: "Settings", icon: "bi-gear" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 shadow-lg"
      style={{ background: "var(--lhb-navy)" }}
    >
      <div className="container-fluid px-4">
        <div className="flex items-center justify-between h-[57px]">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 border-r border-white/8 pr-4 py-3"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "var(--lhb-navy)",
                letterSpacing: "-0.5px",
              }}
            >
              LHB
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-[0.95rem] tracking-wide">
                UBO Analysis System
              </span>
              <span className="text-amber-400 text-[0.65rem] uppercase tracking-widest font-medium">
                LH Bank &bull; Enterprise
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-[0.85rem] text-[0.82rem] font-medium transition-colors border-b-2 ${
                  pathname === item.href
                    ? "text-amber-400 border-amber-500 bg-white/[0.04]"
                    : "text-white/75 border-transparent hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <i className={`bi ${item.icon} text-base`}></i>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side: status dot + user menu */}
          <div className="flex items-center gap-3">
            {/* Online status dot */}
            <div className="hidden lg:flex items-center">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: "#10b981",
                  boxShadow: "0 0 6px rgba(16,185,129,0.5)",
                }}
                title="System Online"
              ></span>
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--lhb-primary), var(--lhb-primary-dark, #1d4ed8))",
                }}
              >
                AD
              </div>
              <span className="hidden lg:inline text-white text-[0.82rem] font-medium">
                Admin
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/80 hover:text-white border-0"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i
                className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-2xl`}
              ></i>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-1 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-amber-400 bg-white/5"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
