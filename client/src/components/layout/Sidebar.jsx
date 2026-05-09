/**
 * Sidebar — DESIGN.md "Disciplined warmth"
 *
 * Dashboard sidebar. Saffron active state, hairline borders, BMW-style
 * 13px uppercase section labels, two-weight typography.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PlusCircleIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../context/AuthContext";

const SEEKER_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: HomeIcon, group: "Main" },
  { to: "/jobs", label: "Find jobs", icon: BriefcaseIcon, group: "Main" },
  { to: "/walk-ins", label: "Walk-ins", icon: CalendarDaysIcon, group: "Main" },
  { to: "/applications", label: "My applications", icon: ClipboardDocumentListIcon, group: "Account" },
  { to: "/profile", label: "Profile", icon: UserIcon, group: "Account" },
];

const RECRUITER_LINKS = [
  { to: "/recruiter/dashboard", label: "Dashboard", icon: HomeIcon, group: "Main" },
  { to: "/recruiter/post-job", label: "Post a job", icon: PlusCircleIcon, group: "Main" },
  { to: "/recruiter/jobs", label: "Manage jobs", icon: BriefcaseIcon, group: "Main" },
  { to: "/recruiter/applicants", label: "Applicants", icon: UsersIcon, group: "Main" },
  { to: "/recruiter/profile", label: "Company profile", icon: BuildingOfficeIcon, group: "Account" },
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: ChartBarIcon, group: "Main" },
  { to: "/admin/users", label: "Users", icon: UsersIcon, group: "Manage" },
  { to: "/admin/recruiters", label: "Recruiters", icon: ShieldCheckIcon, group: "Manage" },
  { to: "/admin/scraped-jobs", label: "Scraped jobs", icon: DocumentMagnifyingGlassIcon, group: "Manage" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const links =
    user?.role === "admin"
      ? ADMIN_LINKS
      : user?.role === "recruiter"
      ? RECRUITER_LINKS
      : SEEKER_LINKS;

  // Group links by group field
  const grouped = links.reduce((acc, link) => {
    const g = link.group || "Main";
    (acc[g] ||= []).push(link);
    return acc;
  }, {});

  return (
    <aside className="w-64 bg-canvas border-r border-hairline min-h-[calc(100vh-64px)] flex flex-col shrink-0">
      <nav className="flex-1 px-4 py-6 space-y-7">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div className="px-3 mb-3 text-[11px] font-bold tracking-[0.2em] uppercase text-muted-soft">
              {group}
            </div>
            <div className="space-y-0.5">
              {items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold tracking-tight transition-colors",
                      active
                        ? "bg-saffron/10 text-saffron"
                        : "text-body hover:bg-canvas-warm hover:text-ink"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "h-4 w-4 stroke-[1.5]",
                        active ? "text-saffron" : "text-muted-soft"
                      )}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-hairline">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-saffron text-on-primary flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">{user?.name}</p>
            <p className="text-[11px] text-muted-text uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
