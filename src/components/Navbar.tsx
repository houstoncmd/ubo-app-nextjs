"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { logout } from "@/lib/auth";
import { apiFetch } from "@/lib/api-client";

interface UserInfo {
  id?: number;
  name?: string;
  display_name?: string;
  email?: string;
  first_name?: string;
  employee_id?: string;
  title?: string;
  department?: string;
  last_login?: string;
  role?: string;
  role_display?: string;
  is_active?: boolean;
  groups?: string[];
  permissions?: string[];
}

/* ─── helpers ─── */
function hasPermission(user: UserInfo | null, perm: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.permissions?.includes(perm) ?? false;
}

function userInitials(user: UserInfo): string {
  const name = user.first_name || user.display_name || user.name || "U";
  return name.slice(0, 2).toUpperCase();
}

/* ─── component ─── */
export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  /* fetch user on mount */
  useEffect(() => {
    (async () => {
      const res = await apiFetch<{ user?: UserInfo; name?: string; email?: string; role?: string }>(
        "/api/auth/me"
      );
      if (res.data) {
        const u = res.data.user ?? (res.data as UserInfo);
        setUser(u);
      }
    })();
  }, []);

  /* close dropdowns on outside click */
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
      setUserOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

  /* close dropdowns on route change */
  useEffect(() => {
    setUserOpen(false);
    setSettingsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const canShowUBO = user && user.role !== "admin";
  const canShowHistory = user && (user.role === "checker" || user.role === "monitor");
  const canShowSettings = hasPermission(user, "settings") || hasPermission(user, "logs");

  /* settings sub-items (only for roles with settings_edit permission) */
  const settingsItems: { href: string; label: string; perm?: string }[] = [];
  if (hasPermission(user, "user_management")) {
    settingsItems.push({ href: "/settings", label: "User Access Management" });
  }
  if (hasPermission(user, "environment_settings")) {
    settingsItems.push({ href: "/settings/environment", label: "Environment Settings" });
  }
  if (hasPermission(user, "system_logs")) {
    settingsItems.push({ href: "/settings/system-logs", label: "System Logs" });
  }
  if (hasPermission(user, "settings_edit")) {
    settingsItems.push({ href: "/settings/api", label: "API Configuration" });
    settingsItems.push({ href: "/settings/auth", label: "Authentication" });
  }
  if (hasPermission(user, "settings") && hasPermission(user, "logs")) {
    settingsItems.push({ href: "", label: "---divider---", perm: "" });
  }
  if (hasPermission(user, "logs")) {
    settingsItems.push({ href: "/settings/logs", label: "Activity Logs" });
  }
  if (hasPermission(user, "log_settings")) {
    settingsItems.push({ href: "", label: "---divider---", perm: "" });
    settingsItems.push({ href: "/settings/log-settings", label: "Log Settings" });
  }

  /* role badge color */
  function roleBadgeColor(role?: string): string {
    switch (role) {
      case "admin":
        return "bg-red-500/90";
      case "maker":
        return "bg-blue-500/90";
      case "checker":
        return "bg-emerald-500/90";
      case "monitor":
        return "bg-amber-500/90";
      default:
        return "bg-slate-500/90";
    }
  }

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ background: "var(--lhb-navy)" }}>
      <div className="container-fluid px-4">
        <div className="flex items-center justify-between h-[57px]">
          {/* ── Brand ── */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 border-r border-white/8 pr-4 py-3 shrink-0"
          >
            <div className="lhb-brand-logo">LHB</div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-[0.95rem] tracking-wide">
                UBO Analysis System
              </span>
              <span className="text-amber-400 text-[0.65rem] uppercase tracking-widest font-medium">
                LH Bank &bull; Enterprise
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-0">
            {/* Dashboard – always */}
            <NavLink href="/dashboard" icon="bi-grid-1x2-fill" label="Dashboard" active={pathname === "/dashboard"} />

            {/* UBO Analysis – non-admin */}
            {canShowUBO && (
              <NavLink href="/search" icon="bi-search" label="UBO Analysis" active={pathname === "/search"} />
            )}

            {/* History – checker/monitor */}
            {canShowHistory && (
              <NavLink href="/history" icon="bi-clock-history" label="History" active={pathname === "/history"} />
            )}

            {/* Settings dropdown */}
            {canShowSettings && (
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`flex items-center gap-2 px-4 py-[0.85rem] text-[0.82rem] font-medium transition-colors border-b-2 cursor-pointer ${
                    pathname.startsWith("/settings")
                      ? "text-amber-400 border-amber-500 bg-white/[0.04]"
                      : "text-white/75 border-transparent hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <i className="bi bi-gear text-base" />
                  Settings
                  <i className={`bi bi-chevron-down text-xs transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
                </button>

                {settingsOpen && (
                  <div className="lhb-dropdown-menu absolute left-0 top-full mt-0 w-64 shadow-xl border border-slate-200 bg-white rounded-lg py-1 z-50">
                    {settingsItems.map((item, i) =>
                      item.label === "---divider---" ? (
                        <div key={i} className="my-1 border-t border-slate-200" />
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSettingsOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Online status – desktop */}
            <div className="hidden lg:flex items-center">
              <span className="status-dot online" title="System Online" />
            </div>

            {/* User dropdown */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="lhb-user-avatar">{userInitials(user)}</div>
                  <span className="hidden lg:inline text-white text-[0.82rem] font-medium">
                    {user.display_name || user.name || "User"}
                  </span>
                  <i className={`bi bi-chevron-down text-xs text-white/50 transition-transform hidden lg:inline ${userOpen ? "rotate-180" : ""}`} />
                </button>

                {userOpen && (
                  <div className="lhb-dropdown-menu lhb-user-profile-menu absolute right-0 top-full mt-1 w-80 shadow-xl border border-slate-200 bg-white rounded-lg z-50">
                    {/* Profile header */}
                    <div className="px-4 py-3">
                      <div className="font-semibold text-slate-800 text-sm">
                        {user.display_name || user.name || "User"}
                      </div>
                      {user.employee_id && (
                        <div className="text-xs text-slate-500 mt-0.5">{user.employee_id}</div>
                      )}
                      {user.email && (
                        <div className="text-xs text-slate-500 mt-1">
                          <i className="bi bi-envelope me-1" />{user.email}
                        </div>
                      )}
                      {user.title && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          <i className="bi bi-briefcase me-1" />{user.title}
                        </div>
                      )}
                      {user.department && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          <i className="bi bi-building me-1" />{user.department}
                        </div>
                      )}
                      {user.last_login && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          <i className="bi bi-clock me-1" />Last login: {user.last_login}
                        </div>
                      )}
                      {user.role && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-medium text-white ${roleBadgeColor(user.role)}`}>
                            <i className="bi bi-shield" />
                            {user.role_display || user.role}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Groups */}
                    {user.groups && user.groups.length > 0 && (
                      <div className="px-4 pb-2">
                        <div className="text-xs text-slate-500 mb-1">Groups:</div>
                        <div className="flex flex-wrap gap-1">
                          {user.groups.slice(0, 5).map((g) => (
                            <span key={g} className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[0.6rem]">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-200 my-1" />

                    {/* Settings link */}
                    {hasPermission(user, "settings") && (
                      <>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <i className="bi bi-gear" /> Settings
                        </Link>
                        <div className="border-t border-slate-200 my-1" />
                      </>
                    )}

                    {/* Logout */}
                    <button
                      onClick={async () => {
                        await logout();
                        window.location.href = "/login";
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <i className="bi bi-box-arrow-right" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-white/75 hover:text-white text-[0.82rem] font-medium px-3 py-2">
                <i className="bi bi-box-arrow-in-right" /> Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/80 hover:text-white border-0"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-2xl`} />
            </button>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-1 pt-2 space-y-1">
            <MobileNavLink href="/dashboard" icon="bi-grid-1x2-fill" label="Dashboard" active={pathname === "/dashboard"} />
            {canShowUBO && (
              <MobileNavLink href="/search" icon="bi-search" label="UBO Analysis" active={pathname === "/search"} />
            )}
            {canShowHistory && (
              <MobileNavLink href="/history" icon="bi-clock-history" label="History" active={pathname === "/history"} />
            )}
            {canShowSettings && (
              <>
                <button
                  onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith("/settings")
                      ? "text-amber-400 bg-white/5"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <i className="bi bi-gear" /> Settings
                  <i className={`bi bi-chevron-down text-xs ml-auto transition-transform ${mobileSettingsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileSettingsOpen && (
                  <div className="ml-6 space-y-1 mb-2">
                    {settingsItems.map((item, i) =>
                      item.label === "---divider---" ? (
                        <div key={i} className="border-t border-white/10 my-1" />
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ─── Sub-components ─── */

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-[0.85rem] text-[0.82rem] font-medium transition-colors border-b-2 ${
        active
          ? "text-amber-400 border-amber-500 bg-white/[0.04]"
          : "text-white/75 border-transparent hover:text-white hover:bg-white/[0.06]"
      }`}
    >
      <i className={`bi ${icon} text-base`} />
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "text-amber-400 bg-white/5"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <i className={`bi ${icon}`} />
      {label}
    </Link>
  );
}
