"use client";

import { use } from "react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

// Mock data for the result page
const mockCompanyData = {
  registrationId: "0105546000123",
  companyName: "SCG Chemicals Co., Ltd.",
  companyNameEn: "SCG Chemicals Co., Ltd.",
  companyNameTh: "บริษัท เอสซีจี เคมิคอลส์ จำกัด",
  status: "Active",
  registrationDate: "1988-03-15",
  address: "1 Siam Cement Road, Bangsue, Bangkok 10800",
  shareholders: [
    { name: "Siam Cement Public Co., Ltd.", shares: 45000000, percentage: 45.0, type: "Corporate" },
    { name: "SCG International Corp.", shares: 25000000, percentage: 25.0, type: "Corporate" },
    { name: "Charoen Pokphand Group", shares: 15000000, percentage: 15.0, type: "Corporate" },
    { name: "Public Float", shares: 15000000, percentage: 15.0, type: "Public" },
  ],
  ubos: [
    {
      name: "Dhanin Chearavanont",
      nationality: "Thai",
      ownership: 28.5,
      reason: "Ultimate beneficial owner through Charoen Pokphand Group",
    },
    {
      name: "Siam Cement Group",
      nationality: "Thai",
      ownership: 45.0,
      reason: "Largest shareholder with direct 45% ownership",
    },
    {
      name: "SCG International Corp.",
      nationality: "Thailand",
      ownership: 25.0,
      reason: "Significant shareholder with 25% ownership",
    },
  ],
  totalShares: 100000000,
  paidUpCapital: "10,000,000,000 THB",
};

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-lhb-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Company Analysis"
          subtitle={`Results for registration ID: ${id}`}
          breadcrumbs={[
            { label: "Search", href: "/search" },
            { label: `Result: ${id}` },
          ]}
          actions={
            <div className="flex gap-2">
              <button className="lhb-btn-secondary flex items-center gap-2">
                <i className="bi bi-download"></i>
                Export PDF
              </button>
              <Link href="/search" className="lhb-btn-primary flex items-center gap-2">
                <i className="bi bi-search"></i>
                New Search
              </Link>
            </div>
          }
        />

        {/* Company Header Card */}
        <div className="lhb-card mb-6">
          <div className="lhb-card-body">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-800">
                    {mockCompanyData.companyName}
                  </h2>
                  <span className="lhb-badge-success">
                    <i className="bi bi-check-circle mr-1"></i>
                    {mockCompanyData.status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{mockCompanyData.companyNameTh}</p>
                <p className="text-slate-500 text-sm mt-1">
                  <i className="bi bi-geo-alt mr-1"></i>
                  {mockCompanyData.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Registration ID</p>
                <code className="text-lg font-mono font-bold text-slate-800">
                  {mockCompanyData.registrationId}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lhb-stat-card">
            <div className="lhb-stat-icon bg-blue-100 text-blue-600">
              <i className="bi bi-calendar3 text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500">Registered</p>
              <p className="text-lg font-bold text-slate-800">
                {mockCompanyData.registrationDate}
              </p>
            </div>
          </div>
          <div className="lhb-stat-card">
            <div className="lhb-stat-icon bg-emerald-100 text-emerald-600">
              <i className="bi bi-stack text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Shares</p>
              <p className="text-lg font-bold text-slate-800">
                {mockCompanyData.totalShares.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="lhb-stat-card">
            <div className="lhb-stat-icon bg-amber-100 text-amber-600">
              <i className="bi bi-cash-stack text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500">Paid-up Capital</p>
              <p className="text-lg font-bold text-slate-800">
                {mockCompanyData.paidUpCapital}
              </p>
            </div>
          </div>
          <div className="lhb-stat-card">
            <div className="lhb-stat-icon bg-cyan-100 text-cyan-600">
              <i className="bi bi-person-check text-xl"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500">UBOs Identified</p>
              <p className="text-lg font-bold text-slate-800">
                {mockCompanyData.ubos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shareholders Table */}
          <div className="lhb-card">
            <div className="lhb-card-header">
              <h3 className="font-semibold text-slate-800">Shareholders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="lhb-table">
                <thead>
                  <tr>
                    <th>Shareholder</th>
                    <th>Type</th>
                    <th>Shares</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCompanyData.shareholders.map((sh, index) => (
                    <tr key={index}>
                      <td className="font-medium text-slate-800">{sh.name}</td>
                      <td>
                        <span className={`lhb-badge-${sh.type === "Corporate" ? "info" : "success"}`}>
                          {sh.type}
                        </span>
                      </td>
                      <td className="font-mono text-sm">
                        {sh.shares.toLocaleString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${sh.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{sh.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ownership Graph Placeholder */}
          <div className="lhb-card">
            <div className="lhb-card-header">
              <h3 className="font-semibold text-slate-800">Ownership Graph</h3>
            </div>
            <div className="lhb-card-body">
              <div className="h-80 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <i className="bi bi-diagram-3 text-5xl text-slate-300 mb-3"></i>
                  <p className="text-slate-500 font-medium">vis-network graph ready</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Interactive ownership visualization
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Will display company → shareholders → UBOs hierarchy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UBO Cards */}
        <div className="lhb-card mt-6">
          <div className="lhb-card-header">
            <h3 className="font-semibold text-slate-800">
              <i className="bi bi-person-check mr-2 text-emerald-600"></i>
              Ultimate Beneficial Owners (UBOs)
            </h3>
          </div>
          <div className="lhb-card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCompanyData.ubos.map((ubo, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <i className="bi bi-person text-xl text-slate-600"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{ubo.name}</p>
                        <p className="text-xs text-slate-500">{ubo.nationality}</p>
                      </div>
                    </div>
                    <span className="lhb-badge-success text-lg font-bold">
                      {ubo.ownership}%
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Identification Reason</p>
                    <p className="text-sm text-slate-700">{ubo.reason}</p>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${ubo.ownership}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
