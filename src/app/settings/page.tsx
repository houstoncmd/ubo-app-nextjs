"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

const mockUsers = [
  { id: 1, name: "Somchai Prasert", employeeId: "EMP001", role: "Admin", status: "active", lastLogin: "2024-01-15 14:30" },
  { id: 2, name: "Nattaya Kriangkrai", employeeId: "EMP002", role: "User", status: "active", lastLogin: "2024-01-15 13:45" },
  { id: 3, name: "Prasert Meesuk", employeeId: "EMP003", role: "User", status: "active", lastLogin: "2024-01-14 09:20" },
  { id: 4, name: "Wichai Thongdee", employeeId: "EMP004", role: "Viewer", status: "inactive", lastLogin: "2024-01-10 16:15" },
];

const mockLogs = [
  { id: 1, user: "somchai.p", action: "Login", details: "Successful LDAP authentication", time: "2024-01-15 14:30", ip: "10.0.1.100" },
  { id: 2, user: "nattaya.k", action: "Search", details: "Searched company 0105546000456", time: "2024-01-15 13:45", ip: "10.0.1.101" },
  { id: 3, user: "prasert.m", action: "Failed Login", details: "Invalid password attempt", time: "2024-01-15 12:20", ip: "10.0.1.102" },
  { id: 4, user: "wichai.t", action: "Export", details: "Exported results for 0105546000321", time: "2024-01-15 11:10", ip: "10.0.1.103" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-lhb-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Settings"
          subtitle="Manage application configuration and access"
          breadcrumbs={[{ label: "Settings" }]}
        />

        {/* Tabs */}
        <div className="lhb-card">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {[
              { id: "users", label: "User Access", icon: "bi-people" },
              { id: "api", label: "API Config", icon: "bi-plug" },
              { id: "auth", label: "Authentication", icon: "bi-shield-lock" },
              { id: "logs", label: "Activity Logs", icon: "bi-journal-text" },
              { id: "env", label: "Environment", icon: "bi-laptop" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`lhb-tab flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? "lhb-tab-active" : "lhb-tab-inactive"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`bi ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lhb-card-body">
            {/* User Access Tab */}
            {activeTab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">User Access Management</h3>
                  <button className="lhb-btn-primary flex items-center gap-2">
                    <i className="bi bi-plus-lg"></i>
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="lhb-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Employee ID</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="font-medium text-slate-800">{user.name}</td>
                          <td><code className="text-xs bg-slate-100 px-2 py-1 rounded">{user.employeeId}</code></td>
                          <td>
                            <span className={`lhb-badge-${user.role === "Admin" ? "info" : "success"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`lhb-badge-${user.status === "active" ? "success" : "danger"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="text-sm text-slate-500">{user.lastLogin}</td>
                          <td>
                            <button className="text-blue-600 hover:text-blue-800 text-sm mr-3">
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button className="text-red-500 hover:text-red-700 text-sm">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* API Config Tab */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">API Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="lhb-label">Backend API URL</label>
                    <input type="text" className="lhb-input" defaultValue="http://localhost:8000" />
                    <p className="text-xs text-slate-500 mt-1">FastAPI backend endpoint</p>
                  </div>
                  <div>
                    <label className="lhb-label">Request Timeout (seconds)</label>
                    <input type="number" className="lhb-input" defaultValue="30" />
                  </div>
                  <div>
                    <label className="lhb-label">Max Retries</label>
                    <input type="number" className="lhb-input" defaultValue="3" />
                  </div>
                  <div>
                    <label className="lhb-label">Rate Limit (requests/minute)</label>
                    <input type="number" className="lhb-input" defaultValue="60" />
                  </div>
                </div>
                <button className="lhb-btn-primary">
                  <i className="bi bi-check-lg mr-2"></i>
                  Save Configuration
                </button>
              </div>
            )}

            {/* Authentication Tab */}
            {activeTab === "auth" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Authentication Settings</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="bi bi-exclamation-triangle text-amber-600 mt-0.5"></i>
                    <div>
                      <p className="font-medium text-amber-800">LDAP Authentication</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Better Auth with LDAP plugin is configured but requires backend connection.
                        Configure the LDAP server settings below.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="lhb-label">LDAP Server URL</label>
                    <input type="text" className="lhb-input" defaultValue="ldap://ldap.example.com:389" />
                  </div>
                  <div>
                    <label className="lhb-label">LDAP Bind DN</label>
                    <input type="text" className="lhb-input" defaultValue="cn=admin,dc=example,dc=com" />
                  </div>
                  <div>
                    <label className="lhb-label">LDAP Search Base</label>
                    <input type="text" className="lhb-input" defaultValue="dc=example,dc=com" />
                  </div>
                  <div>
                    <label className="lhb-label">LDAP Search Filter</label>
                    <input type="text" className="lhb-input" defaultValue="(uid={{username}})" />
                  </div>
                </div>
                <button className="lhb-btn-primary">
                  <i className="bi bi-check-lg mr-2"></i>
                  Save Authentication Settings
                </button>
              </div>
            )}

            {/* Activity Logs Tab */}
            {activeTab === "logs" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Activity Logs</h3>
                <div className="overflow-x-auto">
                  <table className="lhb-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="text-sm text-slate-500">{log.time}</td>
                          <td className="font-medium">{log.user}</td>
                          <td>
                            <span className={`lhb-badge-${
                              log.action.includes("Failed") ? "danger" : "info"
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="text-sm text-slate-600">{log.details}</td>
                          <td className="text-sm text-slate-500 font-mono">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Environment Tab */}
            {activeTab === "env" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Environment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="lhb-label">Application Name</label>
                    <input type="text" className="lhb-input" defaultValue="UBO Application" />
                  </div>
                  <div>
                    <label className="lhb-label">Application Version</label>
                    <input type="text" className="lhb-input" defaultValue="0.1.0" readOnly />
                  </div>
                  <div>
                    <label className="lhb-label">Default Language</label>
                    <select className="lhb-input" defaultValue="en">
                      <option value="en">English</option>
                      <option value="th">Thai</option>
                    </select>
                  </div>
                  <div>
                    <label className="lhb-label">Session Timeout (minutes)</label>
                    <input type="number" className="lhb-input" defaultValue="30" />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-2">System Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-500">Next.js Version:</span>
                    <span>14.2.x</span>
                    <span className="text-slate-500">Node.js:</span>
                    <span>20.x</span>
                    <span className="text-slate-500">Build:</span>
                    <span>Standalone (Docker)</span>
                  </div>
                </div>
                <button className="lhb-btn-primary">
                  <i className="bi bi-check-lg mr-2"></i>
                  Save Environment Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
