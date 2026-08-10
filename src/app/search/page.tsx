"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

interface SearchResult {
  id: number;
  registration_id: string;
  company_name: string;
  status: string;
  ubo_count: number;
}

const statusMessages = [
  "Fetching company data from registry...",
  "Analyzing direct shareholders...",
  "Traversing corporate ownership chains...",
  "Calculating effective ownership percentages...",
  "Identifying Ultimate Beneficial Owners...",
  "Generating ownership graph...",
];

export default function SearchPage() {
  const [registrationId, setRegistrationId] = useState("");
  const [language, setLanguage] = useState("TH");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      intervalRef.current = setInterval(() => {
        setStatusIdx((prev) => (prev + 1) % statusMessages.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);
    setStatusIdx(0);

    try {
      const response = await apiFetch<SearchResult>("/api/ubo/search", {
        method: "POST",
        body: JSON.stringify({
          registration_id: registrationId,
          language: language,
        }),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        if (response.data.id) {
          router.push(`/result/${response.data.id}`);
        } else {
          setResult(response.data);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationId(e.target.value.replace(/[^0-9]/g, ""));
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1 fw-bold" style={{ color: "var(--lhb-navy)" }}>
            <i className="bi bi-search me-2"></i>UBO Analysis
          </h4>
          <p className="text-muted mb-0 small">
            Identify Ultimate Beneficial Owners by company registration ID.
          </p>
        </div>
      </div>

      {/* Hero Search */}
      <div className="hero-search">
        <div className="search-title">Company Search</div>
        <div className="search-subtitle">
          Enter the 13-digit Thai company registration ID to analyze the
          ownership structure.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-2 align-items-end">
            <div style={{ flex: "1 1 200px", minWidth: 180 }}>
              <label
                className="form-label"
                style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}
              >
                Registration ID
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                id="registration_id"
                value={registrationId}
                onChange={handleInputChange}
                maxLength={13}
                required
                autoFocus
              />
              <div
                className="form-text mt-1"
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}
              >
                13-digit number only
              </div>
            </div>
            <div className="col-auto ms-auto">
              <label
                className="form-label"
                style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}
              >
                Response Language
              </label>
              <select
                className="form-select form-select-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ minWidth: 130, height: 49.6 }}
              >
                <option value="TH">Thai (TH)</option>
                <option value="EN">English (EN)</option>
              </select>
              <div
                className="form-text mt-1"
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}
              >
                Select language
              </div>
            </div>
            <div className="col-auto">
              <label
                className="form-label"
                style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}
              >
                &nbsp;
              </label>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                id="searchBtn"
                disabled={isLoading}
                style={{ height: 49.6, lineHeight: 1 }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-1"></i>Search UBO
                  </>
                )}
              </button>
              <div
                className="form-text mt-1"
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}
              >
                Start analysis
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="alert alert-danger mt-3"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3" style={{ color: "var(--lhb-text)" }}>
            Analyzing Ownership Structure
          </h5>
          <p className="text-muted small">
            Traversing up to 6 levels of corporate hierarchy...
            <br />
            <span id="loadingStatus">{statusMessages[statusIdx]}</span>
          </p>
          <div
            className="progress-enterprise mx-auto"
            style={{ maxWidth: 300 }}
          >
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
              role="progressbar"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Result (if no redirect happened) */}
      {result && !isLoading && (
        <div className="card mt-3">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="font-semibold" style={{ color: "var(--lhb-text)" }}>
                  {result.company_name}
                </h5>
                <p className="small text-muted mb-0">
                  Registration: {result.registration_id} &middot; Status:{" "}
                  {result.status}
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="badge badge-compliant">
                  {result.ubo_count} UBOs
                </span>
                <button
                  onClick={() => router.push(`/result/${result.id}`)}
                  className="btn btn-sm btn-primary"
                >
                  <i className="bi bi-eye me-1"></i>View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="card mt-4">
        <div className="card-header">
          <h5>
            <i className="bi bi-info-circle me-2"></i>How UBO Analysis Works
          </h5>
        </div>
        <div className="card-body">
          <div className="steps-container">
            <div className="step-item active">
              <div className="step-circle">1</div>
              <div className="step-label">Input Registration ID</div>
              <div className="step-desc">
                Enter the 13-digit company registration number
              </div>
            </div>
            <div className="step-item">
              <div className="step-circle">2</div>
              <div className="step-label">Analyze Ownership</div>
              <div className="step-desc">
                System traverses up to 6 levels of ownership hierarchy
              </div>
            </div>
            <div className="step-item">
              <div className="step-circle">3</div>
              <div className="step-label">Identify UBOs</div>
              <div className="step-desc">
                Persons with ≥15% effective ownership marked as UBOs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="card mt-3 bg-light border-0">
        <div className="card-body">
          <div className="d-flex align-items-start gap-3">
            <i className="bi bi-lightbulb text-warning fs-4 flex-shrink-0"></i>
            <div>
              <strong className="small">Pro Tip:</strong>
              <span className="small text-muted">
                {" "}
                You can search directly from the History page by clicking the
                re-analyze button. Results are cached for faster subsequent
                lookups.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
