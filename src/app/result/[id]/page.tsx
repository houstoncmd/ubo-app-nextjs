"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

// Dynamically import vis-network to avoid SSR issues
const OwnershipGraph = dynamic(() => import("@/components/OwnershipGraph"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" />
        <p className="text-sm text-slate-500">Loading graph...</p>
      </div>
    </div>
  ),
});

/* ================================================================
   TypeScript interfaces for the API response shape
   ================================================================ */
interface Shareholder {
  name: string;
  reg_id: string;
  type: string;
  level: number;
  direct_pct: number;
  effective_pct: number;
  share_amount: number | null;
  is_ubo?: boolean;
}

interface UboPath {
  chain_names: string[];
  calculation: string;
}

interface UboCandidate {
  name: string;
  reg_id: string;
  paths: UboPath[];
}

interface FinalUbo {
  name: string;
  total_pct: number;
  compliance_status: string;
}

interface Signatory {
  name: string;
  position?: string;
  raw_text?: string;
}

interface DirectorSignatory {
  name: string;
  is_director: boolean;
  is_signatory: boolean;
  matched_signatory: string | null;
}

interface ComplianceCheck {
  found_ubo?: string;
  companies_checked?: number;
  required?: boolean;
  note?: string;
  directors_found?: number;
  is_exempt?: boolean;
  reason?: string;
}

interface ComplianceChecklist {
  method_1_check: ComplianceCheck;
  method_2_check: ComplianceCheck;
  method_3_check: ComplianceCheck;
  exemption_check: ComplianceCheck;
  final_result: {
    ubo_identified: boolean;
    action: string;
    next_step: string;
  };
}

interface GraphNode {
  id: string;
  label: string;
  full_name?: string;
  reg_id?: string;
  type: string;
  level: number;
  is_ubo?: boolean;
  is_investigation?: boolean;
  effective_pct?: number;
  color?: { background: string; border: string };
  shape?: string;
  size?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  width?: number;
  arrows?: string;
  color?: { color: string; highlight: string };
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ResultStats {
  total_shareholders: number;
  total_companies_checked: number;
  max_level_reached: number;
  api_calls: number;
}

interface CompanyResult {
  registration_id: string;
  company_name: string;
  capital?: string;
  company_type?: string;
  compliance_status: string;
  shareholder_count?: number;
  authorized_signatories: Signatory[];
  director_signatory_table?: DirectorSignatory[];
  root_shareholders: Shareholder[];
  final_ubos: FinalUbo[];
  ubo_candidates: UboCandidate[];
  graph: GraphData;
  compliance_checklist: ComplianceChecklist | null;
  stats: ResultStats;
}

interface ApiResponse {
  id: number;
  document_id: string;
  registration_id: string;
  company_name: string;
  ubo_count: number;
  searched_at: string;
  result: CompanyResult;
}

/* ================================================================
   Helper: determine status badge for a shareholder
   ================================================================ */
function getShareholderStatus(sh: Shareholder) {
  const isForeignCompany = sh.reg_id?.startsWith("HD");
  const isCompany = isForeignCompany || sh.type === "company";
  const pct = sh.effective_pct ?? 0;

  if ((isForeignCompany || isCompany) && pct >= 15) {
    return { label: "Investigation", className: "badge-investigation" };
  }
  if (pct >= 15) {
    return { label: "UBO", className: "badge-ubo" };
  }
  return { label: "Below", className: "badge-below" };
}

function getTypeBadge(sh: Shareholder) {
  if (sh.reg_id?.startsWith("HD")) {
    return { label: "Company", icon: "bi-building", className: "badge-investigation" };
  }
  if (sh.type === "personal") {
    return { label: "Person", icon: "bi-person", className: "badge-compliant" };
  }
  return { label: "Company", icon: "bi-building", className: "badge-investigation" };
}

/* ================================================================
   Main Result Page Component
   ================================================================ */
export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [shLevel, setShLevel] = useState<number>(2);
  const [shMaxLevel, setShMaxLevel] = useState(0);

