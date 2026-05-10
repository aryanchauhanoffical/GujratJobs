/**
 * MyApplicationsPage — DESIGN.md "Disciplined warmth"
 *
 * Filtered list of user's applications. Status pill chips, BMW pagination.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import ApplicationCard from "../../components/dashboard/ApplicationCard";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { applicationsAPI } from "../../api/applications.api";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview_scheduled", label: "Interview" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export default function MyApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myApplications", statusFilter, page],
    queryFn: () =>
      applicationsAPI.getMyApplications({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: 10,
      }),
  });

  const withdrawMutation = useMutation({
    mutationFn: applicationsAPI.withdraw,
    onSuccess: () => {
      toast.success("Application withdrawn");
      qc.invalidateQueries(["myApplications"]);
    },
    onError: () => toast.error("Failed to withdraw"),
  });

  const applications = data?.applications || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
            My applications
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight mb-8">
            Track your progress.
          </h1>

          {/* Filter chips */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(1);
                }}
                className={`px-4 h-9 rounded-full text-sm font-bold tracking-tight whitespace-nowrap border transition-colors ${
                  statusFilter === opt.value
                    ? "bg-ink text-on-dark border-ink"
                    : "bg-canvas text-ink border-hairline hover:border-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-canvas border border-hairline rounded-xl p-16 text-center">
              <BriefcaseIcon className="h-14 w-14 text-muted-soft stroke-[1.5] mx-auto mb-5" />
              <h3 className="text-xl font-bold tracking-tight text-ink mb-2">
                {statusFilter === "all"
                  ? "No applications yet"
                  : `No ${statusFilter.replace("_", " ")} applications`}
              </h3>
              <p className="text-body text-sm mb-7 max-w-sm mx-auto">
                {statusFilter === "all"
                  ? "Start applying to verified Gujarat jobs and walk-ins."
                  : "Try another filter to see your applications."}
              </p>
              {statusFilter === "all" && (
                <Link
                  to="/jobs"
                  className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 inline-flex items-center hover:bg-saffron-active transition-colors"
                >
                  Browse jobs
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    onWithdraw={(id) => withdrawMutation.mutate(id)}
                  />
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-body tabular-nums">
                    Page <span className="font-bold text-ink">{page}</span> of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
