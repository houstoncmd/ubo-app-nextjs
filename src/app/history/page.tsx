"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

interface HistoryItem {
  id: number;
  registration_id: string;
  company_name: string;
  user_name: string;
  created_at: string;
  ubo_count: number;
  status: string;
}

export default function HistoryPage() {
  const [filterRegId, setFilterRegId] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ items?: HistoryItem[] } | HistoryItem[]>("/api/history");

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as { items: HistoryItem[] }).items;
        if (items) setHistoryItems(items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Client-side filtering
  const filteredItems = historyItems.filter((item) => {
    const matchRegId = !filterRegId || item.registration_id.includes(filterRegId);
    const matchCompany = !filterCompany || (item.company_name || "").toLowerCase().includes(filterCompany.toLowerCase());
    return matchRegId && matchCompany;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4
            className="mb-1 font-bold"
            style={{ color: "var(--lhb-navy)" }}
          >
            <i className="bi bi-clock-history me-2"></i>Search History
          </h4>
          <p className="text-slate-500 text-sm mb-0">
            View and manage all previous UBO analysis searches.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-3"
      >
        <form
          className="flex flex-wrap gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            // Filtering is client-side, no additional fetch needed
          }}
        >
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Registration ID
            </label>
            <input
              type="text"
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-[180px]"
              value={filterRegId}
              onChange={(e) => setFilterRegId(e.target.value)}
              placeholder="Filter..."
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Company Name
            </label>
            <input
              type="text"
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-[200px]"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              placeholder="Filter..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilterRegId("");
                setFilterCompany("");
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              <i className="bi bi-x-lg me-1"></i>Clear
            </button>
            <button
              type="button"
              onClick={() => fetchHistory()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>Refresh
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 mb-3 rounded-lg text-sm text-red-700"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-xs text-slate-500 uppercase border-b border-slate-200"
                style={{ background: "#f8fafc" }}
              >
                <th className="px-5 py-3 text-left w-[50px]">#</th>
                <th className="px-5 py-3 text-left">Date/Time</th>
                <th className="px-5 py-3 text-left">Registration ID</th>
                <th className="px-5 py-3 text-left">Company Name</th>
                <th className="px-5 py-3 text-right">UBOs</th>
                <th className="px-5 py-3 text-left">Result</th>
                <th className="px-5 py-3 text-left">Username</th>
                <th className="px-5 py-3 text-left w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-8"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-28"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-40"></div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-8 ml-auto"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-5 bg-slate-200 rounded-full animate-pulse w-16"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-12"></div>
                    </td>
                  </tr>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                        {item.registration_id}
                      </code>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {item.company_name || "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.ubo_count}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {item.user_name}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => router.push(`/result/${item.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="View result"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    <i className="bi bi-clock-history text-4xl mb-3 block"></i>
                    <p className="text-sm">No search history found.</p>
                    <p className="text-xs text-slate-400">
                      {filterRegId || filterCompany
                        ? "Try adjusting your filters."
                        : "Start your first UBO analysis to see results here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
