"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // TODO: Implement Better Auth login
    console.log("Login:", { employeeId, password });
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Features */}
      <div
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--lhb-navy) 0%, #1e3a5f 50%, var(--lhb-navy) 100%)",
        }}
      >
        {/* Background decorations - grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
        {/* Glow orbs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-amber-500/[0.06] blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] rounded-full bg-blue-500/[0.06] blur-3xl"></div>

        <div className="relative z-10">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-lg"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "var(--lhb-navy)",
              }}
            >
              LHB
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">LH Bank</h2>
              <span className="text-amber-400 text-xs uppercase tracking-widest font-medium">
                Ultimate Beneficial Ownership Analysis
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-white text-4xl font-bold mb-2 leading-tight">
            UBO
            <br />
            <span
              className="text-4xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Analysis Platform
            </span>
          </h1>

          <p className="text-white/60 text-sm mb-10 max-w-md leading-relaxed">
            Secure, compliant, and intelligent ownership structure analysis
            for financial institutions and regulatory compliance.
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(37,99,235,0.1)" }}
              >
                <i className="bi bi-shield-check text-blue-400 text-lg"></i>
              </div>
              <span className="text-white/80 text-sm">
                Advanced 6-level ownership hierarchy traversal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <i className="bi bi-activity text-emerald-400 text-lg"></i>
              </div>
              <span className="text-white/80 text-sm">
                Real-time compliance checking (&ge;15% threshold)
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(6,182,212,0.1)" }}
              >
                <i className="bi bi-diagram-3 text-cyan-400 text-lg"></i>
              </div>
              <span className="text-white/80 text-sm">
                Interactive ownership graph visualization
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.1)" }}
              >
                <i className="bi bi-fingerprint text-amber-400 text-lg"></i>
              </div>
              <span className="text-white/80 text-sm">
                Enterprise-grade security with full audit trail
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "var(--lhb-navy)",
              }}
            >
              LHB
            </div>
            <div>
              <h1 className="text-slate-800 text-xl font-bold">
                UBO Analysis System
              </h1>
              <p className="text-amber-500 text-xs uppercase tracking-widest">
                LH Bank &bull; Enterprise
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome back
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            Sign in to access the UBO Analysis System
          </p>

          {error && (
            <div
              className="flex items-center gap-2 p-3 mb-4 rounded-lg text-sm text-red-700"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400">
              Sign in with your credentials
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Employee ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="bi bi-person-badge"></i>
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter your employee ID"
                  value={employeeId}
                  onChange={(e) =>
                    setEmployeeId(
                      e.target.value.replace(/[^A-Za-z0-9]/g, "")
                    )
                  }
                  maxLength={8}
                  pattern="[A-Za-z0-9]+"
                  title="Only English letters and numbers, max 8 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Authorized personnel only. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
