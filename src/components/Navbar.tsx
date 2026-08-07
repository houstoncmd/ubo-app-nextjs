"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/search", label: "Search", icon: "bi-search" },
  { href: "/history", label: "History", icon: "bi-clock-history" },
  { href: "/settings", label: "Settings", icon: "bi-gear" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="lhb-navbar sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 lhb-brand-gradient rounded-lg flex items-center justify-center font-bold text-navy text-lg">
              LHB
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              UBO Application
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                <i className="bi bi-person-fill text-sm"></i>
              </div>
              <span className="text-sm">Admin</span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700 mt-2 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
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
