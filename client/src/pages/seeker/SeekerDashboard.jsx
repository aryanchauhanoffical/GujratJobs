/**
 * SeekerDashboard — DESIGN.md "Disciplined warmth"
 *
 * Welcome row, four stat tiles (animated count-up), recent applications,
 * upcoming walk-ins panel, profile completion nudges.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  MapPinIcon,
  DocumentArrowUpIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import StatsCard from "../../components/dashboard/StatsCard";
import ApplicationCard from "../../components/dashboard/ApplicationCard";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { applicationsAPI } from "../../api/applications.api";
import { jobsAPI } from "../../api/jobs.api";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/helpers";

export default function SeekerDashboard() {
  const { user } = useAuth();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ["myApplications", "recent"],
    queryFn: () => applicationsAPI.getMyApplications({ limit: 5 }),
  });

  const { data: walkInsData } = useQuery({
    queryKey: ["walkIns", user?.location?.city],
    queryFn: () =>
      jobsAPI.getWalkIns({ city: user?.location?.city, limit: 3 }),
  });

  const applications = appsData?.applications || [];
  const stats = {
    total: appsData?.pagination?.total || 0,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interviews: applications.filter((a) => a.status === "interview_scheduled").length,
    walkInsNear: walkInsData?.pagination?.total || 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 overflow-auto bg-canvas-warm">
          {/* Welcome */}
          <div className="mb-8">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
              Dashboard
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight">
              Welcome back, {user?.name?.split(" ")[0]}.
            </h1>
            <p className="text-body mt-3">
              {user?.location?.city
                ? `Showing jobs near ${user.location.city}, Gujarat.`
                : "Set your location to see nearby jobs."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Applications"
              value={stats.total}
              icon={ClipboardDocumentListIcon}
            />
            <StatsCard
              title="Shortlisted"
              value={stats.shortlisted}
              icon={CheckBadgeIcon}
              accent={stats.shortlisted > 0}
            />
            <StatsCard
              title="Interviews"
              value={stats.interviews}
              icon={CalendarDaysIcon}
              accent={stats.interviews > 0}
            />
            <StatsCard
              title="Walk-ins near you"
              value={stats.walkInsNear}
              icon={MapPinIcon}
              accent={stats.walkInsNear > 0}
            />
          </div>

          {/* Profile completion alerts */}
          {!user?.resume?.url && (
            <Alert
              icon={DocumentArrowUpIcon}
              title="Upload your resume"
              body="Apply to jobs faster — recruiters review resumes before applications."
              cta={{ label: "Upload now", to: "/profile" }}
            />
          )}
          {!user?.location?.city && (
            <Alert
              icon={ExclamationCircleIcon}
              title="Set your city"
              body="Get personalized walk-in alerts and job recommendations."
              cta={{ label: "Set city", to: "/profile" }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Recent applications */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink">
                  Recent applications
                </h2>
                <Link
                  to="/applications"
                  className="text-sm font-bold text-saffron hover:underline inline-flex items-center gap-1.5"
                >
                  View all <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {appsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : applications.length === 0 ? (
                <div className="bg-canvas border border-hairline rounded-xl p-12 text-center">
                  <BriefcaseIcon className="h-12 w-12 text-muted-soft stroke-[1.5] mx-auto mb-4" />
                  <p className="text-ink font-bold tracking-tight text-lg">
                    No applications yet
                  </p>
                  <p className="text-body text-sm mt-2 mb-6">
                    Start applying to walk-ins and verified jobs.
                  </p>
                  <Link
                    to="/jobs"
                    className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 inline-flex items-center hover:bg-saffron-active transition-colors"
                  >
                    Browse jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <ApplicationCard key={app._id} application={app} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions + walk-ins */}
            <div className="space-y-6">
              <div className="bg-canvas border border-hairline rounded-xl p-6">
                <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-4">
                  Quick actions
                </h3>
                <div className="space-y-1">
                  <QuickAction to="/jobs" icon={BriefcaseIcon} label="Browse jobs" />
                  <QuickAction to="/walk-ins" icon={CalendarDaysIcon} label="Walk-in interviews" />
                  <QuickAction to="/profile" icon={CheckBadgeIcon} label="Update profile" />
                </div>
              </div>

              {walkInsData?.jobs?.length > 0 && (
                <div className="bg-canvas border border-saffron/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron">
                      Upcoming walk-ins
                    </h3>
                    <Link
                      to="/walk-ins"
                      className="text-xs font-bold text-saffron hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {walkInsData.jobs.slice(0, 2).map((job) => (
                      <Link
                        key={job._id}
                        to={`/jobs/${job._id}`}
                        className="block bg-canvas-warm border border-hairline rounded-lg p-4 hover:border-saffron transition-colors"
                      >
                        <p className="text-sm font-bold tracking-tight text-ink line-clamp-1">
                          {job.title}
                        </p>
                        <p className="text-xs text-body mt-0.5">{job.company}</p>
                        {job.walkInDetails?.date && (
                          <p className="text-xs text-saffron mt-2 font-bold uppercase tracking-wider">
                            {formatDate(job.walkInDetails.date, "EEE, dd MMM")}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Alert({ icon: Icon, title, body, cta }) {
  return (
    <div className="bg-canvas border border-saffron/30 rounded-xl p-5 flex items-center gap-4 mb-3">
      <div className="w-10 h-10 rounded-lg bg-saffron/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-saffron stroke-[1.5]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold tracking-tight text-ink">{title}</p>
        <p className="text-sm text-body mt-0.5">{body}</p>
      </div>
      <Link
        to={cta.to}
        className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-5 h-10 inline-flex items-center hover:bg-saffron-active transition-colors shrink-0"
      >
        {cta.label}
      </Link>
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
