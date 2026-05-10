/**
 * ManageJobsPage — DESIGN.md "Disciplined warmth"
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  PlusCircleIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  UserGroupIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { jobsAPI } from "../../api/jobs.api";
import { timeAgo } from "../../utils/helpers";

const STATUS_BADGE = {
  active: "bg-success/10 text-success border-success/20",
  closed: "bg-canvas-warm text-muted-text border-hairline",
  draft: "bg-marigold/10 text-marigold border-marigold/30",
};

export default function ManageJobsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myJobs", statusFilter, page],
    queryFn: () =>
      jobsAPI.getMyJobs({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: 10,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: jobsAPI.delete,
    onSuccess: () => {
      toast.success("Job deleted");
      qc.invalidateQueries(["myJobs"]);
    },
    onError: () => toast.error("Failed to delete job"),
  });

  const closeMutation = useMutation({
    mutationFn: jobsAPI.close,
    onSuccess: () => {
      toast.success("Job closed");
      qc.invalidateQueries(["myJobs"]);
    },
    onError: () => toast.error("Failed to close job"),
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                Job postings
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight">
                Manage your jobs.
              </h1>
            </div>
            <Link
              to="/recruiter/post-job"
              className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-12 inline-flex items-center gap-2 hover:bg-saffron-active transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5 stroke-[1.5]" />
              Post new job
            </Link>
          </div>

          <div className="flex gap-2 mb-6">
            {["all", "active", "closed", "draft"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-4 h-9 rounded-full text-sm font-bold tracking-tight capitalize border transition-colors ${
                  statusFilter === s
                    ? "bg-ink text-on-dark border-ink"
                    : "bg-canvas text-ink border-hairline hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-canvas border border-hairline rounded-xl p-16 text-center">
              <BriefcaseIcon className="h-14 w-14 text-muted-soft stroke-[1.5] mx-auto mb-5" />
              <h3 className="text-xl font-bold tracking-tight text-ink mb-2">
                No jobs posted yet
              </h3>
              <Link
                to="/recruiter/post-job"
                className="mt-4 inline-flex items-center bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-10 hover:bg-saffron-active transition-colors"
              >
                Post your first job
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-canvas border border-hairline rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-canvas-warm border-b border-hairline">
                    <tr>
                      <Th>Job</Th>
                      <Th className="hidden md:table-cell">Location</Th>
                      <Th>Applicants</Th>
                      <Th>Status</Th>
                      <Th>Posted</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-canvas-warm transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-bold tracking-tight text-ink text-sm">{job.title}</p>
                          <p className="text-xs text-body">{job.company}</p>
                          <div className="flex gap-1.5 mt-1.5">
                            {job.isWalkIn && (
                              <Badge className="bg-saffron/10 text-saffron border-saffron/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                                Walk-in
                              </Badge>
                            )}
                            {job.isGuaranteedHiring && (
                              <Badge className="bg-success/10 text-success border-success/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                                Guaranteed
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-sm text-body">{job.location?.city}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/recruiter/jobs/${job._id}/applicants`}
                            className="text-saffron hover:underline text-sm font-bold inline-flex items-center gap-1.5"
                          >
                            <UserGroupIcon className="h-4 w-4" />
                            {job.applicantCount || 0}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={`${STATUS_BADGE[job.status] || STATUS_BADGE.closed} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full px-2.5`}
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-text">{timeAgo(job.createdAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton to={`/jobs/${job._id}`} title="View">
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                            {job.status === "active" && (
                              <IconButton
                                onClick={() => closeMutation.mutate(job._id)}
                                title="Close job"
                                tone="warning"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </IconButton>
                            )}
                            <IconButton
                              onClick={() => {
                                if (confirm("Delete this job? This cannot be undone.")) {
                                  deleteMutation.mutate(job._id);
                                }
                              }}
                              title="Delete"
                              tone="error"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
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

function Th({ children, className = "" }) {
  return (
    <th
      className={`text-left px-4 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-text ${className}`}
    >
      {children}
    </th>
  );
}

function IconButton({ children, to, onClick, title, tone = "default" }) {
  const cls =
    tone === "error"
      ? "text-muted-soft hover:text-error hover:bg-error/10"
      : tone === "warning"
      ? "text-muted-soft hover:text-marigold hover:bg-marigold/10"
      : "text-muted-soft hover:text-ink hover:bg-canvas-warm";
  const inner = <span className={`p-1.5 rounded-md transition-colors ${cls}`}>{children}</span>;
  return to ? (
    <Link to={to} title={title}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} title={title}>
      {inner}
    </button>
  );
}
