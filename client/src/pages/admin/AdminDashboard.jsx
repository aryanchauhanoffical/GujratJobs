/**
 * AdminDashboard — DESIGN.md "Disciplined warmth"
 */

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import StatsCard from "../../components/dashboard/StatsCard";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import axiosInstance from "../../api/axios";

const fetchAdminStats = async () => {
  const { data } = await axiosInstance.get("/admin/analytics");
  return data.data;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    retry: false,
  });

  const display = stats || {
    totalUsers: 0,
    totalRecruiters: 0,
    pendingRecruiters: 0,
    totalJobs: 0,
    activeJobs: 0,
    scrapedJobs: 0,
    totalApplications: 0,
    totalHired: 0,
    flaggedJobs: 0,
  };

  const hireRate = display.totalApplications
    ? Math.round((display.totalHired / display.totalApplications) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
            Admin
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight mb-8">
            Platform overview.
          </h1>

          {/* Alerts */}
          {display.pendingRecruiters > 0 && (
            <Alert
              tone="marigold"
              icon={ExclamationTriangleIcon}
              text={
                <>
                  <span className="font-bold">{display.pendingRecruiters} recruiters</span> awaiting approval.
                </>
              }
              cta={{ to: "/admin/recruiters", label: "Review" }}
            />
          )}
          {display.flaggedJobs > 0 && (
            <Alert
              tone="error"
              icon={ExclamationTriangleIcon}
              text={
                <>
                  <span className="font-bold">{display.flaggedJobs} jobs</span> flagged for review.
                </>
              }
              cta={{ to: "/admin/scraped-jobs", label: "Review" }}
            />
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard title="Job seekers" value={display.totalUsers} icon={UsersIcon} />
                <StatsCard title="Recruiters" value={display.totalRecruiters} icon={BuildingOfficeIcon} />
                <StatsCard title="Active jobs" value={display.activeJobs} icon={BriefcaseIcon} accent={(display.activeJobs || 0) > 0} />
                <StatsCard title="Total hired" value={display.totalHired} icon={CheckCircleIcon} accent={(display.totalHired || 0) > 0} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <SecondaryStat
                  title="Total applications"
                  value={display.totalApplications}
                  hint="All time"
                />
                <SecondaryStat
                  title="Scraped jobs"
                  value={display.scrapedJobs}
                  hint="LinkedIn · Indeed · Naukri"
                />
                <SecondaryStat
                  title="Hire rate"
                  value={`${hireRate}%`}
                  hint="Applications → hired"
                  accent
                />
              </div>

              {/* Quick actions */}
              <div className="bg-canvas border border-hairline rounded-xl p-6">
                <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-5">
                  Quick actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <ActionTile
                    to="/admin/recruiters"
                    icon={ShieldCheckIcon}
                    label="Approve recruiters"
                    desc={`${display.pendingRecruiters} pending`}
                    accent={display.pendingRecruiters > 0}
                  />
                  <ActionTile
                    to="/admin/scraped-jobs"
                    icon={DocumentMagnifyingGlassIcon}
                    label="Scraped jobs"
                    desc={`${display.flaggedJobs} flagged`}
                    accent={display.flaggedJobs > 0}
                  />
                  <ActionTile
                    to="/admin/users"
                    icon={UsersIcon}
                    label="Manage users"
                    desc={`${display.totalUsers} total`}
                  />
                  <ActionTile
                    to="/admin/dashboard"
                    icon={ChartBarIcon}
                    label="Analytics"
                    desc="View reports"
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Alert({ tone = "marigold", icon: Icon, text, cta }) {
  const cls = {
    marigold: "bg-marigold/10 border-marigold/30 text-marigold",
    error: "bg-error/10 border-error/20 text-error",
  }[tone];
  return (
    <div className={`mb-4 ${cls} border rounded-xl p-4 flex items-center gap-3`}>
      <Icon className="h-5 w-5 stroke-[1.5] shrink-0" />
      <p className="text-sm flex-1">{text}</p>
      <Link
        to={cta.to}
        className="text-xs font-bold uppercase tracking-wider hover:underline shrink-0"
      >
        {cta.label} →
      </Link>
    </div>
  );
}

function SecondaryStat({ title, value, hint, accent = false }) {
  return (
    <div className={`bg-canvas border rounded-xl p-6 ${accent ? "border-saffron/30" : "border-hairline"}`}>
      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-text">{title}</p>
      <p className={`text-3xl font-bold tracking-tighter mt-3 ${accent ? "text-saffron" : "text-ink"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-muted-text mt-2">{hint}</p>
    </div>
  );
}

function ActionTile({ to, icon: Icon, label, desc, accent = false }) {
  return (
    <Link
      to={to}
      className={`group flex flex-col items-start text-left p-5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-card ${
        accent
          ? "border-saffron/40 bg-saffron/5"
          : "border-hairline bg-canvas hover:border-ink"
      }`}
    >
      <Icon className={`h-6 w-6 stroke-[1.5] ${accent ? "text-saffron" : "text-muted-soft group-hover:text-saffron transition-colors"}`} />
      <span className="font-bold tracking-tight text-ink text-sm mt-3">{label}</span>
      <span className="text-xs text-muted-text mt-1">{desc}</span>
    </Link>
  );
}
