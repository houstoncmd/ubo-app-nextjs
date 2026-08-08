"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch, type ApiResponse } from "@/lib/api-client";

interface DashboardStats {
  total_searches: number;
  companies_analyzed: number;
  ubos_identified: number;
  active_sessions: number;
  top_companies?: Array<{ name: string; count: number; registration_id: string }>;
  searches_by_day?: Array<{ date: string; count: number }>;
}

interface RecentActivity {
  id: number;
  registration_id: string;
  company_name: string;
  user_name: string;
  created_at: string;
  ubo_count: number;
}

const defaultStatCards = [
  {
    label: "Total Searches",
    value: "0",
    icon: "bi-search",
    color: "var(--lhb-primary)",
    bgColor: "rgba(37,99,235,0.1)",
  },
  {
    label: "Companies Analyzed",
    value: "0",
    icon: "bi-building",
    color: "var(--lhb-success)",
    bgColor: "rgba(16,185,129,0.1)",
  },
  {
    label: "UBOs Identified",
    value: "0",
    icon: "bi-person-check",
    color: "var(--lhb-warning)",
    bgColor: "rgba(245,158,11,0.1)",
  },
  {
    label: "Active Sessions",
    value: "0",
    icon: "bi-people",
    color: "var(--lhb-info)",
    bgColor: "rgba(6,182,212,0.1)",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@lhb.local");
  const [userRole, setUserRole] = useState("System Administrator");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    // Fetch user info
    const meResult = await apiFetch<{ user?: { name?: string; email?: string; role?: string } }>("/api/auth/me");
    if (meResult.data?.user) {
      const u = meResult.data.user;
      if (u.name) setUserName(u.name);
      if (u.email) setUserEmail(u.email);
      if (u.role) setUserRole(u.role);
    }

    // Fetch stats
    const statsResult = await apiFetch<DashboardStats>("/api/dashboard/stats");
    if (statsResult.data) {
      setStats(statsResult.data);
    }

    // Fetch recent activity
    const recentResult = await apiFetch<{ items?: RecentActivity[] } | RecentActivity[]>("/api/dashboard/recent");
    if (recentResult.data) {
      const items = Array.isArray(recentResult.data) ? recentResult.data : (recentResult.data as { items: RecentActivity[] }).items;
      if (items) setRecentActivity(items);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      label: "Total Searches",
      value: String(stats?.total_searches ?? "0"),
      icon: "bi-search",
      color: "var(--lhb-primary)",
      bgColor: "rgba(37,99,235,0.1)",
    },
    {
      label: "Companies Analyzed",
      value: String(stats?.companies_analyzed ?? "0"),
      icon: "bi-building",
      color: "var(--lhb-success)",
      bgColor: "rgba(16,185,129,0.1)",
    },
    {
      label: "UBOs Identified",
      value: String(stats?.ubos_identified ?? "0"),
      icon: "bi-person-check",
      color: "var(--lhb-warning)",
      bgColor: "rgba(245,158,11,0.1)",
    },
    {
      label: "Active Sessions",
      value: String(stats?.active_sessions ?? "0"),
      icon: "bi-people",
      color: "var(--lhb-info)",
      bgColor: "rgba(6,182,212,0.1)",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4
            className="mb-1 font-bold"
            style={{ color: "var(--lhb-navy)" }}
          >
            Dashboard
          </h4>
          <p className="text-slate-500 text-sm mb-0">
            Welcome back, <strong>{userName}</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-0">
            <i className="bi bi-envelope me-1"></i>{userEmail}
            <span className="mx-1">|</span>
            <i className="bi bi-briefcase me-1"></i>{userRole}
          </p>
        </div>
        <a
          href="/search"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <i className="bi bi-search me-1"></i> New Analysis
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: card.bgColor }}
            >
              <i
                className={`bi ${card.icon} text-xl`}
                style={{ color: card.color }}
              ></i>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">
                {card.label}
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--lhb-text)" }}
              >
                {loading ? (
                  <div className="h-7 w-12 bg-slate-200 rounded animate-pulse"></div>
                ) : (
                  card.value
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* Most Searched Companies */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
            <h5 className="text-sm font-semibold text-slate-700">
              <i className="bi bi-bar-chart me-2"></i>Most Searched Companies
            </h5>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
                    <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats?.top_companies && stats.top_companies.length > 0 ? (
              <div className="space-y-3">
                {stats.top_companies.map((company, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16 truncate">{company.registration_id}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (company.count / (stats.top_companies?.[0]?.count || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-8 text-right">{company.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <i className="bi bi-bar-chart text-4xl mb-2"></i>
                  <p className="text-sm">No search data yet. Start your first analysis!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Searches by Day */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
            <h5 className="text-sm font-semibold text-slate-700">
              <i className="bi bi-calendar-week me-2"></i>Searches by Day (7
              days)
            </h5>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex items-end gap-2 h-32">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex-1 bg-slate-200 rounded-t animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }}></div>
                ))}
              </div>
            ) : stats?.searches_by_day && stats.searches_by_day.length > 0 ? (
              <div className="flex items-end gap-2 h-32">
                {stats.searches_by_day.map((day, idx) => {
                  const maxCount = Math.max(...stats.searches_by_day!.map(d => d.count), 1);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: "4px" }}
                      ></div>
                      <span className="text-[0.6rem] text-slate-400">{day.date.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <i className="bi bi-calendar-week text-4xl mb-2"></i>
                  <p className="text-sm">No activity data yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="px-5 py-3 border-b border-slate-200">
            <h5 className="text-sm font-semibold text-slate-700">
              <i className="bi bi-lightning me-2"></i>Quick Actions
            </h5>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <a
              href="/search"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors no-underline"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(37,99,235,0.1)" }}
              >
                <i
                  className="bi bi-search"
                  style={{ color: "var(--lhb-primary)" }}
                ></i>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  New UBO Analysis
                </div>
                <div className="text-xs text-slate-500">
                  Search by company registration ID
                </div>
              </div>
            </a>
            <a
              href="/history"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors no-underline"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <i
                  className="bi bi-clock-history"
                  style={{ color: "var(--lhb-success)" }}
                ></i>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  View Search History
                </div>
                <div className="text-xs text-slate-500">
                  Review past analyses and results
                </div>
              </div>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors no-underline"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(100,116,139,0.1)" }}
              >
                <i
                  className="bi bi-gear"
                  style={{ color: "var(--lhb-text-secondary)" }}
                ></i>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  System Settings
                </div>
                <div className="text-xs text-slate-500">
                  Manage users, API, and logs
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
            <h5 className="text-sm font-semibold text-slate-700">
              <i className="bi bi-clock-history me-2"></i>Recent Activity
            </h5>
            <a
              href="/history"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </a>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse flex-1"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <i className="bi bi-search text-blue-600 text-xs"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {activity.company_name || activity.registration_id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.user_name} &middot; {activity.ubo_count} UBOs found
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <div className="text-center">
                  <i className="bi bi-clock-history text-4xl mb-2"></i>
                  <p className="text-sm">No activity yet. Start your first analysis!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
