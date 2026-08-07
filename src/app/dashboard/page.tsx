"use client";

import { useEffect, useState } from "react";

const statCards = [
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
    value: "1",
    icon: "bi-people",
    color: "var(--lhb-info)",
    bgColor: "rgba(6,182,212,0.1)",
  },
];

export default function DashboardPage() {
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
            Welcome back, <strong>Admin</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-0">
            <i className="bi bi-envelope me-1"></i>admin@lhb.local
            <span className="mx-1">|</span>
            <i className="bi bi-briefcase me-1"></i>System Administrator
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
                {card.value}
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
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="text-center">
                <i className="bi bi-bar-chart text-4xl mb-2"></i>
                <p className="text-sm">No search data yet. Start your first analysis!</p>
              </div>
            </div>
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
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="text-center">
                <i className="bi bi-calendar-week text-4xl mb-2"></i>
                <p className="text-sm">No activity data yet.</p>
              </div>
            </div>
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
            <div className="flex items-center justify-center py-8 text-slate-400">
              <div className="text-center">
                <i className="bi bi-clock-history text-4xl mb-2"></i>
                <p className="text-sm">No activity yet. Start your first analysis!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