  // Fetch result data from the API
  useEffect(() => {
    let cancelled = false;
    async function fetchResult() {
      setLoading(true);
      setError(null);
      const res = await apiFetch<ApiResponse>(`/api/result/${id}`);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setData(res.data);
        // Compute max level from shareholders
        const shareholders = res.data.result?.root_shareholders || [];
        let maxLv = 0;
        shareholders.forEach((sh) => {
          if ((sh.level || 0) > maxLv) maxLv = sh.level;
        });
        setShMaxLevel(maxLv);
      }
      setLoading(false);
    }
    fetchResult();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const result = data?.result;

  // Toggle row expansion
  const toggleRow = useCallback(
    (index: number) => {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    },
    []
  );

  // Toggle all rows
  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedRows(new Set());
      setAllExpanded(false);
    } else {
      const all = new Set<number>();
      result?.root_shareholders?.forEach((_, i) => all.add(i));
      setExpandedRows(all);
      setAllExpanded(true);
    }
  }, [allExpanded, result]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lhb-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-slate-500 font-medium">Loading analysis results...</p>
          <p className="text-slate-400 text-sm mt-1">
            Fetching company data and ownership graph
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !result) {
    return (
      <div className="min-h-screen bg-[var(--lhb-bg)]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-exclamation-triangle" />
                </div>
                <h5>ไม่พบข้อมูล</h5>
                <p>{error || "No result data available for this record."}</p>
                <Link
                  href="/search"
                  className="btn btn-primary mt-3"
                  style={{ display: "inline-flex" }}
                >
                  <i className="bi bi-arrow-left me-1" /> New Search
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const shareholders = result.root_shareholders || [];
  const ubos = result.final_ubos || [];
  const stats = result.stats || {};
  const signatories = result.authorized_signatories || [];
  const directorTable = result.director_signatory_table || [];

  // Collect unique signatory raw texts
  const signatoryRawTexts = signatories
    .filter((s) => s.raw_text)
    .reduce<string[]>((acc, s) => {
      if (!acc.includes(s.raw_text!)) acc.push(s.raw_text!);
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-[var(--lhb-bg)] fade-in">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ======== COMPANY HEADER ======== */}
        <div className="row mb-3">
          <div className="col-12">
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, var(--lhb-navy), #1e3a5f)",
                color: "#fff",
                border: "none",
              }}
            >
              <div className="card-body" style={{ padding: "1rem 1.25rem" }}>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h4 className="mb-1" style={{ fontSize: "1.15rem" }}>
                      <i className="bi bi-building me-2" />
                      {result.company_name || "Unknown Company"}
                    </h4>
                    <p className="mb-0 small" style={{ opacity: 0.75 }}>
                      <i className="bi bi-fingerprint me-1" /> Registration:{" "}
                      <strong>{result.registration_id}</strong>
                      {result.capital && (
                        <>
                          {" | "}
                          <i className="bi bi-cash-stack me-1" /> Capital:{" "}
                          {result.capital}
                        </>
                      )}
                      {stats.api_calls != null && (
                        <>
                          {" | "}
                          <i className="bi bi-cloud me-1" /> API Calls:{" "}
                          {stats.api_calls}
                        </>
                      )}
                    </p>
                  </div>
                  <div
                    className="col-md-4 text-md-end mt-2 mt-md-0"
                    style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}
                  >
                    <Link href="/search" className="btn btn-sm" style={{ background: "#fff", color: "var(--lhb-navy)" }}>
                      <i className="bi bi-arrow-left me-1" /> New Search
                    </Link>
                    {result.compliance_status === "COMPLIANT" ? (
                      <span className="badge badge-compliant" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                        <i className="bi bi-shield-check me-1" /> COMPLIANT
                      </span>
                    ) : (
                      <span className="badge badge-noncompliant" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                        <i className="bi bi-shield-exclamation me-1" /> NON-COMPLIANT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======== STATS ROW ======== */}
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="stat-icon primary"><i className="bi bi-people" /></div>
                <div>
                  <div className="stat-label">Shareholders</div>
                  <div className="stat-value">{stats.total_shareholders || 0}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="stat-icon info"><i className="bi bi-building" /></div>
                <div>
                  <div className="stat-label">Companies Checked</div>
                  <div className="stat-value">{stats.total_companies_checked || 0}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="stat-icon success"><i className="bi bi-layers" /></div>
                <div>
                  <div className="stat-label">Max Level Reached</div>
                  <div className="stat-value">{stats.max_level_reached || 0}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="stat-icon warning"><i className="bi bi-person-check" /></div>
                <div>
                  <div className="stat-label">UBOs Identified</div>
                  <div className="stat-value">{ubos.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======== AUTHORIZED SIGNATORIES ======== */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>
                  <i className="bi bi-pen me-2" />
                  ผู้มีอำนาจลงนาม
                  <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>
                    {signatories.length}
                  </span>
                </h5>
              </div>
              <div className="card-body">
                {signatories.length > 0 ? (
                  <>
                    {/* Raw official signatory text */}
                    {signatoryRawTexts.length > 0 && (
                      <div
                        className="mb-3 p-3"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid var(--lhb-border)",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {signatoryRawTexts.map((rawText, idx) => (
                          <p key={idx} className={idx < signatoryRawTexts.length - 1 ? "mb-2" : "mb-0"}>
                            <i className="bi bi-quote text-muted me-1" />
                            &ldquo;{rawText}&rdquo;
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state" style={{ padding: "1.5rem" }}>
                    <div className="empty-icon"><i className="bi bi-person-x" /></div>
                    <h5>ไม่มีข้อมูลผู้มีอำนาจลงนาม</h5>
                    <p>ไม่พบข้อมูลผู้มีอำนาจลงนามสำหรับบริษัทนี้</p>
                  </div>
                )}

                {/* Director-Signatory Matching Table */}
                {directorTable.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h6 className="mb-0">
                        <i className="bi bi-person-lines-fill me-1" />
                        รายชื่อกรรมการทั้งหมด
                      </h6>
                      <span className="badge bg-secondary ms-2" style={{ fontSize: "0.65rem" }}>
                        {directorTable.length}
                      </span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="table-enterprise mb-0" style={{ fontSize: "0.85rem" }}>
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th>ชื่อ</th>
                            <th style={{ width: 200 }}>ประเภท</th>
                            <th style={{ width: 200 }}>ผู้มีอำนาจลงนามที่ตรงกัน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {directorTable.map((d, idx) => (
                            <tr key={idx}>
                              <td className="text-center">{idx + 1}</td>
                              <td className="fw-semibold">{d.name}</td>
                              <td>
                                {d.is_director && d.is_signatory ? (
                                  <span
                                    className="badge"
                                    style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}
                                  >
                                    กรรมการ + ผู้มีอำนาจลงนาม
                                  </span>
                                ) : d.is_director ? (
                                  <span
                                    className="badge"
                                    style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb" }}
                                  >
                                    กรรมการ
                                  </span>
                                ) : d.is_signatory ? (
                                  <span
                                    className="badge"
                                    style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}
                                  >
                                    ผู้มีอำนาจลงนาม
                                  </span>
                                ) : null}
                              </td>
                              <td>
                                {d.matched_signatory ? (
                                  <span className="small">{d.matched_signatory}</span>
                                ) : (
                                  <span className="text-muted small">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======== SHAREHOLDERS TABLE ======== */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>
                  <i className="bi bi-people me-2" />
                  Shareholders
                  <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>
                    {shareholders.length}
                  </span>
                </h5>
                <div className="d-flex gap-2 align-items-center">
                  <div className="btn-group" role="group" style={{ fontSize: "0.8rem" }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${shLevel === 99 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setShLevel(99)}
                    >
                      All
                    </button>
                    {Array.from({ length: shMaxLevel + 1 }, (_, i) => i).map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        className={`btn btn-sm ${shLevel === lv ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setShLevel(lv)}
                      >
                        0-{lv}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleAll}
                  >
                    <i className={`bi bi-arrows-${allExpanded ? "collapse" : "expand"}`} />{" "}
                    {allExpanded ? "Collapse All" : "Expand All"}
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                {shareholders.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table className="table-enterprise mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th>Name</th>
                          <th style={{ width: 55 }} className="text-center">Level</th>
                          <th style={{ width: 70 }}>Type</th>
                          <th className="text-end" style={{ width: 90 }}>Direct %</th>
                          <th className="text-end" style={{ width: 100 }}>Effective %</th>
                          <th className="text-end" style={{ width: 110 }}>Share Amount</th>
                          <th style={{ width: 90 }}>Status</th>
                          <th style={{ width: 60 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {shareholders.map((sh, idx) => {
                          const level = sh.level || 0;
                          const visible = shLevel === 99 || level <= shLevel;
                          if (!visible) return null;

                          const expanded = expandedRows.has(idx);
                          const status = getShareholderStatus(sh);
                          const typeBadge = getTypeBadge(sh);
                          const effectivePct = sh.effective_pct ?? 0;
                          const pctBarWidth = Math.min(effectivePct, 100);

                          // Find ownership paths for this shareholder
                          const candidate = result.ubo_candidates?.find(
                            (c) => c.name === sh.name
                          );
                          const paths = candidate?.paths || [];

                          return (
                            <React.Fragment key={idx}>
                              <tr
                                className="sh-main-row"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  // Don't toggle if clicking a button
                                  if ((e.target as HTMLElement).closest("button")) return;
                                  toggleRow(idx);
                                }}
                              >
                                <td>{idx + 1}</td>
                                <td>
                                  <div className="sh-name-text">
                                    {sh.reg_id?.startsWith("HD")
                                      ? `บริษัทต่างชาติ ${sh.reg_id.slice(2)}`
                                      : sh.name}
                                  </div>
                                  <div className="sh-id-text">{sh.reg_id}</div>
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-secondary">{sh.level}</span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${typeBadge.className}`}
                                    style={{ display: "inline-flex", alignItems: "center" }}
                                  >
                                    <i className={`bi ${typeBadge.icon} me-1`} />
                                    {typeBadge.label}
                                  </span>
                                </td>
                                <td className="text-end fw-bold">
                                  {(sh.direct_pct ?? 0).toFixed(2)}%
                                </td>
                                <td className="text-end">
                                  <div className="sh-pct-bar" style={{ alignItems: "flex-end" }}>
                                    <span className="fw-bold" style={{ color: "var(--lhb-primary)" }}>
                                      {effectivePct.toFixed(4)}%
                                    </span>
                                    <div className="pct-fill" style={{ width: "100%" }}>
                                      <div
                                        className="pct-value"
                                        style={{
                                          width: `${pctBarWidth}%`,
                                          background: "var(--lhb-primary)",
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="text-end">
                                  {sh.share_amount
                                    ? sh.share_amount.toLocaleString("en-US", { maximumFractionDigits: 0 })
                                    : "-"}
                                </td>
                                <td>
                                  <span className={`badge ${status.className}`}>
                                    {status.label === "Investigation" && (
                                      <i className="bi bi-search me-1" />
                                    )}
                                    {status.label === "UBO" && (
                                      <i className="bi bi-exclamation-triangle me-1" />
                                    )}
                                    {status.label}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-secondary btn-icon"
                                    title="View Details"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRow(idx);
                                    }}
                                  >
                                    <i className="bi bi-eye" />
                                  </button>
                                </td>
                              </tr>

                              {/* Expand Row */}
                              {expanded && (
                                <tr className="sh-detail-row">
                                  <td
                                    colSpan={9}
                                    style={{
                                      padding: "1rem 1.5rem !important",
                                      background: "#f8fafc",
                                    }}
                                  >
                                    <div className="row g-3">
                                      <div className="col-md-6">
                                        <strong
                                          className="text-muted small text-uppercase"
                                          style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}
                                        >
                                          Ownership Paths
                                        </strong>
                                        {paths.length > 0 ? (
                                          paths.map((path, pIdx) => (
                                            <div
                                              key={pIdx}
                                              className="mt-2 p-2"
                                              style={{
                                                background: "#fff",
                                                border: "1px solid var(--lhb-border)",
                                                borderRadius: "6px",
                                              }}
                                            >
                                              <div className="small mb-1">
                                                {path.chain_names.map((step, sIdx) => (
                                                  <span key={sIdx}>
                                                    <span className="badge bg-light text-dark border">
                                                      {step}
                                                    </span>
                                                    {sIdx < path.chain_names.length - 1 && (
                                                      <i
                                                        className="bi bi-arrow-right mx-1 text-muted"
                                                        style={{ fontSize: "0.65rem" }}
                                                      />
                                                    )}
                                                  </span>
                                                ))}
                                              </div>
                                              <div>
                                                <code
                                                  className="path-calc"
                                                  style={{
                                                    fontSize: "0.75rem",
                                                    background: "#f1f5f9",
                                                    padding: "2px 6px",
                                                    borderRadius: "3px",
                                                  }}
                                                >
                                                  {path.calculation}
                                                </code>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-muted small mt-2">
                                            No detailed path data available
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon"><i className="bi bi-inbox" /></div>
                    <h5>No Shareholder Data</h5>
                    <p>No shareholder information is available for this company.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======== OWNERSHIP GRAPH ======== */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <h5 className="mb-0">
                    <i className="bi bi-diagram-3 me-2" />
                    Ownership Graph
                  </h5>
                </div>
              </div>
              <div className="card-body">
                {result.graph && result.graph.nodes && result.graph.nodes.length > 0 ? (
                  <OwnershipGraph data={result.graph} />
                ) : (
                  <div className="empty-state" style={{ padding: "2rem" }}>
                    <div className="empty-icon"><i className="bi bi-diagram-3" /></div>
                    <p className="text-muted">No graph data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======== COMPLIANCE CHECKLIST ======== */}
        {result.compliance_checklist && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5>
                    <i className="bi bi-clipboard-check me-2" />
                    Compliance Checklist
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {/* Method 1 */}
                    <div className="col-md-3">
                      <div
                        className="compliance-card p-3"
                        style={{ background: "rgba(16,185,129,0.06)" }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div
                            className="compliance-icon"
                            style={{ background: "rgba(16,185,129,0.12)", color: "var(--lhb-success)" }}
                          >
                            <i className="bi bi-check-circle" />
                          </div>
                          <strong style={{ color: "#059669" }}>Method 1</strong>
                        </div>
                        <div className="small text-muted">
                          Ownership threshold (&ge;15%)<br />
                          <strong>Found:</strong>{" "}
                          {result.compliance_checklist.method_1_check.found_ubo || "N/A"}
                          <br />
                          <strong>Companies:</strong>{" "}
                          {result.compliance_checklist.method_1_check.companies_checked || 0}
                        </div>
                      </div>
                    </div>
                    {/* Method 2 */}
                    <div className="col-md-3">
                      <div
                        className="compliance-card p-3"
                        style={{ background: "rgba(245,158,11,0.06)" }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div
                            className="compliance-icon"
                            style={{ background: "rgba(245,158,11,0.12)", color: "var(--lhb-warning)" }}
                          >
                            <i className="bi bi-people" />
                          </div>
                          <strong style={{ color: "#d97706" }}>Method 2</strong>
                        </div>
                        <div className="small text-muted">
                          Actual control check<br />
                          <strong>Required:</strong>{" "}
                          {result.compliance_checklist.method_2_check.required ? "Yes" : "No"}
                          <br />
                          {result.compliance_checklist.method_2_check.note || ""}
                        </div>
                      </div>
                    </div>
                    {/* Method 3 */}
                    <div className="col-md-3">
                      <div
                        className="compliance-card p-3"
                        style={{ background: "rgba(100,116,139,0.06)" }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div
                            className="compliance-icon"
                            style={{ background: "rgba(100,116,139,0.12)", color: "var(--lhb-text-secondary)" }}
                          >
                            <i className="bi bi-person-badge" />
                          </div>
                          <strong>Method 3</strong>
                        </div>
                        <div className="small text-muted">
                          Senior management<br />
                          <strong>Directors:</strong>{" "}
                          {result.compliance_checklist.method_3_check.directors_found || 0}
                          <br />
                          {result.compliance_checklist.method_3_check.note || ""}
                        </div>
                      </div>
                    </div>
                    {/* Exemption */}
                    <div className="col-md-3">
                      <div
                        className="compliance-card p-3"
                        style={{ background: "rgba(6,182,212,0.06)" }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div
                            className="compliance-icon"
                            style={{ background: "rgba(6,182,212,0.12)", color: "var(--lhb-info)" }}
                          >
                            <i className="bi bi-shield-check" />
                          </div>
                          <strong style={{ color: "var(--lhb-info)" }}>Exemption</strong>
                        </div>
                        <div className="small text-muted">
                          <strong>Exempt:</strong>{" "}
                          {result.compliance_checklist.exemption_check.is_exempt ? "Yes" : "No"}
                          <br />
                          {result.compliance_checklist.exemption_check.reason || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Final Result:</strong>
                      <span
                        className={`badge ${
                          result.compliance_checklist.final_result.ubo_identified
                            ? "badge-ubo"
                            : "badge-compliant"
                        } ms-2`}
                        style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}
                      >
                        {result.compliance_checklist.final_result.action}
                      </span>
                    </div>
                    <div>
                      <small className="text-muted">
                        {result.compliance_checklist.final_result.next_step}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======== UBO ANALYSIS REPORT ======== */}
        {ubos.length > 0 && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5>
                    <i className="bi bi-person-check me-2" />
                    UBO Analysis Report
                  </h5>
                </div>
                <div className="card-body">
                  <div
                    className="alert mb-3"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      color: "#059669",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bi bi-check-circle me-1" />
                    Found <strong>{ubos.length}</strong> UBO(s)
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="table-enterprise mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th>ชื่อ</th>
                          <th className="text-end">สัดส่วนการถือหุ้น</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ubos.map((ubo, idx) => (
                          <tr key={idx}>
                            <td className="text-center">{idx + 1}</td>
                            <td className="fw-semibold">{ubo.name || "-"}</td>
                            <td
                              className="text-end fw-bold"
                              style={{ color: "var(--lhb-primary)" }}
                            >
                              {(ubo.total_pct ?? 0).toFixed(4)}%
                            </td>
                            <td>
                              <span
                                style={{
                                  color:
                                    ubo.compliance_status === "review_required"
                                      ? "#d97706"
                                      : "#16a34a",
                                }}
                              >
                                {ubo.compliance_status === "review_required"
                                  ? "Review Required"
                                  : "Compliant"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Need React import for React.Fragment */
import React from "react";
