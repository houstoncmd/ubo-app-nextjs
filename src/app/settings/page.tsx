"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { apiFetch } from "@/lib/api-client";
import RolePermissionMatrix from "@/components/RolePermissionMatrix";
import GroupManagement from "@/components/GroupManagement";

interface User {
  id: number;
  name: string;
  employee_id: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string;
}

interface LogEntry {
  id: number;
  user: string;
  action: string;
  details: string;
  time: string;
  ip: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await apiFetch<{ items?: User[] } | User[]>("/api/users");
      if (response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as { items: User[] }).items;
        if (items) setUsers(items);
      }
    } catch {
      // Keep empty array on error
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const response = await apiFetch<{ items?: LogEntry[] } | LogEntry[]>("/api/logs");
      if (response.data) {
        const items = Array.isArray(response.data) ? response.data : (response.data as { items: LogEntry[] }).items;
        if (items) setLogs(items);
      }
    } catch {
      // Keep empty array on error
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "logs") fetchLogs();
  }, [activeTab, fetchUsers, fetchLogs]);

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
              { id: "roles", label: "Roles & Groups", icon: "bi-shield-lock" },
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchUsers}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                      Refresh
                    </button>
                    <button className="lhb-btn-primary flex items-center gap-2">
                      <i className="bi bi-plus-lg"></i>
                      Add User
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="lhb-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Employee ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers ? (
                        // Loading skeleton
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-36"></div></td>
                            <td><div className="h-5 bg-slate-200 rounded-full animate-pulse w-16"></div></td>
                            <td><div className="h-5 bg-slate-200 rounded-full animate-pulse w-14"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-28"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div></td>
                          </tr>
                        ))
                      ) : users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="font-medium text-slate-800">{user.name}</td>
                            <td>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded">{user.employee_id}</code>
                            </td>
                            <td className="text-sm text-slate-500">{user.email || "-"}</td>
                            <td>
                              <span className={`lhb-badge-${user.role === "admin" ? "info" : "success"}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`lhb-badge-${user.is_active ? "success" : "danger"}`}>
                                {user.is_active ? "active" : "inactive"}
                              </span>
                            </td>
                            <td className="text-sm text-slate-500">
                              {user.last_login ? new Date(user.last_login).toLocaleString() : "-"}
                            </td>
                            <td>
                              <button className="text-blue-600 hover:text-blue-800 text-sm mr-3">
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button className="text-red-500 hover:text-red-700 text-sm">
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400">
                            <i className="bi bi-people text-4xl mb-2 block"></i>
                            <p className="text-sm">No users found.</p>
                          </td>
                        </tr>
                      )}
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
                        LDAP authentication is configured via the FastAPI backend.
                        The backend handles LDAP binding and session management.
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Activity Logs</h3>
                  <button
                    onClick={fetchLogs}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                    Refresh
                  </button>
                </div>
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
                      {loadingLogs ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-28"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-20"></div></td>
                            <td><div className="h-5 bg-slate-200 rounded-full animate-pulse w-16"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-40"></div></td>
                            <td><div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div></td>
                          </tr>
                        ))
                      ) : logs.length > 0 ? (
                        logs.map((log) => (
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400">
                            <i className="bi bi-journal-text text-4xl mb-2 block"></i>
                            <p className="text-sm">No activity logs found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Roles & Groups Tab */}
            {activeTab === "roles" && (
              <div className="space-y-8">
                <RolePermissionMatrix />
                <div className="border-t border-slate-200 pt-6">
                  <GroupManagement />
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
                    <span className="text-slate-500">API Backend:</span>
                    <span>FastAPI (Python)</span>
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
