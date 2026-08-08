"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api-client";

interface TopCompany {
  company_name: string;
  search_count: number;
}

interface SearchByDay {
  day_label: string;
  count: number;
}

interface DashboardStats {
  total_searches: number;
  total_companies: number;
  total_ubos: number;
  active_sessions: number;
  top_companies: TopCompany[];
  daily_searches: SearchByDay[];
}

interface RecentActivity {
  searched_at: string;
  company_name: string;
  registration_id: string;
  ubo_count: number;
  employee_id: string;
}

const dailyColors = [
  "rgba(37,99,235,0.7)",
  "rgba(16,185,129,0.7)",
  "rgba(245,158,11,0.7)",
  "rgba(239,68,68,0.7)",
  "rgba(139,92,246,0.7)",
  "rgba(6,182,212,0.7)",
  "rgba(236,72,153,0.7)",
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userName, setUserName] = useState("Admin");
  const [userDepartment, setUserDepartment] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Animated counter state
  const [displaySearches, setDisplaySearches] = useState(0);
  const [displayCompanies, setDisplayCompanies] = useState(0);
  const [displayUbos, setDisplayUbos] = useState(0);
  const [displaySessions, setDisplaySessions] = useState(0);

  const topCompaniesRef = useRef<HTMLCanvasElement>(null);
  const dailySearchesRef = useRef<HTMLCanvasElement>(null);
  const topCompaniesChartRef = useRef<unknown>(null);
  const dailyChartRef = useRef<unknown>(null);

  // Animate counter
  const animateCounter = useCallback(
    (setFn: (v: number) => void, target: number) => {
      if (!target) {
        setFn(0);
        return;
      }
      const duration = 1000;
      const steps = 30;
      const increment = target / steps;
      let current = 0;
      let step = 0;
      const timer = setInterval(() => {
        current += increment;
        step++;
        if (step >= steps) {
          setFn(target);
          clearInterval(timer);
        } else {
          setFn(Math.round(current));
        }
      }, duration / steps);
    },
    []
  );

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch user info
      const meResult = await apiFetch<{
        user?: { name?: string; email?: string; department?: string; title?: string };
      }>("/api/auth/me");
      if (meResult.data?.user) {
        const u = meResult.data.user;
        if (u.name) setUserName(u.name);
        if (u.email) setUserEmail(u.email);
        if (u.department) setUserDepartment(u.department);
        if (u.title) setUserTitle(u.title);
      }

      // Fetch stats
      const statsResult = await apiFetch<DashboardStats>(
        "/api/dashboard/stats"
      );
      if (statsResult.data) {
        setStats(statsResult.data);
        animateCounter(setDisplaySearches, statsResult.data.total_searches || 0);
        animateCounter(setDisplayCompanies, statsResult.data.total_companies || 0);
        animateCounter(setDisplayUbos, statsResult.data.total_ubos || 0);
        animateCounter(setDisplaySessions, statsResult.data.active_sessions || 0);
      } else if (statsResult.error) {
        setError(statsResult.error);
      }

      // Fetch recent activity
      const recentResult = await apiFetch<{
        items?: RecentActivity[];
      }>("/api/dashboard/recent");
      if (recentResult.data) {
        const items = recentResult.data.items || [];
        setRecentActivity(items);
      }
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [animateCounter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Render Chart.js charts when data is available
  useEffect(() => {
    if (!stats) return;

    // Dynamically import Chart.js and render
    import("chart.js/auto").then(({ default: ChartJS }) => {
      // Bar chart: Most Searched Companies
      if (topCompaniesRef.current) {
        if (topCompaniesChartRef.current) {
          (topCompaniesChartRef.current as { destroy: () => void }).destroy();
        }

        const topCompanies = (stats.top_companies || []).slice(0, 5);
        if (topCompanies.length > 0) {
          topCompaniesChartRef.current = new ChartJS(topCompaniesRef.current, {
            type: "bar",
            data: {
              labels: topCompanies.map((c) => c.company_name),
              datasets: [
                {
                  label: "Searches",
                  data: topCompanies.map((c) => c.search_count),
                  backgroundColor: "rgba(37,99,235,0.7)",
                  borderColor: "rgba(37,99,235,1)",
                  borderWidth: 1,
                  borderRadius: 4,
                  barThickness: 32,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0, font: { size: 11 } },
                  grid: { color: "rgba(0,0,0,0.05)" },
                },
                x: {
                  ticks: { font: { size: 10 }, maxRotation: 30 },
                  grid: { display: false },
                },
              },
            },
          });
        }
      }

      // Doughnut chart: Searches by Day
      if (dailySearchesRef.current) {
        if (dailyChartRef.current) {
          (dailyChartRef.current as { destroy: () => void }).destroy();
        }

        const dailySearches = stats.daily_searches || [];
        const dailyLabels = dailySearches.map((d) => d.day_label);
        const dailyData = dailySearches.map((d) => d.count);
        const hasData = dailyData.some((v) => v > 0);
        const chartData = hasData
          ? dailyData
          : dailyData.map(() => 1); // Equal slices for empty state

        dailyChartRef.current = new ChartJS(dailySearchesRef.current, {
          type: "doughnut",
          data: {
            labels: dailyLabels,
            datasets: [
              {
                data: chartData,
                backgroundColor: hasData
                  ? dailyColors
                  : dailyColors.map((c) => c.replace("0.7", "0.15")),
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    if (!hasData) return "0 searches";
                    return `${ctx.parsed} searches`;
                  },
                },
              },
            },
            cutout: "65%",
          },
        });
      }
    });
  }, [stats]);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      if (topCompaniesChartRef.current) {
        (topCompaniesChartRef.current as { destroy: () => void }).destroy();
      }
      if (dailyChartRef.current) {
        (dailyChartRef.current as { destroy: () => void }).destroy();
      }
    };
  }, []);

  const statCards = [
    {
      label: "Total Searches",
      value: displaySearches,
      icon: "bi-search",
      bgClass: "primary",
      bgStyle: { background: "var(--lhb-primary)" },
    },
    {
      label: "Companies Analyzed",
      value: displayCompanies,
      icon: "bi-building",
      bgClass: "success",
      bgStyle: { background: "var(--lhb-success)" },
    },
    {
      label: "UBOs Identified",
      value: displayUbos,
      icon: "bi-person-check",
      bgClass: "warning",
      bgStyle: { background: "var(--lhb-warning)" },
    },
    {
      label: "Active Sessions",
      value: displaySessions,
      icon: "bi-people",
      bgClass: "info",
      bgStyle: { background: "var(--lhb-info)" },
    },
  ];

  // Generate daily legend data
  const dailySearches = stats?.daily_searches || [];
  const dailyLabels = dailySearches.map((d) => d.day_label);
  const dailyData = dailySearches.map((d) => d.count);
  const hasDailyData = dailyData.some((v) => v > 0);

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4
            className="mb-1 fw-bold"
            style={{ color: "var(--lhb-navy)" }}
          >
            Dashboard
          </h4>
          <p className="text-muted mb-0 small">
            Welcome back, <strong>{userName}</strong>.
            {userDepartment && (
              <span className="text-muted"> ({userDepartment})</span>
            )}
          </p>
          {userEmail && (
            <p className="text-muted mb-0 small">
              <i className="bi bi-envelope me-1"></i>
              {userEmail}
              {userTitle && (
                <>
                  <span className="mx-1">|</span>
                  <i className="bi bi-briefcase me-1"></i>
                  {userTitle}
                </>
              )}
            </p>
          )}
        </div>
        <a href="/search" className="btn btn-primary">
          <i className="bi bi-search me-1"></i> New Analysis
        </a>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <span>{error}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-md-3" key={card.label}>
            <div className="card stat-card h-100">
              <div className="stat-bg" style={card.bgStyle}></div>
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`stat-icon ${card.bgClass}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <div className="stat-label">{card.label}</div>
                  <div className="stat-value">
                    {loading ? (
                      <div
                        className="bg-slate-200 rounded animate-pulse"
                        style={{ height: 28, width: 48 }}
                      ></div>
                    ) : (
                      card.value
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4 chart-row">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>
                <i className="bi bi-bar-chart me-2"></i>
                Most Searched Companies
              </h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <canvas
                  ref={topCompaniesRef}
                  height="200"
                  id="chartTopCompanies"
                ></canvas>
              </div>
              {!loading &&
                (!stats?.top_companies || stats.top_companies.length === 0) && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="bi bi-bar-chart"></i>
                    </div>
                    <p>No search data yet. Start your first analysis!</p>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>
                <i className="bi bi-calendar-week me-2"></i>
                Searches by Day (7 days)
              </h5>
            </div>
            <div className="card-body">
              <div
                className="chart-container"
                style={{
                  maxHeight: 220,
                  margin: "0 auto",
                  position: "relative",
                }}
              >
                <canvas
                  ref={dailySearchesRef}
                  id="chartDailySearches"
                ></canvas>
              </div>
              {/* Daily legend */}
              <div className="daily-legend">
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                  {dailyLabels.map((label, i) => {
                    const count = dailyData[i];
                    const color = dailyColors[i];
                    const isActive = hasDailyData && count > 0;
                    return (
                      <div
                        key={i}
                        className={`daily-legend-item${isActive ? " active" : ""}`}
                      >
                        <span
                          className="legend-dot"
                          style={{
                            background: color.replace(
                              "0.7",
                              isActive ? "1" : "0.4"
                            ),
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            marginRight: 6,
                          }}
                        ></span>
                        <span className="legend-label">{label}</span>{" "}
                        <span
                          className={`legend-count${isActive ? " text-primary fw-bold" : " text-muted"}`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header">
              <h5>
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body d-flex flex-column gap-2">
              <a href="/search" className="quick-action">
                <div
                  className="qa-icon"
                  style={{
                    background: "rgba(37,99,235,0.1)",
                    color: "var(--lhb-primary)",
                  }}
                >
                  <i className="bi bi-search"></i>
                </div>
                <div>
                  <div className="qa-title">New UBO Analysis</div>
                  <div className="qa-desc">
                    Search by company registration ID
                  </div>
                </div>
              </a>
              <a href="/history" className="quick-action">
                <div
                  className="qa-icon"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    color: "var(--lhb-success)",
                  }}
                >
                  <i className="bi bi-clock-history"></i>
                </div>
                <div>
                  <div className="qa-title">View Search History</div>
                  <div className="qa-desc">
                    Review past analyses and results
                  </div>
                </div>
              </a>
              <a href="/settings" className="quick-action">
                <div
                  className="qa-icon"
                  style={{
                    background: "rgba(100,116,139,0.1)",
                    color: "var(--lhb-text-secondary)",
                  }}
                >
                  <i className="bi bi-gear"></i>
                </div>
                <div>
                  <div className="qa-title">System Settings</div>
                  <div className="qa-desc">Manage users, API, and logs</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>
                <i className="bi bi-clock-history me-2"></i>
                Recent Activity
              </h5>
              <a
                href="/history"
                className="btn btn-sm btn-outline-primary"
              >
                View All
              </a>
            </div>
            <div className="card-body p-0">
              {recentActivity.length > 0 ? (
                <div className="table-responsive">
                  <table className="table-enterprise mb-0">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Company</th>
                        <th>Registration ID</th>
                        <th className="text-end">UBOs</th>
                        <th className="text-end">Username</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity, idx) => (
                        <tr key={idx}>
                          <td className="small text-muted">
                            {activity.searched_at}
                          </td>
                          <td className="fw-semibold">
                            {activity.company_name}
                          </td>
                          <td>
                            <code className="small">
                              {activity.registration_id}
                            </code>
                          </td>
                          <td className="text-end">
                            {activity.ubo_count > 0 ? (
                              <span className="badge badge-ubo">
                                {activity.ubo_count}
                              </span>
                            ) : (
                              <span className="badge badge-below">0</span>
                            )}
                          </td>
                          <td className="text-end small text-muted">
                            {activity.employee_id}
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
                  <h5>No Recent Activity</h5>
                  <p>Start analyzing companies to see activity here.</p>
                  <a href="/search" className="btn btn-primary btn-sm">
                    <i className="bi bi-search me-1"></i> Start Analysis
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
