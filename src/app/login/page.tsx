"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Strip leading "p" from Employee ID before submit
    // Users habitually type e.g. "p6073", but AD accounts are the digits only ("6073")
    let submitId = employeeId.trim();
    if (/^[pP]\d+$/.test(submitId)) {
      submitId = submitId.slice(1); // p6073 -> 6073
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: submitId,
          password: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.detail || data.error || `Login failed (${response.status})`
        );
      }

      // Login successful - the session_id cookie has been set by the backend
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">
        {/* Left Panel — Branding & Features */}
        <div className="login-left">
          <div className="grid-lines"></div>
          <div className="glow-orb glow-1"></div>
          <div className="glow-orb glow-2"></div>

          <div className="content">
            <div className="brand">
              <div className="brand-logo">LHB</div>
              <div className="brand-text">
                <h2>LH Bank</h2>
                <span>Ultimate Beneficial Ownership Analysis</span>
              </div>
            </div>

            <h1>
              UBO
              <br />
              <span className="text-gradient">Analysis Platform</span>
            </h1>

            <p className="lead">
              Secure, compliant, and intelligent ownership structure analysis
              for financial institutions and regulatory compliance.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-shield-check"></i>
                </div>
                <span>
                  Advanced 6-level ownership hierarchy traversal
                </span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-activity"></i>
                </div>
                <span>
                  Real-time compliance checking (&ge;15% threshold)
                </span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-diagram-3"></i>
                </div>
                <span>
                  Interactive ownership graph visualization
                </span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="bi bi-fingerprint"></i>
                </div>
                <span>
                  Enterprise-grade security with full audit trail
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="login-right">
          <div className="login-right-inner">
            <div className="form-wrapper">
              <div className="form-header">
                <h2>Welcome back</h2>
                <p>Sign in to access the UBO Analysis System</p>
              </div>

              {error && (
                <div
                  className="alert alert-enterprise alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

              <div className="divider">
                <span>Sign in with your credentials</span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="employee_id" className="form-label">
                    Employee ID
                  </label>
                  <div className="input-group premium-input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="employee_id"
                      autoComplete="off"
                      pattern="[A-Za-z0-9]+"
                      maxLength={8}
                      title="Only English letters and numbers, max 8 characters"
                      placeholder="Enter your employee ID"
                      value={employeeId}
                      onChange={(e) =>
                        setEmployeeId(
                          e.target.value.replace(/[^A-Za-z0-9]/g, "")
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group premium-input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control form-control-lg"
                      id="password"
                      autoComplete="off"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary border"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        borderRadius:
                          "0 var(--lhb-radius-sm) var(--lhb-radius-sm) 0",
                        padding: "0.375rem 0.75rem",
                      }}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                        id="togglePasswordIcon"
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check custom-checkbox d-none">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      name="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="#"
                    className="forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotModal(true);
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn btn-premium-submit w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin"></i>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>

              <p className="text-muted text-center small mt-5 terms-text">
                By signing in, you agree to our <br />
                <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Premium Footer */}
          <div className="login-footer-premium">
            <div className="login-footer-line"></div>
            <div className="login-footer-text">
              <i className="bi bi-pencil-ruler"></i>
              <span>
                Designed by{" "}
                <strong>Digital and Automation Department</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          aria-labelledby="forgotPasswordModalLabel"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgotModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0"
              style={{ borderRadius: "1rem", overflow: "hidden" }}
            >
              <div
                className="modal-header border-0"
                style={{
                  background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
                  padding: "1.5rem 1.5rem 1rem",
                }}
              >
                <div className="text-center w-100">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "rgba(245,158,11,0.15)",
                    }}
                  >
                    <i className="bi bi-lock text-warning fs-3"></i>
                  </div>
                  <h5
                    className="modal-title text-white fw-bold"
                    id="forgotPasswordModalLabel"
                  >
                    Forgot Password?
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 mt-3 me-3"
                  onClick={() => setShowForgotModal(false)}
                ></button>
              </div>
              <div
                className="modal-body text-center p-4"
                style={{ background: "#fff" }}
              >
                <div className="mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(37,99,235,0.08)",
                    }}
                  >
                    <i
                      className="bi bi-info-circle fs-4"
                      style={{ color: "var(--lhb-primary)" }}
                    ></i>
                  </div>
                  <p
                    className="mb-1 fw-semibold"
                    style={{ color: "var(--lhb-text)", fontSize: "1rem" }}
                  >
                    Unable to access your account?
                  </p>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.88rem", lineHeight: 1.6 }}
                  >
                    If you have forgotten your password or are unable to sign
                    in, please contact your system administrator or the{" "}
                    <strong>IT Support Team</strong> for assistance.
                  </p>
                </div>

                <hr style={{ opacity: 0.5 }} />

                <div
                  className="text-start"
                  style={{ fontSize: "0.85rem", color: "#475569" }}
                >
                  <p
                    className="fw-semibold mb-2"
                    style={{ color: "var(--lhb-text)" }}
                  >
                    <i className="bi bi-headset me-1"></i> Contact
                    Information:
                  </p>
                  <div className="d-flex align-items-center gap-2 mb-1 ps-3">
                    <i
                      className="bi bi-envelope"
                      style={{ color: "var(--lhb-primary)" }}
                    ></i>
                    <span>it-support@lhbank.co.th</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-1 ps-3">
                    <i
                      className="bi bi-telephone"
                      style={{ color: "var(--lhb-primary)" }}
                    ></i>
                    <span>+66 (0) 2123-4567</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 ps-3">
                    <i
                      className="bi bi-building"
                      style={{ color: "var(--lhb-primary)" }}
                    ></i>
                    <span>Digital and Automation Department</span>
                  </div>
                </div>
              </div>
              <div
                className="modal-footer border-0 justify-content-center pb-4"
                style={{ background: "#fff" }}
              >
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => setShowForgotModal(false)}
                  style={{ borderRadius: "0.5rem" }}
                >
                  <i className="bi bi-check2 me-1"></i> Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
