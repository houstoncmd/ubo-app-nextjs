"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

interface HistoryItem {
  id: number;
  document_id: string;
  registration_id: string;
  company_name: string;
  employee_id: string;
  searched_at: string;
  ubo_count: number;
  result_status: string;
}

interface ReportData {
  error?: string;
  result?: {
    final_ubos?: Array<{
      name: string;
      total_pct: number;
      compliance_status: string;
    }>;
    authorized_signatories?: Array<{
      name: string;
      position: string;
    }>;
    compliance_status?: string;
    company_type?: string;
    capital?: string;
    shareholder_count?: number;
  };
  registration_id?: string;
  document_id?: string;
  company_name?: string;
  searched_at?: string;
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [filterRegId, setFilterRegId] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterUbo, setFilterUbo] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [usernameList, setUsernameList] = useState<string[]>([]);

  // Report modal state
  const [showModal, setShowModal] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filterRegId) params.set("registration_id", filterRegId);
      if (filterCompany) params.set("company_name", filterCompany);
      if (filterUbo) params.set("ubo_filter", filterUbo);
      if (filterResult) params.set("result_filter", filterResult);
      if (filterUsername) params.set("username_filter", filterUsername);
      if (filterDateFrom) params.set("date_from", filterDateFrom);
      if (filterDateTo) params.set("date_to", filterDateTo);

      const queryString = params.toString();
      const url = `/api/history${queryString ? `?${queryString}` : ""}`;
      const response = await apiFetch<HistoryItem[] | { items: HistoryItem[] }>(url);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as { items: HistoryItem[] }).items;
        if (items) {
          setHistoryItems(items);
          // Extract unique usernames for filter dropdown
          const usernames = Array.from(new Set(items.map((item) => item.employee_id).filter(Boolean)));
          setUsernameList(usernames);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  }, [filterRegId, filterCompany, filterUbo, filterResult, filterUsername, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleClear = () => {
    setFilterRegId("");
    setFilterCompany("");
    setFilterUbo("");
    setFilterResult("");
    setFilterUsername("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (filterRegId) params.set("registration_id", filterRegId);
    if (filterCompany) params.set("company_name", filterCompany);
    if (filterUbo) params.set("ubo_filter", filterUbo);
    if (filterResult) params.set("result_filter", filterResult);
    if (filterUsername) params.set("username_filter", filterUsername);
    if (filterDateFrom) params.set("date_from", filterDateFrom);
    if (filterDateTo) params.set("date_to", filterDateTo);

    const queryString = params.toString();
    const url = `/api/history/export-excel${queryString ? `?${queryString}` : ""}`;
    window.open(url, "_blank");
  };

  const viewReport = async (id: number) => {
    setCurrentReportId(id);
    setReportLoading(true);
    setReportData(null);
    setShowModal(true);

    try {
      const response = await apiFetch<ReportData>(`/api/history/${id}/report`);
      if (response.error) {
        setReportData({ error: response.error });
      } else if (response.data) {
        setReportData(response.data);
      }
    } catch {
      setReportData({ error: "Failed to load report." });
    } finally {
      setReportLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentReportId(null);
    setReportData(null);
  };

  const handlePreviewPDF = () => {
    if (currentReportId) {
      window.open(`/api/history/${currentReportId}/preview`, "_blank");
    }
  };

  const handleExportPDF = () => {
    if (currentReportId) {
      window.open(`/api/history/${currentReportId}/pdf`, "_blank");
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  const renderReportContent = () => {
    if (reportLoading) {
      return (
        <div className="p-3 text-center py-4 text-muted">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 small">Loading report data...</p>
        </div>
      );
    }

    if (!reportData) return null;

    if (reportData.error) {
      return (
        <div className="p-3">
          <div className="alert alert-danger">{reportData.error}</div>
        </div>
      );
    }

    const result = reportData.result || {};
    const ubos = result.final_ubos || [];
    const signatories = result.authorized_signatories || [];
    const compliance = result.compliance_status || "UNKNOWN";
    const complianceColor = compliance === "COMPLIANT" ? "#16a34a" : "#dc2626";
    const companyType = result.company_type || "\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 \u0e08\u0e33\u0e01\u0e31\u0e14";
    const capital = result.capital || "-";
    const shareholderCount = result.shareholder_count || 0;
    const searchedAt = reportData.searched_at || "";

    return (
      <div className="p-3">
        {/* Section 1: Company Info */}
        <div
          className="mb-3 p-3"
          style={{
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e19\u0e34\u0e15\u0e34\u0e1a\u0e38\u0e04\u0e04\u0e25"}
              </div>
              <div className="fw-bold">{reportData.registration_id || "-"}</div>
            </div>
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e23\u0e36\u0e01\u0e1c\u0e39\u0e49\u0e40\u0e23\u0e34\u0e48\u0e21"} (Document ID)
              </div>
              <div
                className="fw-bold"
                style={{ color: "var(--lhb-primary)" }}
              >
                {reportData.document_id || "-"}
              </div>
            </div>
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e0a\u0e37\u0e48\u0e2d\u0e19\u0e34\u0e15\u0e34\u0e1a\u0e38\u0e04\u0e04\u0e25"}
              </div>
              <div className="fw-bold">{reportData.company_name || "-"}</div>
            </div>
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e27\u0e31\u0e19\u0e40\u0e27\u0e25\u0e32\u0e17\u0e35\u0e48\u0e04\u0e49\u0e19\u0e2b\u0e32"}
              </div>
              <div>{searchedAt}</div>
            </div>
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e17\u0e38\u0e19\u0e08\u0e14\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19"}
              </div>
              <div className="fw-bold">{capital}</div>
            </div>
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e23\u0e39\u0e1b\u0e41\u0e1a\u0e1a\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17"}
              </div>
              <div className="fw-bold">{companyType}</div>
            </div>
            <div className="col-md-6">
              <div
                className="text-muted small"
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {"\u0e08\u0e33\u0e19\u0e27\u0e19\u0e1c\u0e39\u0e49\u0e16\u0e37\u0e2d\u0e2b\u0e38\u0e49\u0e19"}
              </div>
              <div className="fw-bold">
                {shareholderCount} {"\u0e23\u0e32\u0e22"}
              </div>
            </div>
          </div>

          {/* Authorized Signatories */}
          {signatories && signatories.length > 0 && (
            <>
              <hr className="my-2" />
              <div>
                <strong>
                  {"\u0e1c\u0e39\u0e49\u0e21\u0e35\u0e2d\u0e33\u0e19\u0e32\u0e08\u0e25\u0e07\u0e19\u0e32\u0e21:"}
                </strong>
              </div>
              {signatories.map((s, i) => (
                <div key={i} className="small ms-2">
                  - {s.name || ""} ({s.position || ""})
                </div>
              ))}
            </>
          )}
        </div>

        {/* Section 2: UBO Results */}
        <h6 className="fw-semibold mb-2">
          <i className="bi bi-person-check me-1"></i>{" "}
          {"\u0e1c\u0e25\u0e01\u0e32\u0e23\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a UBO"}
        </h6>
        {ubos.length > 0 ? (
          <>
            <div className="alert alert-success py-2 small">
              {"\u0e1e\u0e1a UBO \u0e08\u0e33\u0e19\u0e27\u0e19"}{" "}
              {ubos.length} {"\u0e23\u0e32\u0e22"}
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>{"\u0e0a\u0e37\u0e48\u0e2d"}</th>
                    <th>
                      {"\u0e2a\u0e31\u0e14\u0e2a\u0e48\u0e27\u0e19\u0e16\u0e37\u0e2d\u0e2b\u0e38\u0e49\u0e19"}
                    </th>
                    <th>{"\u0e2a\u0e16\u0e32\u0e19\u0e30"}</th>
                  </tr>
                </thead>
                <tbody>
                  {ubos.map((u, i) => {
                    const pct = u.total_pct || 0;
                    const statusColor =
                      u.compliance_status === "review_required"
                        ? "#d97706"
                        : "#16a34a";
                    return (
                      <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td className="fw-semibold">{u.name || "-"}</td>
                        <td
                          className="text-end fw-bold"
                          style={{ color: "var(--lhb-primary)" }}
                        >
                          {pct.toFixed(4)}%
                        </td>
                        <td>
                          <span style={{ color: statusColor }}>
                            {u.compliance_status === "review_required"
                              ? "Review Required"
                              : "Compliant"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="alert alert-info py-2 small">
            {"\u0e44\u0e21\u0e48\u0e1e\u0e1a \u0e40\u0e08\u0e49\u0e32\u0e02\u0e2d\u0e07\u0e1c\u0e25\u0e1b\u0e23\u0e30\u0e40\u0e22\u0e0a\u0e19\u0e4c\u0e17\u0e35\u0e48\u0e41\u0e17\u0e49\u0e08\u0e23\u0e34\u0e07 \u0e17\u0e35\u0e48\u0e23\u0e31\u0e1a\u0e1c\u0e25\u0e1b\u0e23\u0e30\u0e40\u0e22\u0e0a\u0e19\u0e4c \u0e40\u0e17\u0e48\u0e32\u0e01\u0e31\u0e1a\u0e2b\u0e23\u0e37\u0e2d\u0e21\u0e32\u0e01\u0e01\u0e27\u0e48\u0e32 15%"}
          </div>
        )}

        {/* Compliance Status */}
        <hr className="my-2" />
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Compliance Status: </strong>
            <span
              className="badge"
              style={{
                background: complianceColor,
                color: "#fff",
                padding: "4px 8px",
              }}
            >
              {compliance}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1 fw-bold" style={{ color: "var(--lhb-navy)" }}>
            <i className="bi bi-clock-history me-2"></i>Search History
          </h4>
          <p className="text-muted mb-0 small">
            View and manage all previous UBO analysis searches.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar mb-3">
        <form onSubmit={handleFilter}>
          <div className="row g-2 align-items-end">
            <div className="col-auto">
              <div className="filter-label">Registration ID</div>
              <input
                type="text"
                className="form-control form-control-sm"
                value={filterRegId}
                onChange={(e) => setFilterRegId(e.target.value)}
                autoComplete="off"
                style={{ width: 180 }}
              />
            </div>
            <div className="col-auto">
              <div className="filter-label">Company Name</div>
              <input
                type="text"
                className="form-control form-control-sm"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                autoComplete="off"
                style={{ width: 200 }}
              />
            </div>
            <div className="col-auto">
              <div className="filter-label">UBOs</div>
              <select
                className="form-select form-select-sm"
                value={filterUbo}
                onChange={(e) => setFilterUbo(e.target.value)}
                style={{ width: 100 }}
              >
                <option value="">All</option>
                <option value="1">Has UBO</option>
                <option value="0">No UBO</option>
              </select>
            </div>
            <div className="col-auto">
              <div className="filter-label">Result</div>
              <select
                className="form-select form-select-sm"
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                style={{ width: 120 }}
              >
                <option value="">All</option>
                <option value="ubo_found">UBO Found</option>
                <option value="no_ubo">No UBO</option>
              </select>
            </div>
            <div className="col-auto">
              <div className="filter-label">Username</div>
              <select
                className="form-select form-select-sm"
                value={filterUsername}
                onChange={(e) => setFilterUsername(e.target.value)}
                style={{ width: 150 }}
              >
                <option value="">All</option>
                {usernameList.map((uname) => (
                  <option key={uname} value={uname}>
                    {uname}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <div className="filter-label">Date From</div>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                style={{ width: 150 }}
              />
            </div>
            <div className="col-auto">
              <div className="filter-label">Date To</div>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                style={{ width: 150 }}
              />
            </div>
            <div className="col-auto ms-auto">
              <button type="submit" className="btn btn-sm btn-primary">
                <i className="bi bi-funnel me-1"></i> Filter
              </button>
            </div>
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClear}
              >
                <i className="bi bi-x-lg me-1"></i> Clear
              </button>
            </div>
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={handleExportExcel}
              >
                <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="alert alert-danger mb-3"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* History Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 small text-muted">Loading history...</p>
            </div>
          ) : historyItems.length > 0 ? (
            <div className="table-responsive">
              <table
                className="table-enterprise mb-0"
                id="historyTable"
              >
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Date/Time</th>
                    <th>Document ID</th>
                    <th>Registration ID</th>
                    <th>Company Name</th>
                    <th className="text-end">UBOs</th>
                    <th>Result</th>
                    <th>Username</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-muted">{index + 1}</td>
                      <td className="small text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {item.searched_at}
                      </td>
                      <td>
                        <code
                          className="small"
                          style={{
                            color: "var(--lhb-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {item.document_id}
                        </code>
                      </td>
                      <td>
                        <code className="small">{item.registration_id}</code>
                      </td>
                      <td className="fw-semibold">{item.company_name}</td>
                      <td className="text-end">
                        {item.ubo_count > 0 ? (
                          <span className="badge badge-ubo">
                            {item.ubo_count}
                          </span>
                        ) : (
                          <span className="badge badge-below">0</span>
                        )}
                      </td>
                      <td>
                        {item.ubo_count > 0 ? (
                          <span className="badge badge-compliant">
                            UBO Found
                          </span>
                        ) : (
                          <span className="badge badge-below">No UBO</span>
                        )}
                      </td>
                      <td className="small">
                        <i className="bi bi-person-circle me-1 text-muted"></i>
                        {item.employee_id}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary btn-icon"
                          onClick={() => viewReport(item.id)}
                          title="View Report"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <h5>No Search History</h5>
              <p>Start your first UBO analysis to see history here.</p>
              <Link href="/search" className="btn btn-primary">
                <i className="bi bi-search me-1"></i> Start Analysis
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showModal && (
        <div
          className="modal show"
          tabIndex={-1}
          ref={modalRef}
          onClick={handleBackdropClick}
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content modal-content-enterprise">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-text me-2"></i>UBO Analysis
                  Report
                </h5>
                <div className="d-flex gap-2 ms-auto me-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handlePreviewPDF}
                  >
                    <i className="bi bi-eye me-1"></i> Preview PDF
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={handleExportPDF}
                  >
                    <i className="bi bi-download me-1"></i> Export PDF
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-0">
                {renderReportContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
