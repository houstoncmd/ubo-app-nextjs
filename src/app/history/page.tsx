"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const mockHistory = [
  { id: 1, registrationId: "0105546000123", companyName: "SCG Chemicals Co., Ltd.", ubosCount: 3, status: "completed", username: "somchai.p", date: "2024-01-15 14:30" },
  { id: 2, registrationId: "0105546000456", companyName: "Thai Oil Public Co., Ltd.", ubosCount: 5, status: "completed", username: "nattaya.k", date: "2024-01-15 13:45" },
  { id: 3, registrationId: "0105546000789", companyName: "Bangkok Bank Public Co., Ltd.", ubosCount: 0, status: "error", username: "prasert.m", date: "2024-01-15 12:20" },
  { id: 4, registrationId: "0105546000321", companyName: "PTT Public Co., Ltd.", ubosCount: 7, status: "completed", username: "wichai.t", date: "2024-01-15 11:10" },
  { id: 5, registrationId: "0105546000654", companyName: "Kasikornbank Public Co., Ltd.", ubosCount: 2, status: "completed", username: "kannika.s", date: "2024-01-15 10:05" },
  { id: 6, registrationId: "0105546000987", companyName: "CP All Public Co., Ltd.", ubosCount: 4, status: "completed", username: "somchai.p", date: "2024-01-14 16:30" },
  { id: 7, registrationId: "0105546000111", companyName: "Advanced Info Service Public Co.", ubosCount: 1, status: "completed", username: "nattaya.k", date: "2024-01-14 15:20" },
  { id: 8, registrationId: "0105546000222", companyName: "Gulf Energy Development Public Co.", ubosCount: 6, status: "completed", username: "prasert.m", date: "2024-01-14 14:15" },
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch =
      item.registrationId.includes(searchQuery) ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-lhb-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Search History"
          subtitle="Browse and filter past UBO search results"
          breadcrumbs={[{ label: "History" }]}
          actions={
            <button className="lhb-btn-secondary flex items-center gap-2">
              <i className="bi bi-download"></i>
              Export CSV
            </button>
          }
        />

        {/* Filters */}
        <div className="lhb-card mb-6">
          <div className="lhb-card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="lhb-label">Search</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="bi bi-search text-sm"></i>
                  </span>
                  <input
                    type="text"
                    className="lhb-input pl-10"
                    placeholder="Registration ID or company name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="lhb-label">Status</label>
                <select
                  className="lhb-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="error">Error</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="lhb-label">Date From</label>
                <input
                  type="date"
                  className="lhb-input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="lhb-label">Date To</label>
                <input
                  type="date"
                  className="lhb-input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="lhb-card">
          <div className="lhb-card-header flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              Results ({filteredHistory.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="lhb-table">
              <thead>
                <tr>
                  <th>Registration ID</th>
                  <th>Company Name</th>
                  <th>UBOs</th>
                  <th>Status</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {item.registrationId}
                      </code>
                    </td>
                    <td className="font-medium text-slate-800 max-w-xs truncate">
                      {item.companyName}
                    </td>
                    <td>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-semibold">
                        {item.ubosCount}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`lhb-badge-${
                          item.status === "completed" ? "success" : "danger"
                        }`}
                      >
                        {item.status === "completed" ? (
                          <>
                            <i className="bi bi-check-circle mr-1"></i>
                            Completed
                          </>
                        ) : (
                          <>
                            <i className="bi bi-x-circle mr-1"></i>
                            Error
                          </>
                        )}
                      </span>
                    </td>
                    <td className="text-slate-500">{item.username}</td>
                    <td className="text-slate-500 text-sm">{item.date}</td>
                    <td>
                      {item.status === "completed" ? (
                        <Link
                          href={`/result/${item.registrationId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View <i className="bi bi-arrow-right ml-1"></i>
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredHistory.length === 0 && (
            <div className="lhb-card-body text-center py-12">
              <i className="bi bi-inbox text-4xl text-slate-300 mb-3"></i>
              <p className="text-slate-500">No results found matching your filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
