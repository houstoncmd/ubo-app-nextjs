"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

interface Feature {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export default function RolePermissionMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, featuresRes] = await Promise.all([
        apiFetch<Role[]>("/api/proxy/groups/roles"),
        apiFetch<Feature[]>("/api/proxy/groups/features"),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (featuresRes.data) setFeatures(featuresRes.data);
      if (rolesRes.error) setError(rolesRes.error);
      if (featuresRes.error) setError(featuresRes.error);
    } catch {
      setError("Failed to load roles and features");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build a lookup: { [roleName]: { [featureId]: bool } }
  const currentMatrix: Record<string, Record<string, boolean>> = {};
  for (const role of roles) {
    currentMatrix[role.name] = {};
    for (const feat of features) {
      currentMatrix[role.name][feat.id] = role.permissions.includes(feat.id);
    }
  }

  const isChecked = (roleName: string, featureId: string): boolean => {
    if (pendingChanges[roleName]?.[featureId] !== undefined) {
      return pendingChanges[roleName][featureId];
    }
    return currentMatrix[roleName]?.[featureId] ?? false;
  };

  const handleToggle = (roleName: string, featureId: string) => {
    const current = isChecked(roleName, featureId);
    setPendingChanges((prev) => ({
      ...prev,
      [roleName]: {
        ...prev[roleName],
        [featureId]: !current,
      },
    }));
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      for (const role of roles) {
        const changedFeatures = pendingChanges[role.name];
        if (!changedFeatures) continue;

        const updatedPermissions = features
          .filter((f) => {
            const override = changedFeatures[f.id];
            if (override !== undefined) return override;
            return role.permissions.includes(f.id);
          })
          .map((f) => f.id);

        const res = await apiFetch(`/api/proxy/groups/roles/${role.id}/permissions`, {
          method: "POST",
          body: JSON.stringify({ permissions: updatedPermissions }),
        });

        if (res.error) {
          setError(`Failed to update role "${role.name}": ${res.error}`);
          setSaving(false);
          return;
        }
      }

      setPendingChanges({});
      setSuccess("Permissions updated successfully");
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch {
      setError("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setPendingChanges({});
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Role-Permission Matrix
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Toggle feature access for each role. Changes are highlighted in gold.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          {hasPendingChanges && (
            <>
              <button
                onClick={handleDiscard}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-lhb-navy hover:bg-lhb-navy/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <i className="bi bi-arrow-clockwise animate-spin"></i>
                ) : (
                  <i className="bi bi-check-lg"></i>
                )}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

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

      {roles.length === 0 || features.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <i className="bi bi-shield-lock text-4xl mb-2 block"></i>
          <p className="text-sm">No roles or features found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 sticky left-0 z-10 min-w-[160px]">
                  Role
                </th>
                {features.map((feat) => (
                  <th
                    key={feat.id}
                    className="p-3 bg-slate-50 border border-slate-200 text-center min-w-[100px]"
                    title={feat.description || feat.name}
                  >
                    <div className="text-sm font-semibold text-slate-700">
                      {feat.name}
                    </div>
                    {feat.description && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {feat.description}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="group hover:bg-slate-50/50">
                  <td className="p-3 border border-slate-200 font-medium text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <i className="bi bi-shield-check text-lhb-navy"></i>
                      <div>
                        <div>{role.name}</div>
                        {role.description && (
                          <div className="text-xs text-slate-400 font-normal">
                            {role.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {features.map((feat) => {
                    const checked = isChecked(role.name, feat.id);
                    const isChanged =
                      pendingChanges[role.name]?.[feat.id] !== undefined;
                    return (
                      <td
                        key={feat.id}
                        className={`p-3 border border-slate-200 text-center ${
                          isChanged ? "bg-amber-50" : ""
                        }`}
                      >
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggle(role.name, feat.id)}
                            className="w-4 h-4 rounded border-slate-300 text-lhb-navy focus:ring-lhb-navy cursor-pointer"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
