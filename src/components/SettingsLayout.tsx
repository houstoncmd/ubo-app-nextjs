"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsTabs = [
  { id: "users", label: "User Access", icon: "bi-people" },
  { id: "api", label: "API Config", icon: "bi-plug" },
  { id: "auth", label: "Authentication", icon: "bi-shield-lock" },
  { id: "logs", label: "Activity Logs", icon: "bi-journal-text" },
  { id: "env", label: "Environment", icon: "bi-laptop" },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="lhb-card">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {settingsTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/settings?tab=${tab.id}`}
              className={`lhb-tab flex items-center gap-2 whitespace-nowrap ${
                pathname.includes(`tab=${tab.id}`) || (!pathname.includes("tab=") && tab.id === "users")
                  ? "lhb-tab-active"
                  : "lhb-tab-inactive"
              }`}
            >
              <i className={`bi ${tab.icon}`}></i>
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="lhb-card-body">{children}</div>
      </div>
    </div>
  );
}
