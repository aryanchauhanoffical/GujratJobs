/**
 * RecruiterDashboard — DESIGN.md "Disciplined warmth"
 */

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import StatsCard from "../../components/dashboard/StatsCard";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { recruiterAPI } from "../../api/recruiter.api";
import { timeAgo } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLOR = {
  applied: "bg-saffron/10 text-saffron border-saffron/20",
  viewed: "bg-canvas-warm text-muted-text border-hairline",
  shortlisted: "bg-marigold/10 text-marigold border-marigold/30",
  hired: "bg-success/10 text-success border-success/20",
  rejected: "bg-error/10 text-error border-error/20",
};

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["recruiterDashboard"],
    queryFn: recruiterAPI.getDashboard,
  });

  const stats = data?.stats || {};
  const recentApplications = data?.recentApplications || [];
  const topJobs = data?.topJobs || [];

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                Recruiter dashboard
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight">
                Welcome back, {user?.name?.split(" ")[0]}.
              </h1>
            </div>
            <Link
              to="/recruiter/post-job"
              className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-12 inline-flex items-center gap-2 hover:bg-saffron-active transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5 stroke-[1.5]" />
              Post a job
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatsCard title="Total jobs" value={stats.totalJobs || 0} icon={BriefcaseIcon} />
                <StatsCard title="Active jobs" value={stats.activeJobs || 0} icon={BriefcaseIcon} accent={(stats.activeJobs || 0) > 0} />
                <StatsCard title="Applicants" value={stats.totalApplications || 0} icon={UserGroupIcon} />
                <StatsCard title="New this week" value={stats.newApplications || 0} icon={ClockIcon} change={stats.newApplications} />
                <StatsCard title="Shortlisted" value={stats.shortlisted || 0} icon={EyeIcon} accent={(stats.shortlisted || 0) > 0} />
                <StatsCard title="Hired" value={stats.totalHired || 0} icon={CheckBadgeIcon} accent={(stats.totalHired || 0) > 0} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink">
                      Recent applications
                    </h2>
                    <Link
                      to="/recruiter/applicants"
                      className="text-sm font-bold text-saffron hover:underline inline-flex items-center gap-1.5"
                    >
                      View all <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  {recentApplications.length === 0 ? (
                    <div className="bg-canvas border border-hairline rounded-xl p-12 text-center">
                      <UserGroupIcon className="h-12 w-12 text-muted-soft stroke-[1.5] mx-auto mb-4" />
                      <p className="text-ink font-bold tracking-tight">No applications yet</p>
                      <p className="text-sm text-body mt-2 mb-6">
                        Post a job to start receiving applications.
                      </p>
                      <Link
                        to="/recruiter/post-job"
                        className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 inline-flex items-center hover:bg-saffron-active transition-colors"
                      >
                        Post a job
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-canvas border border-hairline rounded-xl divide-y divide-hairline overflow-hidden">
                      {recentApplications.map((app) => (
                        <div
                          key={app._id}
                          className="flex items-center gap-3 p-4 hover:bg-canvas-warm transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-saffron text-on-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {app.applicant?.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold tracking-tight text-ink text-sm truncate">
                              {app.applicant?.name}
                            </p>
                            <p className="text-xs text-body truncate">{app.job?.title}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={`${STATUS_COLOR[app.status] || STATUS_COLOR.viewed} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full px-2.5`}
                            >
                              {app.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-soft">{timeAgo(app.appliedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-canvas border border-hairline rounded-xl p-6">
                    <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-4">
                      Quick actions
                    </h3>
                    <div className="space-y-1">
                      <QuickAction to="/recruiter/post-job" icon={PlusCircleIcon} label="Post new job" />
                      <QuickAction to="/recruiter/jobs" icon={BriefcaseIcon} label="Manage jobs" />
                      <QuickAction to="/recruiter/profile" icon={CheckBadgeIcon} label="Update profile" />
                    </div>
                  </div>

                  {topJobs.length > 0 && (
                    <div className="bg-canvas border border-hairline rounded-xl p-6">
                      <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-4">
                        Top jobs by applicants
                      </h3>
                      <div className="space-y-3">
                        {topJobs.slice(0, 4).map((job) => (
                          <Link
                            key={job._id}
                            to={`/recruiter/jobs/${job._id}/applicants`}
                            className="flex items-center justify-between hover:text-saffron transition-colors group"
                          >
                            <p className="text-sm text-body truncate flex-1 group-hover:text-saffron">
                              {job.title}
                            </p>
                            <span className="text-xs font-bold text-saffron ml-3 shrink-0 tabular-nums">
                              {job.applicantCount}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold tracking-tight text-body hover:bg-canvas-warm hover:text-ink transition-colors"
    >
      <Icon className="h-4 w-4 stroke-[1.5] text-muted-soft" />
      {label}
    </Link>
  );
}
