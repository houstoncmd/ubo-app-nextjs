"use client";

import { useState } from "react";

export default function HistoryPage() {
  const [filterRegId, setFilterRegId] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

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
        <form className="flex flex-wrap gap-3 items-end">
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
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              UBOs
            </label>
            <select className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-[100px]">
              <option value="">All</option>
              <option value="1">Has UBO</option>
              <option value="0">No UBO</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Date From
            </label>
            <input
              type="date"
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-[150px]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Date To
            </label>
            <input
              type="date"
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-[150px]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              <i className="bi bi-funnel me-1"></i>Filter
            </button>
            <a
              href="/history"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              <i className="bi bi-x-lg me-1"></i>Clear
            </a>
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              <i className="bi bi-file-earmark-excel me-1"></i>Export Excel
            </button>
          </div>
        </form>
      </div>

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
                <th className="px-5 py-3 text-left">Document ID</th>
                <th className="px-5 py-3 text-left">Registration ID</th>
                <th className="px-5 py-3 text-left">Company Name</th>
                <th className="px-5 py-3 text-right">UBOs</th>
                <th className="px-5 py-3 text-left">Result</th>
                <th className="px-5 py-3 text-left">Username</th>
                <th className="px-5 py-3 text-left w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-12 text-center text-slate-400"
                >
                  <i className="bi bi-clock-history text-4xl mb-3 block"></i>
                  <p className="text-sm">No search history yet.</p>
                  <p className="text-xs text-slate-400">
                    Start your first UBO analysis to see results here.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
