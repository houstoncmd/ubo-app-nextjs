"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

interface Group {
  id: number;
  name: string;
  description: string;
  group_type: string;
  member_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface GroupMember {
  id: number;
  employee_id: string;
  name: string;
  email?: string;
}

interface User {
  id: number;
  employee_id: string;
  name: string;
  email?: string;
  role?: string;
}

const GROUP_TYPES = [
  { value: "ldap", label: "LDAP/AD Group" },
  { value: "manual", label: "Manual Group" },
  { value: "system", label: "System Group" },
];

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create group form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupType, setNewGroupType] = useState("manual");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Member management
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);

  // Delete confirmation
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Group[]>("/api/proxy/groups");
      if (res.data) {
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as { items: Group[] }).items;
        if (items) setGroups(items);
      }
      if (res.error) setError(res.error);
    } catch {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await apiFetch<User[]>("/api/proxy/groups/users/all");
      if (res.data) {
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as { items: User[] }).items;
        if (items) setAllUsers(items);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, [fetchGroups, fetchAllUsers]);

  const fetchMembers = async (groupId: number) => {
    setLoadingMembers(true);
    try {
      const res = await apiFetch<GroupMember[]>(
        `/api/proxy/groups/${groupId}/members`
      );
      if (res.data) {
        const items = Array.isArray(res.data)
          ? res.data
          : (res.data as { items: GroupMember[] }).items;
        setMembers(items || []);
      } else {
        setMembers([]);
      }
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleViewMembers = async (group: Group) => {
    setSelectedGroup(group);
    setShowMemberPanel(true);
    setSelectedUsers([]);
    setSearchTerm("");
    await fetchMembers(group.id);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreatingGroup(true);
    setError(null);
    try {
      const res = await apiFetch("/api/proxy/groups", {
        method: "POST",
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          group_type: newGroupType,
        }),
      });

      if (res.error) {
        setError(`Failed to create group: ${res.error}`);
      } else {
        setSuccess("Group created successfully");
        setShowCreateForm(false);
        setNewGroupName("");
        setNewGroupDesc("");
        setNewGroupType("manual");
        setTimeout(() => setSuccess(null), 3000);
        await fetchGroups();
      }
    } catch {
      setError("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    setError(null);
    try {
      const res = await apiFetch(`/api/proxy/groups/${groupId}`, {
        method: "DELETE",
      });
      if (res.error) {
        setError(`Failed to delete group: ${res.error}`);
      } else {
        setSuccess("Group deleted successfully");
        setDeleteGroupId(null);
        if (selectedGroup?.id === groupId) {
          setShowMemberPanel(false);
          setSelectedGroup(null);
        }
        setTimeout(() => setSuccess(null), 3000);
        await fetchGroups();
      }
    } catch {
      setError("Failed to delete group");
    }
  };

  const handleAddMembers = async () => {
    if (!selectedGroup || selectedUsers.length === 0) return;

    setAddingMembers(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/proxy/groups/${selectedGroup.id}/members`, {
        method: "POST",
        body: JSON.stringify({ employee_ids: selectedUsers }),
      });

      if (res.error) {
        setError(`Failed to add members: ${res.error}`);
      } else {
        setSuccess(`Added ${selectedUsers.length} member(s)`);
        setSelectedUsers([]);
        setTimeout(() => setSuccess(null), 3000);
        await fetchMembers(selectedGroup.id);
        await fetchGroups();
      }
    } catch {
      setError("Failed to add members");
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedGroup) return;

    setError(null);
    try {
      const res = await apiFetch(
        `/api/proxy/groups/${selectedGroup.id}/members/${employeeId}`,
        { method: "DELETE" }
      );
      if (res.error) {
        setError(`Failed to remove member: ${res.error}`);
      } else {
        setSuccess("Member removed");
        setTimeout(() => setSuccess(null), 3000);
        await fetchMembers(selectedGroup.id);
        await fetchGroups();
      }
    } catch {
      setError("Failed to remove member");
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    const memberIds = new Set(members.map((m) => m.employee_id));
    return (
      !memberIds.has(u.employee_id) &&
      (u.name.toLowerCase().includes(term) ||
        u.employee_id.toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term))
    );
  });

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getGroupTypeBadge = (type: string) => {
    switch (type) {
      case "ldap":
        return (
          <span className="lhb-badge-info">
            <i className="bi bi-diagram-3 mr-1"></i>LDAP/AD
          </span>
        );
      case "system":
        return (
          <span className="lhb-badge-warning">
            <i className="bi bi-gear mr-1"></i>System
          </span>
        );
      default:
        return (
          <span className="lhb-badge-success">
            <i className="bi bi-people mr-1"></i>Manual
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Group Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage user groups, assign members from LDAP/AD users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGroups}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-lhb-navy hover:bg-lhb-navy/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <i className={`bi ${showCreateForm ? "bi-x-lg" : "bi-plus-lg"}`}></i>
            {showCreateForm ? "Cancel" : "New Group"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 text-sm text-emerald-700">
          <i className="bi bi-check-circle"></i>
          {success}
        </div>
      )}

      {/* Create Group Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateGroup}
          className="lhb-card p-6 border-2 border-lhb-gold/30"
        >
          <h4 className="font-semibold text-slate-800 mb-4">Create New Group</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="lhb-label">Group Name *</label>
              <input
                type="text"
                className="lhb-input"
                placeholder="e.g. Engineering Team"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="lhb-label">Description</label>
              <input
                type="text"
                className="lhb-input"
                placeholder="Optional description"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="lhb-label">Group Type</label>
              <select
                className="lhb-input"
                value={newGroupType}
                onChange={(e) => setNewGroupType(e.target.value)}
              >
                {GROUP_TYPES.map((gt) => (
                  <option key={gt.value} value={gt.value}>
                    {gt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              type="submit"
              disabled={creatingGroup || !newGroupName.trim()}
              className="bg-lhb-navy hover:bg-lhb-navy/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {creatingGroup ? (
                <i className="bi bi-arrow-clockwise animate-spin"></i>
              ) : (
                <i className="bi bi-plus-lg"></i>
              )}
              Create Group
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Groups Table */}
      <div className="overflow-x-auto">
        <table className="lhb-table">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Members</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-40"></div>
                  </td>
                  <td>
                    <div className="h-5 bg-slate-200 rounded-full animate-pulse w-16"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-8"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div>
                  </td>
                </tr>
              ))
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <tr key={group.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <i className="bi bi-collection text-lhb-navy"></i>
                      <span className="font-medium text-slate-800">
                        {group.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-sm text-slate-500 max-w-xs truncate">
                    {group.description || "-"}
                  </td>
                  <td>{getGroupTypeBadge(group.group_type)}</td>
                  <td className="text-center font-medium">
                    {group.member_count ?? "-"}
                  </td>
                  <td className="text-sm text-slate-500">
                    {group.created_at
                      ? new Date(group.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewMembers(group)}
                        className="text-lhb-navy hover:text-lhb-navy/80 text-sm font-medium"
                        title="Manage members"
                      >
                        <i className="bi bi-people mr-1"></i>Members
                      </button>
                      {deleteGroupId === group.id ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Confirm
                          </button>
                          <span className="text-slate-400">|</span>
                          <button
                            onClick={() => setDeleteGroupId(null)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteGroupId(group.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Delete group"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  <i className="bi bi-collection text-4xl mb-2 block"></i>
                  <p className="text-sm">No groups found. Create one to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Management Slide-Over Panel */}
      {showMemberPanel && selectedGroup && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMemberPanel(false)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Members — {selectedGroup.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage users in this group
                  </p>
                </div>
                <button
                  onClick={() => setShowMemberPanel(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Current Members */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <i className="bi bi-people"></i>
                  Current Members ({members.length})
                </h4>
                {loadingMembers ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-slate-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-lhb-navy/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-lhb-navy">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">
                              {member.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {member.employee_id}
                              {member.email ? ` • ${member.email}` : ""}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.employee_id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from group"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-2">No members yet.</p>
                )}
              </div>

              {/* Add Members */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <i className="bi bi-person-plus"></i>
                  Add Members from LDAP/AD
                </h4>
                <div className="relative mb-3">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    className="lhb-input pl-9"
                    placeholder="Search by name, employee ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded border-slate-300 text-lhb-navy focus:ring-lhb-navy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.employee_id}
                            {user.email ? ` • ${user.email}` : ""}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 p-3 text-center">
                      {searchTerm
                        ? "No matching users found"
                        : "No users available to add"}
                    </p>
                  )}
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleAddMembers}
                      disabled={addingMembers}
                      className="bg-lhb-gold hover:bg-lhb-gold/90 text-lhb-navy font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {addingMembers ? (
                        <i className="bi bi-arrow-clockwise animate-spin"></i>
                      ) : (
                        <i className="bi bi-person-plus"></i>
                      )}
                      Add {selectedUsers.length} Member(s)
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
