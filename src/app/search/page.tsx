"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

interface SearchResult {
  id: number;
  registration_id: string;
  company_name: string;
  status: string;
  ubo_count: number;
}

export default function SearchPage() {
  const [registrationId, setRegistrationId] = useState("");
  const [language, setLanguage] = useState("TH");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

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
        // If the result has an ID, redirect to the result page
        if (response.data.id) {
          router.push(`/result/${response.data.id}`);
        } else {
          setResult(response.data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4
            className="mb-1 font-bold"
            style={{ color: "var(--lhb-navy)" }}
          >
            <i className="bi bi-search me-2"></i>UBO Analysis
          </h4>
          <p className="text-slate-500 text-sm mb-0">
            Identify Ultimate Beneficial Owners by company registration ID.
          </p>
        </div>
      </div>

      {/* Hero Search */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{
          background:
            "linear-gradient(135deg, var(--lhb-navy) 0%, #1e3a5f 50%, #0f172a 100%)",
        }}
      >
        <div className="text-white font-semibold text-lg mb-1">
          Company Search
        </div>
        <div className="text-white/50 text-sm mb-4">
          Enter the 13-digit Thai company registration ID to analyze the
          ownership structure.
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-3 mb-4 rounded-lg text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <i className="bi bi-exclamation-triangle text-red-400"></i>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-white/60 text-xs mb-1 block">
                Registration ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                placeholder="13-digit number"
                value={registrationId}
                onChange={(e) =>
                  setRegistrationId(e.target.value.replace(/[^0-9]/g, ""))
                }
                maxLength={13}
                pattern="[0-9]{13}"
                required
              />
              <div className="text-white/30 text-[0.65rem] mt-1">
                13-digit number only
              </div>
            </div>
            <div className="w-[130px]">
              <label className="text-white/60 text-xs mb-1 block">
                Response Language
              </label>
              <select
                className="w-full px-3 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="TH" className="text-slate-800">
                  Thai (TH)
                </option>
                <option value="EN" className="text-slate-800">
                  English (EN)
                </option>
              </select>
              <div className="text-white/30 text-[0.65rem] mt-1">
                Select language
              </div>
            </div>
            <div>
              <label className="text-transparent text-xs mb-1 block select-none">
                &nbsp;
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-1"></i>Search UBO
                  </>
                )}
              </button>
              <div className="text-white/30 text-[0.65rem] mt-1">
                Start analysis
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-5">
          <div
            className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"
          ></div>
          <h5 className="mt-3 font-semibold" style={{ color: "var(--lhb-text)" }}>
            Analyzing Ownership Structure
          </h5>
          <p className="text-slate-500 text-sm">
            Traversing up to 6 levels of corporate hierarchy...
            <br />
            <span className="text-xs">This may take a few seconds for deep structures.</span>
          </p>
        </div>
      )}

      {/* Quick Result (if no redirect happened) */}
      {result && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-slate-800">
                {result.company_name}
              </h5>
              <p className="text-sm text-slate-500">
                Registration: {result.registration_id} &middot; Status: {result.status}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                {result.ubo_count} UBOs
              </span>
              <button
                onClick={() => router.push(`/result/${result.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                <i className="bi bi-eye me-1"></i>View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-4">
        <div className="px-5 py-3 border-b border-slate-200">
          <h5 className="text-sm font-semibold text-slate-700">
            <i className="bi bi-info-circle me-2"></i>How UBO Analysis Works
          </h5>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row gap-6">
            {[
              {
                step: 1,
                label: "Input Registration ID",
                desc: "Enter the 13-digit company registration number",
              },
              {
                step: 2,
                label: "Analyze Ownership",
                desc: "System traverses up to 6 levels of ownership hierarchy",
              },
              {
                step: 3,
                label: "Identify UBOs",
                desc: "Persons with ≥15% effective ownership marked as UBOs",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: "var(--lhb-primary)",
                    color: "white",
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-slate-50 rounded-lg p-4 mt-3 border-0">
        <div className="flex items-start gap-3">
          <i className="bi bi-lightbulb text-amber-500 text-xl flex-shrink-0"></i>
          <div>
            <strong className="text-sm">Pro Tip:</strong>
            <span className="text-sm text-slate-500 ml-1">
              You can search directly from the History page by clicking the
              re-analyze button. Results are cached for faster subsequent
              lookups.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
