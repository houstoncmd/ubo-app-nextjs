"use client";

import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Link from "next/link";

// Mock data for dashboard
const stats = [
  {
    title: "Total Searches",
    value: "12,847",
    icon: "bi-search",
    color: "blue" as const,
    change: "+12.5% this month",
    changeType: "up" as const,
  },
  {
    title: "Companies Analyzed",
    value: "8,234",
    icon: "bi-building",
    color: "green" as const,
    change: "+8.3% this month",
    changeType: "up" as const,
  },
  {
    title: "UBOs Identified",
    value: "24,591",
    icon: "bi-person-check",
    color: "amber" as const,
    change: "+15.2% this month",
    changeType: "up" as const,
  },
  {
    title: "Active Sessions",
    value: "47",
    icon: "bi-activity",
    color: "cyan" as const,
    change: "-2.1% vs yesterday",
    changeType: "down" as const,
  },
];

const recentActivity = [
  { id: 1, user: "Somchai P.", action: "Searched", target: "0105546000123", time: "2 min ago", status: "success" },
  { id: 2, user: "Nattaya K.", action: "Searched", target: "0105546000456", time: "5 min ago", status: "success" },
  { id: 3, user: "Prasert M.", action: "Searched", target: "0105546000789", time: "12 min ago", status: "error" },
  { id: 4, user: "Wichai T.", action: "Exported", target: "0105546000321", time: "18 min ago", status: "success" },
  { id: 5, user: "Kannika S.", action: "Searched", target: "0105546000654", time: "25 min ago", status: "success" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-lhb-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your UBO search and analysis activities"
          breadcrumbs={[{ label: "Dashboard" }]}
          actions={
            <Link href="/search" className="lhb-btn-primary flex items-center gap-2">
              <i className="bi bi-plus-lg"></i>
              New Search
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Placeholder */}
          <div className="lg:col-span-2 lhb-card">
            <div className="lhb-card-header flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Search Trends</h3>
              <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="lhb-card-body">
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <i className="bi bi-bar-chart text-4xl text-slate-300 mb-2"></i>
                  <p className="text-slate-500 text-sm">Chart.js integration ready</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Configure backend to display search trend data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lhb-card">
            <div className="lhb-card-header">
              <h3 className="font-semibold text-slate-800">Quick Actions</h3>
            </div>
            <div className="lhb-card-body space-y-3">
              <Link
                href="/search"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i className="bi bi-search text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Search Company</p>
                  <p className="text-xs text-slate-500">Find UBO information</p>
                </div>
              </Link>

              <Link
                href="/history"
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <i className="bi bi-clock-history text-emerald-600"></i>
                </div>
                <div>
                  <p className="font-medium text-slate-800">View History</p>
                  <p className="text-xs text-slate-500">Browse past searches</p>
                </div>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <i className="bi bi-gear text-amber-600"></i>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Settings</p>
                  <p className="text-xs text-slate-500">Configure application</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lhb-card mt-6">
          <div className="lhb-card-header flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
            <Link href="/history" className="text-sm text-blue-600 hover:text-blue-800">
              View all <i className="bi bi-arrow-right ml-1"></i>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="lhb-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-slate-800">{item.user}</td>
                    <td>{item.action}</td>
                    <td>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {item.target}
                      </code>
                    </td>
                    <td>
                      <span
                        className={`lhb-badge-${
                          item.status === "success" ? "success" : "danger"
                        }`}
                      >
                        {item.status === "success" ? "Success" : "Error"}
                      </span>
                    </td>
                    <td className="text-slate-500">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
