"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { apiFetch } from "@/lib/api-client";
import RolePermissionMatrix from "@/components/RolePermissionMatrix";
import GroupManagement from "@/components/GroupManagement";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface User {
  id?: number;
  employee_id: string;
  name: string;
  email?: string;
  position?: string;
  role: string;
  role_display?: string;
  role_color?: string;
  groups?: string[];
  status: string;
  last_login?: string;
}

interface LogEntry {
  id: number;
  employee_id?: string;
  user?: string;
  action: string;
  category?: string;
  details: string;
  status?: string;
  created_at?: string;
  time?: string;
  ip_address?: string;
  ip?: string;
  duration_ms?: number;
}

interface SettingsConfig {
  api_url?: string;
  api_timeout?: number;
  api_key?: string;
  soap_action?: string;
  soap_ns_env?: string;
  soap_ns_view?: string;
  soap_content_type?: string;
  soap_language?: string;
  soap_body_template?: string;
  custom_headers?: Record<string, string>;
  ldap_server?: string;
  ldap_bind_dn?: string;
  ldap_search_base?: string;
  ldap_search_filter?: string;
  session_timeout?: number;
  app_name?: string;
  app_version?: string;
  default_language?: string;
  env_ubo_api?: string;
  env_ubo_api_key?: string;
  env_ubo_api_timeout?: number;
  env_ubo_api_env?: string;
}

/* ------------------------------------------------------------------ */
/*  Role helpers                                                       */
/* ------------------------------------------------------------------ */

const ROLES = ["maker", "checker", "monitor", "admin", "root"] as const;
const ROLE_LABELS: Record<string, string> = {
  maker: "Maker",
  checker: "Checker",
  monitor: "Monitor",
  admin: "Admin",
  root: "Root",
};
const ROLE_COLORS: Record<string, string> = {
  maker: "#2563eb",
  checker: "#7c3aed",
  monitor: "#0891b2",
  admin: "#dc2626",
  root: "#b45309",
};

function roleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
    case "root":
      return "badge-danger";
    case "checker":
      return "badge-info";
    case "monitor":
      return "badge-warning";
    default:
      return "badge-success";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  /* ---- Tab state ---- */
  const [activeTab, setActiveTab] = useState("users");

  /* ---- Users ---- */
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");

  /* ---- Modals ---- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  /* ---- Add User form ---- */
  const [addForm, setAddForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    position: "",
    role: "maker",
    status: "active",
  });
  const [addError, setAddError] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  /* ---- Edit User form ---- */
  const [editForm, setEditForm] = useState({
    role: "maker",
    status: "active",
  });
  const [editStatusConfirm, setEditStatusConfirm] = useState(false);
  const [editStatusConfirmInput, setEditStatusConfirmInput] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  /* ---- Delete user ---- */
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  /* ---- Import Excel ---- */
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    parsed: number;
    inserted: number;
    updated: number;
    failed: number;
    errors?: string[];
  } | null>(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);

  /* ---- Logs ---- */
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logSearch, setLogSearch] = useState("");
  const [logActionFilter, setLogActionFilter] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(50);

  /* ---- API Config ---- */
  const [apiConfig, setApiConfig] = useState<Partial<SettingsConfig>>({});
  const [loadingApiConfig, setLoadingApiConfig] = useState(true);
  const [savingApiConfig, setSavingApiConfig] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [apiTesting, setApiTesting] = useState(false);

  /* ---- Auth Config ---- */
  const [authConfig, setAuthConfig] = useState<Partial<SettingsConfig>>({});
  const [savingAuth, setSavingAuth] = useState(false);

  /* ---- Env Config ---- */
  const [envConfig, setEnvConfig] = useState<Partial<SettingsConfig>>({
    env_ubo_api_env: "DEV",
  });
  const [savingEnv, setSavingEnv] = useState(false);

  /* ================================================================= */
  /*  Data Fetching                                                     */
  /* ================================================================= */

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await apiFetch<{ items?: User[] } | User[]>(
        "/api/users"
      );
      if (response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as { items: User[] }).items;
        if (items) setUsers(items);
      }
    } catch {
      /* empty */
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const response = await apiFetch<{ items?: LogEntry[] } | LogEntry[]>(
        "/api/logs"
      );
      if (response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as { items: LogEntry[] }).items;
        if (items) setLogs(items);
      }
    } catch {
      /* empty */
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingApiConfig(true);
    try {
      const response = await apiFetch<SettingsConfig>("/api/settings");
      if (response.data) {
        setApiConfig(response.data);
        setAuthConfig(response.data);
        setEnvConfig((prev) => ({ ...prev, ...response.data }));
      }
    } catch {
      /* empty */
    } finally {
      setLoadingApiConfig(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "logs") fetchLogs();
    if (activeTab === "api" || activeTab === "auth" || activeTab === "env")
      fetchSettings();
  }, [activeTab, fetchUsers, fetchLogs, fetchSettings]);

  /* ================================================================= */
  /*  Users: Filtered list                                              */
  /* ================================================================= */

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch =
      !q ||
      u.employee_id.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.position || "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    const matchRole = !userRoleFilter || u.role === userRoleFilter;
    const matchStatus = !userStatusFilter || u.status === userStatusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  /* ================================================================= */
  /*  Users: CRUD handlers                                              */
  /* ================================================================= */

  async function handleAddUser() {
    if (!addForm.employee_id.trim() || !addForm.name.trim()) {
      setAddError("Employee ID and Name are required.");
      return;
    }
    setSavingAdd(true);
    setAddError("");
    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(addForm),
      });
      if (res.error) {
        setAddError(res.error);
      } else {
        setShowAddModal(false);
        setAddForm({
          employee_id: "",
          name: "",
          email: "",
          position: "",
          role: "maker",
          status: "active",
        });
        fetchUsers();
      }
    } catch {
      setAddError("Failed to add user.");
    } finally {
      setSavingAdd(false);
    }
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setEditForm({ role: user.role, status: user.status });
    setEditStatusConfirm(false);
    setEditStatusConfirmInput("");
    setEditError("");
    setShowEditModal(true);
  }

  async function handleEditUser() {
    if (!editingUser) return;
    if (
      editForm.status !== editingUser.status &&
      editStatusConfirmInput !== "confirmed"
    ) {
      setEditError('Type "confirmed" to confirm status change.');
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await apiFetch(`/api/users/${editingUser.employee_id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      if (res.error) {
        setEditError(res.error);
      } else {
        setShowEditModal(false);
        fetchUsers();
      }
    } catch {
      setEditError("Failed to update user.");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDeleteModal(user: User) {
    setDeletingUser(user);
    setShowDeleteModal(true);
  }

  async function handleDeleteUser() {
    if (!deletingUser) return;
    try {
      await apiFetch(`/api/users/${deletingUser.employee_id}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      setDeletingUser(null);
      fetchUsers();
    } catch {
      /* empty */
    }
  }

  async function handleExportUsers() {
    try {
      const res = await apiFetch("/api/users/export");
      if (res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users_export.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* empty */
    }
  }

  async function handleImportExcel() {
    if (!importFile) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await apiFetch("/api/users/import", {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (res.error) {
        setImportError(res.error);
      } else if (res.data) {
        setImportResult(
          res.data as {
            parsed: number;
            inserted: number;
            updated: number;
            failed: number;
            errors?: string[];
          }
        );
        fetchUsers();
      }
    } catch {
      setImportError("Failed to import users.");
    } finally {
      setImporting(false);
    }
  }

  /* ================================================================= */
  /*  Logs: Filtered + Paginated                                        */
  /* ================================================================= */

  const filteredLogs = logs.filter((l) => {
    const q = logSearch.toLowerCase();
    const matchSearch =
      !q ||
      (l.user || l.employee_id || "").toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      (l.ip_address || l.ip || "").toLowerCase().includes(q);
    const matchAction = !logActionFilter || l.action === logActionFilter;
    const matchCategory =
      !logCategoryFilter || (l.category || "") === logCategoryFilter;
    const matchStatus =
      !logStatusFilter || (l.status || "") === logStatusFilter;
    return matchSearch && matchAction && matchCategory && matchStatus;
  });

  const logTotalPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));
  const paginatedLogs = filteredLogs.slice(
    (logPage - 1) * logPageSize,
    logPage * logPageSize
  );

  const logActions = Array.from(new Set(logs.map((l) => l.action))).sort();
  const logCategories = Array.from(
    new Set(logs.map((l) => l.category || "").filter(Boolean))
  ).sort();

  /* ================================================================= */
  /*  API Config: Save                                                 */
  /* ================================================================= */

  async function handleSaveApiConfig() {
    setSavingApiConfig(true);
    try {
      const res = await apiFetch("/api/settings/api", {
        method: "POST",
        body: JSON.stringify(apiConfig),
      });
      if (!res.error) {
        /* saved */
      }
    } catch {
      /* empty */
    } finally {
      setSavingApiConfig(false);
    }
  }

  async function handleTestApi() {
    setApiTesting(true);
    setApiTestResult(null);
    try {
      const res = await apiFetch<{ result?: string; error?: string }>(
        "/api/settings/api/test"
      );
      if (res.data) {
        setApiTestResult(
          typeof res.data === "string"
            ? res.data
            : res.data.result || JSON.stringify(res.data, null, 2)
        );
      } else if (res.error) {
        setApiTestResult(`Error: ${res.error}`);
      }
    } catch {
      setApiTestResult("Connection failed.");
    } finally {
      setApiTesting(false);
    }
  }

  async function handleSaveAuthConfig() {
    setSavingAuth(true);
    try {
      await apiFetch("/api/settings/auth", {
        method: "POST",
        body: JSON.stringify(authConfig),
      });
    } catch {
      /* empty */
    } finally {
      setSavingAuth(false);
    }
  }

  async function handleSaveEnvConfig() {
    setSavingEnv(true);
    try {
      await apiFetch("/api/settings/environment", {
        method: "POST",
        body: JSON.stringify(envConfig),
      });
    } catch {
      /* empty */
    } finally {
      setSavingEnv(false);
    }
  }

  /* ================================================================= */
  /*  Render helpers                                                    */
  /* ================================================================= */

  function renderModalOverlay(
    show: boolean,
    onClose: () => void,
    children: React.ReactNode
  ) {
    if (!show) return null;
    return (
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  }

  /* ================================================================= */
  /*  Tab definitions                                                   */
  /* ================================================================= */

  const tabs = [
    { id: "users", label: "User Access", icon: "bi-people" },
    { id: "api", label: "API Configuration", icon: "bi-plug" },
    { id: "auth", label: "Authentication", icon: "bi-shield-lock" },
    { id: "logs", label: "Activity Logs", icon: "bi-journal-text" },
    { id: "env", label: "Environment", icon: "bi-diagram-3" },
    { id: "roles", label: "Roles & Groups", icon: "bi-shield-lock" },
  ];

  /* ================================================================= */
  /*  Main Render                                                       */
  /* ================================================================= */

  return (
    <div className="min-h-screen bg-lhb-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Settings"
          subtitle="Manage system configuration, users, and access controls."
          breadcrumbs={[{ label: "Settings" }]}
        />

        {/* ============ Card Wrapper ============ */}
        <div className="lhb-card fade-in">
          {/* ---- Tab Navigation ---- */}
          <div className="lhb-card-header p-0 border-b border-slate-200">
            <ul className="nav-tabs-enterprise flex overflow-x-auto">
              {tabs.map((tab) => (
                <li key={tab.id} className="nav-item">
                  <button
                    className={`nav-link flex items-center gap-2 whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`bi ${tab.icon}`}></i>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Tab Content ---- */}
          <div className="lhb-card-body">
            {/* ========================================================== */}
            {/*  TAB: User Access                                          */}
            {/* ========================================================== */}
            {activeTab === "users" && (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-semibold flex items-center gap-2">
                    <i className="bi bi-people"></i>
                    User Access Management
                    <span className="badge bg-secondary text-xs font-normal">
                      {filteredUsers.length}
                    </span>
                  </h6>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-outline-enterprise text-sm"
                      onClick={handleExportUsers}
                    >
                      <i className="bi bi-download me-1"></i> Export Users
                    </button>
                    <button
                      className="btn-outline-success-enterprise text-sm"
                      onClick={() => setShowImportModal(true)}
                    >
                      <i className="bi bi-upload me-1"></i> Import Excel
                    </button>
                    <button
                      className="btn-primary-enterprise text-sm"
                      onClick={() => {
                        setAddForm({
                          employee_id: "",
                          name: "",
                          email: "",
                          position: "",
                          role: "maker",
                          status: "active",
                        });
                        setAddError("");
                        setShowAddModal(true);
                      }}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Add User
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      className="form-control-sm-custom"
                      placeholder="Search by ID, name, position, role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Role
                    </label>
                    <select
                      className="form-select-sm-custom"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="">All Roles</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Status
                    </label>
                    <select
                      className="form-select-sm-custom"
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn-primary-enterprise btn-sm-custom w-full"
                      onClick={() => {
                        /* re-filter is automatic via state */
                      }}
                    >
                      <i className="bi bi-funnel me-1"></i> Filter
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn-outline-secondary-enterprise btn-sm-custom w-full"
                      onClick={() => {
                        setUserSearch("");
                        setUserRoleFilter("");
                        setUserStatusFilter("");
                      }}
                    >
                      <i className="bi bi-x-circle me-1"></i> Reset
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="table-enterprise">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 60 }}>#</th>
                        <th className="sortable" style={{ minWidth: 100 }}>
                          Employee ID
                        </th>
                        <th className="sortable" style={{ minWidth: 140 }}>
                          Name
                        </th>
                        <th className="sortable" style={{ minWidth: 160 }}>
                          Email
                        </th>
                        <th className="sortable" style={{ minWidth: 90 }}>
                          Role
                        </th>
                        <th style={{ minWidth: 100 }}>Groups</th>
                        <th className="sortable" style={{ minWidth: 80 }}>
                          Status
                        </th>
                        <th style={{ width: 100 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j}>
                                <div className="h-4 bg-slate-200 rounded animate-pulse w-full max-w-[100px]"></div>
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((u, idx) => (
                          <tr key={u.employee_id || idx}>
                            <td className="text-slate-400 text-sm">
                              {idx + 1}
                            </td>
                            <td>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {u.employee_id}
                              </code>
                            </td>
                            <td className="font-medium text-slate-800">
                              {u.name}
                            </td>
                            <td className="text-sm text-slate-500">
                              {u.email || "-"}
                            </td>
                            <td>
                              <span
                                className={`badge ${roleBadgeClass(u.role)} inline-flex items-center gap-1`}
                              >
                                <i className="bi bi-shield text-[0.65rem]"></i>
                                {ROLE_LABELS[u.role] || u.role}
                              </span>
                            </td>
                            <td>
                              {u.groups && u.groups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {u.groups.map((g, gi) => (
                                    <span
                                      key={gi}
                                      className="badge bg-slate-100 text-slate-600 text-[0.65rem]"
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-sm">
                                  -
                                </span>
                              )}
                            </td>
                            <td>
                              {u.status === "active" ? (
                                <span className="flex items-center gap-1.5 text-sm">
                                  <span className="status-dot online"></span>{" "}
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                                  <span
                                    className="status-dot"
                                    style={{ background: "#94a3b8" }}
                                  ></span>{" "}
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <button
                                  className="btn-icon-sm"
                                  title="Edit User"
                                  onClick={() => openEditModal(u)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn-icon-sm btn-icon-danger"
                                  title="Delete User"
                                  onClick={() => openDeleteModal(u)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-8">
                            <div className="text-slate-400">
                              <i className="bi bi-people text-4xl block mb-2"></i>
                              <p className="text-sm">No users found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Info Alert */}
                <div className="alert-enterprise alert-info flex items-center gap-2 mt-3">
                  <i className="bi bi-info-circle"></i>
                  <span className="text-sm">
                    Users are authenticated via Active Directory (LDAP). User
                    list is populated from login activity logs.
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/*  TAB: API Configuration                                     */}
            {/* ========================================================== */}
            {activeTab === "api" && (
              <div>
                <h6 className="font-semibold mb-3 flex items-center gap-2">
                  <i className="bi bi-plug"></i>Enlite API Configuration
                </h6>

                {/* Basic Settings Card */}
                <div className="border border-slate-200 rounded-lg mb-3">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <i className="bi bi-gear"></i> Basic Settings
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="form-label text-sm">API URL</label>
                      <div className="input-group-custom">
                        <span className="input-group-text-custom">
                          <i className="bi bi-link-45deg"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control-custom flex-1"
                          value={apiConfig.api_url || ""}
                          onChange={(e) =>
                            setApiConfig({
                              ...apiConfig,
                              api_url: e.target.value,
                            })
                          }
                          placeholder="http://localhost:8080/enlitews/companyData"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="form-label text-sm">Timeout</label>
                        <div className="input-group-custom">
                          <span className="input-group-text-custom">
                            <i className="bi bi-clock"></i>
                          </span>
                          <input
                            type="number"
                            className="form-control-custom flex-1"
                            value={apiConfig.api_timeout || 30}
                            onChange={(e) =>
                              setApiConfig({
                                ...apiConfig,
                                api_timeout: parseInt(e.target.value) || 30,
                              })
                            }
                            min={5}
                            max={120}
                          />
                          <span className="input-group-text-custom">
                            seconds
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="form-label text-sm">API Key</label>
                        <div className="input-group-custom">
                          <span className="input-group-text-custom">
                            <i className="bi bi-key"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control-custom flex-1"
                            value={apiConfig.api_key || ""}
                            onChange={(e) =>
                              setApiConfig({
                                ...apiConfig,
                                api_key: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SOAP Configuration Card */}
                <div className="border border-slate-200 rounded-lg mb-3">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <i className="bi bi-filetype-xml"></i> SOAP Configuration
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="form-label text-sm">
                          SOAP Action
                        </label>
                        <input
                          type="text"
                          className="form-control-custom"
                          value={apiConfig.soap_action || "getDataEnlite"}
                          onChange={(e) =>
                            setApiConfig({
                              ...apiConfig,
                              soap_action: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label text-sm">
                          Namespace Env
                        </label>
                        <input
                          type="text"
                          className="form-control-custom text-xs"
                          value={
                            apiConfig.soap_ns_env ||
                            "http://schemas.xmlsoap.org/soap/envelope/"
                          }
                          onChange={(e) =>
                            setApiConfig({
                              ...apiConfig,
                              soap_ns_env: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label text-sm">
                          Namespace View
                        </label>
                        <input
                          type="text"
                          className="form-control-custom text-xs"
                          value={
                            apiConfig.soap_ns_view || "http://view.bol.com/"
                          }
                          onChange={(e) =>
                            setApiConfig({
                              ...apiConfig,
                              soap_ns_view: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="form-label text-sm">
                          Content Type
                        </label>
                        <input
                          type="text"
                          className="form-control-custom"
                          value={
                            apiConfig.soap_content_type ||
                            "text/xml;charset=UTF-8"
                          }
                          onChange={(e) =>
                            setApiConfig({
                              ...apiConfig,
                              soap_content_type: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label text-sm">
                          Default Language
                        </label>
                        <select
                          className="form-select-custom"
                          value={apiConfig.soap_language || "TH"}
                          onChange={(e) =>
                            setApiConfig({
                              ...apiConfig,
                              soap_language: e.target.value,
                            })
                          }
                        >
                          <option value="TH">TH</option>
                          <option value="EN">EN</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SOAP Body Template Card */}
                <div className="border border-slate-200 rounded-lg mb-3">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <i className="bi bi-code-slash"></i> SOAP Body Template
                    </span>
                    <button
                      className="btn-outline-secondary-enterprise text-xs"
                      onClick={() =>
                        setApiConfig({ ...apiConfig, soap_body_template: "" })
                      }
                    >
                      <i className="bi bi-arrow-counterclockwise"></i> Reset
                    </button>
                  </div>
                  <div className="p-4">
                    <textarea
                      className="form-control-custom font-mono text-xs"
                      rows={8}
                      style={{
                        whiteSpace: "pre",
                        overflowWrap: "normal",
                        overflowX: "auto",
                      }}
                      value={apiConfig.soap_body_template || ""}
                      onChange={(e) =>
                        setApiConfig({
                          ...apiConfig,
                          soap_body_template: e.target.value,
                        })
                      }
                      placeholder="Leave empty to use default SOAP body template."
                    />
                    <small className="text-slate-500 mt-1 block">
                      Available placeholders:{" "}
                      <code>{"{registration_id}"}</code>,{" "}
                      <code>{"{language}"}</code>, <code>{"{action}"}</code>,{" "}
                      <code>{"{ns_env}"}</code>, <code>{"{ns_view}"}</code>
                    </small>
                  </div>
                </div>

                {/* Test Connection Card */}
                <div className="border border-slate-200 rounded-lg mb-3">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <i className="bi bi-lightning"></i> Test Connection
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        className="btn-primary-enterprise text-sm"
                        onClick={handleTestApi}
                        disabled={apiTesting}
                      >
                        <i className="bi bi-send me-1"></i>{" "}
                        {apiTesting ? "Testing..." : "Send Test Request"}
                      </button>
                      <span className="text-sm text-slate-500">
                        Click to test the API with current configuration.
                      </span>
                    </div>
                    {apiTestResult && (
                      <pre className="border rounded p-2 bg-slate-900 text-green-400 text-xs overflow-auto max-h-[300px] mt-2">
                        {apiTestResult}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Save / Reset */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-slate-500"></span>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline-secondary-enterprise text-sm"
                      onClick={() => fetchSettings()}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                      Reset to Defaults
                    </button>
                    <button
                      className="btn-primary-enterprise text-sm"
                      onClick={handleSaveApiConfig}
                      disabled={savingApiConfig}
                    >
                      <i className="bi bi-check2 me-1"></i>{" "}
                      {savingApiConfig ? "Saving..." : "Save Configuration"}
                    </button>
                  </div>
                </div>

                <div className="alert-enterprise alert-info flex items-center gap-2 mt-3">
                  <i className="bi bi-info-circle"></i>
                  <span className="text-sm">
                    Changes are saved and take effect immediately.
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/*  TAB: Authentication                                        */}
            {/* ========================================================== */}
            {activeTab === "auth" && (
              <div>
                <h6 className="font-semibold mb-3 flex items-center gap-2">
                  <i className="bi bi-shield-lock"></i>Authentication Settings
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Session Config */}
                  <div className="border border-slate-200 rounded-lg">
                    <div className="p-4">
                      <h6 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <i className="bi bi-clock-history"></i>
                        Session Configuration
                      </h6>
                      <div className="space-y-3">
                        <div>
                          <label className="form-label text-sm">
                            Session Timeout
                          </label>
                          <div className="input-group-custom">
                            <span className="input-group-text-custom">
                              <i className="bi bi-hourglass-split"></i>
                            </span>
                            <input
                              type="number"
                              className="form-control-custom flex-1"
                              value={authConfig.session_timeout || 30}
                              readOnly
                            />
                            <span className="input-group-text-custom">
                              seconds
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="form-label text-sm">
                            Session Store
                          </label>
                          <div className="input-group-custom">
                            <span className="input-group-text-custom">
                              <i className="bi bi-database"></i>
                            </span>
                            <div className="form-control-custom bg-slate-50 text-slate-500">
                              In-Memory
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SSO / Azure AD */}
                  <div className="border border-slate-200 rounded-lg">
                    <div className="p-4">
                      <h6 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <i className="bi bi-microsoft"></i>
                        SSO / Azure AD
                      </h6>
                      <div className="space-y-3">
                        <div>
                          <label className="form-label text-sm">Status</label>
                          <div className="input-group-custom">
                            <span className="input-group-text-custom">
                              <i className="bi bi-shield-check"></i>
                            </span>
                            <div className="form-control-custom bg-amber-50 text-amber-600">
                              <i className="bi bi-exclamation-triangle me-1"></i>{" "}
                              Not Configured
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="form-label text-sm">Provider</label>
                          <div className="input-group-custom">
                            <span className="input-group-text-custom">
                              <i className="bi bi-building"></i>
                            </span>
                            <div className="form-control-custom bg-slate-50">
                              Microsoft Entra ID (Placeholder)
                            </div>
                          </div>
                        </div>
                        <div className="alert-enterprise alert-info flex items-center gap-2 text-sm mb-0">
                          <i className="bi bi-check-circle"></i>
                          <span>
                            Active Directory (LDAP) authentication is configured
                            and active.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save */}
                <div className="flex justify-end mt-4">
                  <button
                    className="btn-primary-enterprise text-sm"
                    onClick={handleSaveAuthConfig}
                    disabled={savingAuth}
                  >
                    <i className="bi bi-check2 me-1"></i>{" "}
                    {savingAuth ? "Saving..." : "Save Authentication Settings"}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/*  TAB: Activity Logs                                         */}
            {/* ========================================================== */}
            {activeTab === "logs" && (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-semibold flex items-center gap-2">
                    <i className="bi bi-journal-text"></i>Activity Logs
                    <span className="badge bg-secondary text-xs font-normal">
                      {filteredLogs.length}
                    </span>
                  </h6>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-outline-primary-enterprise text-sm"
                      onClick={() => {
                        const blob = new Blob(
                          [JSON.stringify(filteredLogs, null, 2)],
                          { type: "application/json" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "activity_logs.json";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <i className="bi bi-download me-1"></i> Export to Excel
                    </button>
                    <button
                      className="btn-outline-secondary-enterprise text-sm"
                      onClick={fetchLogs}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-8 gap-2 mb-3">
                  <div>
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      className="form-control-sm-custom"
                      placeholder="Search all fields..."
                      value={logSearch}
                      onChange={(e) => {
                        setLogSearch(e.target.value);
                        setLogPage(1);
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Action
                    </label>
                    <select
                      className="form-select-sm-custom"
                      value={logActionFilter}
                      onChange={(e) => {
                        setLogActionFilter(e.target.value);
                        setLogPage(1);
                      }}
                    >
                      <option value="">All Actions</option>
                      {logActions.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Category
                    </label>
                    <select
                      className="form-select-sm-custom"
                      value={logCategoryFilter}
                      onChange={(e) => {
                        setLogCategoryFilter(e.target.value);
                        setLogPage(1);
                      }}
                    >
                      <option value="">All Categories</option>
                      {logCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label text-xs text-slate-500 mb-1">
                      Status
                    </label>
                    <select
                      className="form-select-sm-custom"
                      value={logStatusFilter}
                      onChange={(e) => {
                        setLogStatusFilter(e.target.value);
                        setLogPage(1);
                      }}
                    >
                      <option value="">All</option>
                      <option value="success">Success</option>
                      <option value="failure">Failure</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-3"></div>
                  <div className="flex items-end">
                    <button
                      className="btn-primary-enterprise btn-sm-custom w-full"
                      onClick={() => setLogPage(1)}
                    >
                      <i className="bi bi-funnel me-1"></i> Filter
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="table-enterprise">
                    <thead>
                      <tr>
                        <th className="sortable" style={{ minWidth: 140 }}>
                          Timestamp
                        </th>
                        <th className="sortable" style={{ minWidth: 100 }}>
                          User
                        </th>
                        <th className="sortable" style={{ minWidth: 100 }}>
                          Action
                        </th>
                        <th className="sortable" style={{ minWidth: 90 }}>
                          Category
                        </th>
                        <th style={{ minWidth: 250 }}>Details</th>
                        <th className="sortable" style={{ minWidth: 80 }}>
                          Status
                        </th>
                        <th className="sortable" style={{ minWidth: 120 }}>
                          IP Address
                        </th>
                        <th className="sortable" style={{ minWidth: 70 }}>
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingLogs ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j}>
                                <div className="h-4 bg-slate-200 rounded animate-pulse w-full max-w-[100px]"></div>
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : paginatedLogs.length > 0 ? (
                        paginatedLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="text-sm text-slate-500">
                              {log.created_at || log.time || "-"}
                            </td>
                            <td className="font-medium text-sm">
                              {log.user || log.employee_id || "-"}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  log.action.toLowerCase().includes("fail") ||
                                  log.action.toLowerCase().includes("error")
                                    ? "badge-danger"
                                    : log.action.toLowerCase().includes("warn")
                                      ? "badge-warning"
                                      : "badge-info"
                                }`}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td className="text-sm text-slate-500">
                              {log.category || "-"}
                            </td>
                            <td className="text-sm text-slate-600">
                              {log.details}
                            </td>
                            <td>
                              {log.status && (
                                <span
                                  className={`badge ${
                                    log.status === "success"
                                      ? "badge-success"
                                      : log.status === "failure"
                                        ? "badge-danger"
                                        : log.status === "warning"
                                          ? "badge-warning"
                                          : "badge-info"
                                  }`}
                                >
                                  {log.status}
                                </span>
                              )}
                            </td>
                            <td className="text-sm text-slate-500 font-mono">
                              {log.ip_address || log.ip || "-"}
                            </td>
                            <td className="text-sm text-slate-500">
                              {log.duration_ms
                                ? `${log.duration_ms}ms`
                                : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-8">
                            <div className="text-slate-400">
                              <i className="bi bi-journal-text text-4xl block mb-2"></i>
                              <p className="text-sm">No activity logs found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-slate-500">
                    Showing{" "}
                    <span>
                      {filteredLogs.length === 0
                        ? "0"
                        : `${(logPage - 1) * logPageSize + 1}-${Math.min(logPage * logPageSize, filteredLogs.length)}`}
                    </span>{" "}
                    of <span>{filteredLogs.length}</span> records
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      Rows per page:
                    </span>
                    <select
                      className="form-select-sm-custom"
                      style={{ width: 80 }}
                      value={logPageSize}
                      onChange={(e) => {
                        setLogPageSize(parseInt(e.target.value));
                        setLogPage(1);
                      }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <nav>
                      <ul className="pagination flex items-center gap-1 list-none">
                        <li>
                          <button
                            className={`page-link-custom ${logPage <= 1 ? "disabled" : ""}`}
                            disabled={logPage <= 1}
                            onClick={() =>
                              setLogPage((p) => Math.max(1, p - 1))
                            }
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                        </li>
                        <li>
                          <button
                            className={`page-link-custom ${logPage >= logTotalPages ? "disabled" : ""}`}
                            disabled={logPage >= logTotalPages}
                            onClick={() =>
                              setLogPage((p) =>
                                Math.min(logTotalPages, p + 1)
                              )
                            }
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/*  TAB: Environment                                           */}
            {/* ========================================================== */}
            {activeTab === "env" && (
              <div>
                <h6 className="font-semibold mb-3 flex items-center gap-2">
                  <i className="bi bi-diagram-3"></i>Environment Settings
                </h6>
                <div className="alert-enterprise alert-info flex items-center gap-2 mb-3">
                  <i className="bi bi-info-circle"></i>
                  <span className="text-sm">
                    Select environment profiles to test with different
                    configurations. Changes take effect immediately.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* UBO API Environment */}
                  <div className="border border-slate-200 rounded-lg h-full">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-semibold text-sm flex items-center gap-1">
                        <i className="bi bi-cloud"></i> UBO API
                      </span>
                      <span className="badge bg-blue-600 text-white text-xs">
                        {envConfig.env_ubo_api_env || "DEV"}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm flex items-center gap-2">
                        <i className="bi bi-check-circle text-blue-600"></i>
                        <span>
                          <strong>Currently Active:</strong> Using{" "}
                          <span className="font-semibold">
                            {envConfig.env_ubo_api_env || "DEV"}
                          </span>{" "}
                          environment configuration
                        </span>
                      </div>

                      {/* Environment Toggle */}
                      <div>
                        <label className="form-label text-xs font-semibold">
                          Environment
                        </label>
                        <div className="flex gap-1">
                          {["DEV", "UAT", "PRD"].map((env) => (
                            <button
                              key={env}
                              className={`flex-1 text-xs py-1.5 px-3 rounded border transition-colors ${
                                (envConfig.env_ubo_api_env || "DEV") === env
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                              }`}
                              onClick={() =>
                                setEnvConfig({
                                  ...envConfig,
                                  env_ubo_api_env: env,
                                })
                              }
                            >
                              {env}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* UBO API Fields */}
                      <div>
                        <label className="form-label text-xs text-slate-500">
                          URL
                        </label>
                        <input
                          type="text"
                          className="form-control-sm-custom"
                          value={envConfig.env_ubo_api || ""}
                          onChange={(e) =>
                            setEnvConfig({
                              ...envConfig,
                              env_ubo_api: e.target.value,
                            })
                          }
                          placeholder="API URL"
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs text-slate-500">
                          API Key
                        </label>
                        <input
                          type="password"
                          className="form-control-sm-custom"
                          value={envConfig.env_ubo_api_key || ""}
                          onChange={(e) =>
                            setEnvConfig({
                              ...envConfig,
                              env_ubo_api_key: e.target.value,
                            })
                          }
                          placeholder="API Key"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="form-label text-xs text-slate-500">
                            Timeout (s)
                          </label>
                          <input
                            type="number"
                            className="form-control-sm-custom"
                            value={envConfig.env_ubo_api_timeout || 30}
                            onChange={(e) =>
                              setEnvConfig({
                                ...envConfig,
                                env_ubo_api_timeout:
                                  parseInt(e.target.value) || 30,
                              })
                            }
                            min={5}
                            max={120}
                          />
                        </div>
                        <div>
                          <label className="form-label text-xs text-slate-500">
                            Language
                          </label>
                          <select className="form-select-sm-custom">
                            <option value="TH">TH</option>
                            <option value="EN">EN</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UAM Environment */}
                  <div className="border border-slate-200 rounded-lg h-full">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-semibold text-sm flex items-center gap-1">
                        <i className="bi bi-shield-check"></i> UAM (User Access
                        Management)
                      </span>
                      <span className="badge bg-emerald-600 text-white text-xs">
                        DEV
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="form-label text-xs font-semibold">
                          Environment
                        </label>
                        <div className="flex gap-1">
                          {["DEV", "UAT", "PRD"].map((env) => (
                            <button
                              key={env}
                              className={`flex-1 text-xs py-1.5 px-3 rounded border transition-colors ${
                                env === "DEV"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"
                              }`}
                            >
                              {env}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="form-label text-xs text-slate-500">
                          Type
                        </label>
                        <div className="form-control-sm-custom bg-slate-50 text-slate-500">
                          SQLite (Local)
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Local SQLite database for user management in development.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save / Reset */}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-slate-500"></span>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline-secondary-enterprise text-sm"
                      onClick={() => fetchSettings()}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>{" "}
                      Reset to Defaults
                    </button>
                    <button
                      className="btn-primary-enterprise text-sm"
                      onClick={handleSaveEnvConfig}
                      disabled={savingEnv}
                    >
                      <i className="bi bi-check2 me-1"></i>{" "}
                      {savingEnv ? "Saving..." : "Save Configuration"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/*  TAB: Roles & Groups                                        */}
            {/* ========================================================== */}
            {activeTab === "roles" && (
              <div className="space-y-8">
                <RolePermissionMatrix />
                <div className="border-t border-slate-200 pt-6">
                  <GroupManagement />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================================================================ */}
      {/*  MODAL: Add User                                                 */}
      {/* ================================================================ */}
      {renderModalOverlay(showAddModal, () => setShowAddModal(false), (
        <div className="modal-content-enterprise">
          <div className="modal-header-enterprise">
            <h6 className="font-semibold flex items-center gap-2">
              <i className="bi bi-person-plus"></i>Add New User
            </h6>
            <button
              className="btn-close-modal"
              onClick={() => setShowAddModal(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body-enterprise space-y-3">
            <div>
              <label className="form-label text-sm font-medium">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-control-custom"
                value={addForm.employee_id}
                onChange={(e) =>
                  setAddForm({ ...addForm, employee_id: e.target.value })
                }
                placeholder="e.g. t001"
                maxLength={20}
              />
              <p className="text-xs text-slate-500 mt-1">
                Must be unique. Cannot be changed later.
              </p>
            </div>
            <div>
              <label className="form-label text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-control-custom"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                placeholder="Full name"
                maxLength={100}
              />
            </div>
            <div>
              <label className="form-label text-sm font-medium">Email</label>
              <input
                type="email"
                className="form-control-custom"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="form-label text-sm font-medium">
                Position
              </label>
              <input
                type="text"
                className="form-control-custom"
                value={addForm.position}
                onChange={(e) =>
                  setAddForm({ ...addForm, position: e.target.value })
                }
                placeholder="Job title / position"
                maxLength={100}
              />
            </div>
            <div>
              <label className="form-label text-sm font-medium">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                className="form-select-custom"
                value={addForm.role}
                onChange={(e) =>
                  setAddForm({ ...addForm, role: e.target.value })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select the user&apos;s role and permissions.
              </p>
            </div>
            <div>
              <label className="form-label text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addUserStatus"
                    value="active"
                    checked={addForm.status === "active"}
                    onChange={() => setAddForm({ ...addForm, status: "active" })}
                    className="accent-blue-600"
                  />
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className="status-dot online"></span> Active
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addUserStatus"
                    value="inactive"
                    checked={addForm.status === "inactive"}
                    onChange={() =>
                      setAddForm({ ...addForm, status: "inactive" })
                    }
                    className="accent-blue-600"
                  />
                  <span className="flex items-center gap-1.5 text-sm text-slate-400">
                    <span
                      className="status-dot"
                      style={{ background: "#94a3b8" }}
                    ></span>{" "}
                    Inactive
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inactive users cannot log in to the system.
              </p>
            </div>
            {addError && (
              <div className="alert-enterprise alert-danger text-sm">
                {addError}
              </div>
            )}
          </div>
          <div className="modal-footer-enterprise">
            <button
              className="btn-outline-secondary-enterprise text-sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary-enterprise text-sm"
              onClick={handleAddUser}
              disabled={savingAdd}
            >
              <i className="bi bi-check2 me-1"></i>{" "}
              {savingAdd ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ))}

      {/* ================================================================ */}
      {/*  MODAL: Edit User                                                */}
      {/* ================================================================ */}
      {renderModalOverlay(showEditModal, () => setShowEditModal(false), (
        <div className="modal-content-enterprise">
          <div className="modal-header-enterprise">
            <h6 className="font-semibold flex items-center gap-2">
              <i className="bi bi-pencil-square"></i>Edit User
            </h6>
            <button
              className="btn-close-modal"
              onClick={() => setShowEditModal(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body-enterprise space-y-3">
            <div>
              <label className="form-label text-sm font-medium">
                Employee ID
              </label>
              <div className="form-control-custom bg-slate-50 text-slate-600">
                {editingUser?.employee_id}
              </div>
            </div>
            <div>
              <label className="form-label text-sm font-medium">Name</label>
              <div className="form-control-custom bg-slate-50 text-slate-600">
                {editingUser?.name}
              </div>
            </div>
            <div>
              <label className="form-label text-sm font-medium">Role</label>
              <select
                className="form-select-custom"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Change the user&apos;s role and permissions.
              </p>
            </div>
            <div>
              <label className="form-label text-sm font-medium">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="editUserStatus"
                    value="active"
                    checked={editForm.status === "active"}
                    onChange={() =>
                      setEditForm({ ...editForm, status: "active" })
                    }
                    className="accent-blue-600"
                  />
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className="status-dot online"></span> Active
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="editUserStatus"
                    value="inactive"
                    checked={editForm.status === "inactive"}
                    onChange={() => {
                      setEditForm({ ...editForm, status: "inactive" });
                      setEditStatusConfirm(true);
                    }}
                    className="accent-blue-600"
                  />
                  <span className="flex items-center gap-1.5 text-sm text-slate-400">
                    <span
                      className="status-dot"
                      style={{ background: "#94a3b8" }}
                    ></span>{" "}
                    Inactive
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inactive users cannot log in to the system.
              </p>
            </div>

            {/* Status Confirm Section */}
            {editStatusConfirm && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <i className="bi bi-exclamation-triangle text-amber-600"></i>
                  <span className="font-semibold text-sm text-amber-800">
                    Confirm Status Change
                  </span>
                </div>
                <p className="text-sm text-amber-700 mb-2">
                  Type <strong>&quot;confirmed&quot;</strong> below to confirm changing this
                  user&apos;s status:
                </p>
                <input
                  type="text"
                  className="form-control-sm-custom"
                  value={editStatusConfirmInput}
                  onChange={(e) => setEditStatusConfirmInput(e.target.value)}
                  placeholder='Type "confirmed" to proceed'
                />
              </div>
            )}

            {editError && (
              <div className="alert-enterprise alert-danger text-sm">
                {editError}
              </div>
            )}
          </div>
          <div className="modal-footer-enterprise">
            <button
              className="btn-outline-secondary-enterprise text-sm"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-outline-danger-enterprise text-sm"
              onClick={() => {
                if (editingUser) {
                  setEditForm({ role: "maker", status: "active" });
                  setEditStatusConfirm(false);
                  setEditStatusConfirmInput("");
                }
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset to
              Default
            </button>
            <button
              className="btn-primary-enterprise text-sm"
              onClick={handleEditUser}
              disabled={savingEdit}
            >
              <i className="bi bi-check2 me-1"></i>{" "}
              {savingEdit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ))}

      {/* ================================================================ */}
      {/*  MODAL: Delete Confirmation                                      */}
      {/* ================================================================ */}
      {renderModalOverlay(showDeleteModal, () => setShowDeleteModal(false), (
        <div className="modal-content-enterprise">
          <div className="modal-header-enterprise">
            <h6 className="font-semibold flex items-center gap-2 text-red-600">
              <i className="bi bi-trash"></i>Delete User
            </h6>
            <button
              className="btn-close-modal"
              onClick={() => setShowDeleteModal(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body-enterprise">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete user{" "}
              <strong>{deletingUser?.name}</strong> (
              <code className="text-xs">{deletingUser?.employee_id}</code>)?
            </p>
            <p className="text-sm text-red-500 mt-2">
              <i className="bi bi-exclamation-triangle me-1"></i>
              This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer-enterprise">
            <button
              className="btn-outline-secondary-enterprise text-sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-danger-enterprise text-sm"
              onClick={handleDeleteUser}
            >
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          </div>
        </div>
      ))}

      {/* ================================================================ */}
      {/*  MODAL: Import Excel                                             */}
      {/* ================================================================ */}
      {renderModalOverlay(showImportModal, () => setShowImportModal(false), (
        <div className="modal-content-enterprise modal-lg">
          <div className="modal-header-enterprise">
            <h6 className="font-semibold flex items-center gap-2">
              <i className="bi bi-file-earmark-excel"></i>Import Users from
              Excel
            </h6>
            <button
              className="btn-close-modal"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportResult(null);
                setImportError("");
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body-enterprise">
            <div className="alert-enterprise alert-info flex items-start gap-2 mb-3">
              <i className="bi bi-info-circle mt-0.5"></i>
              <div className="text-sm">
                <strong>Supported columns:</strong> employee_id, username,
                password, name, display_name, email, title, position,
                department, first_name, last_name, role, status
                <br />
                <strong>Required:</strong> employee_id, username, password
                <br />
                <strong>Roles:</strong> maker, checker, monitor, admin, root
              </div>
            </div>

            <div>
              <label className="form-label text-sm font-medium">
                Select Excel File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                className="form-control-custom"
                accept=".xlsx,.xlsm"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Only .xlsx and .xlsm files are supported.
              </p>
            </div>

            {importError && (
              <div className="alert-enterprise alert-danger text-sm mt-3">
                {importError}
              </div>
            )}

            {importResult && (
              <div className="border border-slate-200 rounded-lg mt-3">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <span className="font-semibold text-sm flex items-center gap-1">
                    <i className="bi bi-clipboard-check"></i> Import Results
                  </span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 text-center gap-4">
                    <div>
                      <div className="font-bold text-lg text-blue-600">
                        {importResult.parsed}
                      </div>
                      <div className="text-xs text-slate-500">Parsed</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-emerald-600">
                        {importResult.inserted}
                      </div>
                      <div className="text-xs text-slate-500">Inserted</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-amber-600">
                        {importResult.updated}
                      </div>
                      <div className="text-xs text-slate-500">Updated</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-red-600">
                        {importResult.failed}
                      </div>
                      <div className="text-xs text-slate-500">Failed</div>
                    </div>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-red-600 mb-1">
                        Errors:
                      </div>
                      <div
                        className="bg-slate-50 rounded p-2 text-xs overflow-auto"
                        style={{ maxHeight: 150 }}
                      >
                        {importResult.errors.map((err, i) => (
                          <div key={i} className="text-red-600">
                            {err}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer-enterprise">
            <button
              className="btn-outline-secondary-enterprise text-sm"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportResult(null);
                setImportError("");
              }}
            >
              Close
            </button>
            <button
              className="btn-success-enterprise text-sm"
              onClick={handleImportExcel}
              disabled={!importFile || importing}
            >
              <i className="bi bi-upload me-1"></i>{" "}
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
