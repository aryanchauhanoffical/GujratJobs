/**
 * ViewApplicantsPage — DESIGN.md "Disciplined warmth"
 */

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { applicationsAPI } from "../../api/applications.api";
import { timeAgo, getInitials } from "../../utils/helpers";

const STATUS_OPTIONS = [
  { value: "shortlisted", label: "Shortlist", icon: StarIcon, tone: "marigold" },
  { value: "interview_scheduled", label: "Interview", icon: CalendarDaysIcon, tone: "saffron" },
  { value: "hired", label: "Hire", icon: CheckIcon, tone: "success" },
  { value: "rejected", label: "Reject", icon: XMarkIcon, tone: "error" },
];

const STATUS_BADGE = {
  applied: "bg-saffron/10 text-saffron border-saffron/20",
  viewed: "bg-canvas-warm text-muted-text border-hairline",
  shortlisted: "bg-marigold/10 text-marigold border-marigold/30",
  interview_scheduled: "bg-saffron/10 text-saffron border-saffron/20",
  hired: "bg-success/10 text-success border-success/20",
  rejected: "bg-error/10 text-error border-error/20",
};

export default function ViewApplicantsPage() {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId, statusFilter],
    queryFn: () =>
      applicationsAPI.getJobApplications(jobId, {
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, recruiterNotes }) =>
      applicationsAPI.updateStatus(id, { status, recruiterNotes }),
    onSuccess: () => {
      toast.success("Application status updated");
      qc.invalidateQueries(["jobApplications", jobId]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const applications = data?.applications || [];
  const job = data?.job;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-text hover:text-ink mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to jobs
          </Link>

          <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
            Applicants
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight">
            {job?.title || "Job applicants"}
          </h1>
          {job && <p className="text-body mt-2">{job.company}</p>}

          {/* Filter chips */}
          <div className="flex gap-2 mt-8 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {[
              "all",
              "applied",
              "viewed",
              "shortlisted",
              "interview_scheduled",
              "hired",
              "rejected",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 h-9 rounded-full text-sm font-bold tracking-tight whitespace-nowrap capitalize border transition-colors ${
                  statusFilter === s
                    ? "bg-ink text-on-dark border-ink"
                    : "bg-canvas text-ink border-hairline hover:border-ink"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-canvas border border-hairline rounded-xl p-16 text-center">
              <p className="text-ink font-bold tracking-tight text-lg">No applications found</p>
              <p className="text-body text-sm mt-2">
                Try changing the filter, or wait for new candidates to apply.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-canvas rounded-xl border border-hairline p-6 hover:border-ink transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-saffron text-on-primary flex items-center justify-center font-bold overflow-hidden shrink-0">
                      {app.applicant?.profilePic ? (
                        <img
                          src={app.applicant.profilePic}
                          alt={app.applicant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(app.applicant?.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold tracking-tight text-ink truncate">
                          {app.applicant?.name}
                        </h3>
                        <Badge
                          className={`${STATUS_BADGE[app.status] || STATUS_BADGE.viewed} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full px-2.5 shrink-0`}
                        >
                          {app.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-text">
                        {app.applicant?.location?.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {app.applicant.location.city}
                          </span>
                        )}
                        <span>{app.applicant?.experience || 0} yrs exp</span>
                        <span>Applied {timeAgo(app.appliedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {app.applicant?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {app.applicant.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-canvas-warm border border-hairline text-body px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.coverLetter && (
                    <p className="text-sm text-body bg-canvas-warm border-l-2 border-saffron/40 rounded-r-md p-3 mb-4 line-clamp-2 italic">
                      "{app.coverLetter}"
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-4 text-xs">
                    {app.applicant?.email && (
                      <a
                        href={`mailto:${app.applicant.email}`}
                        className="inline-flex items-center gap-1 text-body hover:text-saffron font-bold"
                      >
                        <EnvelopeIcon className="h-3.5 w-3.5" />
                        Email
                      </a>
                    )}
                    {app.applicant?.phone && (
                      <a
                        href={`tel:${app.applicant.phone}`}
                        className="inline-flex items-center gap-1 text-body hover:text-saffron font-bold"
                      >
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {app.applicant.phone}
                      </a>
                    )}
                    {app.resumeSnapshot?.url && (
                      <a
                        href={app.resumeSnapshot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-saffron hover:underline font-bold"
                      >
                        <DocumentTextIcon className="h-3.5 w-3.5" />
                        Resume
                      </a>
                    )}
                  </div>

                  {!["hired", "rejected"].includes(app.status) && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-hairline">
                      {STATUS_OPTIONS.map((opt) => (
                        <ActionChip
                          key={opt.value}
                          icon={opt.icon}
                          tone={opt.tone}
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({ id: app._id, status: opt.value })
                          }
                        >
                          {opt.label}
                        </ActionChip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ActionChip({ icon: Icon, tone, onClick, disabled, children }) {
  const cls = {
    saffron: "text-saffron hover:bg-saffron/5 border-saffron/20",
    marigold: "text-marigold hover:bg-marigold/5 border-marigold/30",
    success: "text-success hover:bg-success/5 border-success/20",
    error: "text-error hover:bg-error/5 border-error/20",
  }[tone];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs font-bold uppercase tracking-wider px-3 h-8 rounded-full border bg-canvas inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
