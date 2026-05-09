/**
 * ApplicationCard — DESIGN.md "Disciplined warmth"
 *
 * Application status card with progress steps. Saffron progress bar,
 * hairline borders, two-weight typography.
 */

import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { MapPinIcon, CalendarIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";

import {
  getStatusLabel,
  getStatusColor,
  formatDate,
  formatSalary,
  timeAgo,
} from "../../utils/helpers";
import { Badge } from "@/components/ui/badge";

const STATUS_STEPS = ["applied", "viewed", "shortlisted", "interview_scheduled", "hired"];
const STEP_LABEL = {
  applied: "Applied",
  viewed: "Viewed",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview",
  hired: "Hired",
};

const STATUS_BADGE = {
  blue: "bg-saffron/10 text-saffron border-saffron/20",
  gray: "bg-canvas-warm text-muted-text border-hairline",
  yellow: "bg-marigold/10 text-marigold border-marigold/30",
  purple: "bg-saffron/10 text-saffron border-saffron/20",
  green: "bg-success/10 text-success border-success/20",
  red: "bg-error/10 text-error border-error/20",
};

export default function ApplicationCard({ application, onWithdraw }) {
  const { job, status, appliedAt, recruiterNotes, interviewSchedule } = application;
  if (!job) return null;

  const color = getStatusColor(status);
  const statusStep = STATUS_STEPS.indexOf(status);
  const isTerminal = ["hired", "rejected", "withdrawn"].includes(status);

  return (
    <div className="bg-canvas rounded-xl border border-hairline overflow-hidden hover:border-ink hover:shadow-card transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <Link
              to={`/jobs/${job._id}`}
              className="font-bold text-base tracking-tight text-ink hover:text-saffron transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <p className="text-sm text-body mt-1">{job.company}</p>
          </div>
          <Badge className={`${STATUS_BADGE[color] || STATUS_BADGE.gray} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full px-2.5`}>
            {getStatusLabel(status)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-text mb-5">
          {job.location?.city && (
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 stroke-[1.5]" />
              {job.location.city}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1.5">
              <CurrencyRupeeIcon className="h-3.5 w-3.5 stroke-[1.5]" />
              {formatSalary(job.salary)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 stroke-[1.5]" />
            Applied {timeAgo(appliedAt)}
          </span>
        </div>

        {/* Progress */}
        {!isTerminal && (
          <div className="mb-5">
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <div
                    className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                      idx <= statusStep
                        ? "bg-saffron text-on-primary"
                        : "bg-canvas-warm border border-hairline text-muted-soft"
                    )}
                  >
                    {idx < statusStep ? "✓" : idx + 1}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={clsx(
                        "flex-1 h-[2px] transition-colors",
                        idx < statusStep ? "bg-saffron" : "bg-hairline"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_STEPS.map((step, idx) => (
                <span
                  key={step}
                  className={clsx(
                    "text-[10px] uppercase tracking-wider font-bold transition-colors",
                    idx <= statusStep ? "text-saffron" : "text-muted-soft"
                  )}
                >
                  {STEP_LABEL[step]}
                </span>
              ))}
            </div>
          </div>
        )}

        {status === "interview_scheduled" && interviewSchedule?.date && (
          <div className="bg-saffron/5 border border-saffron/20 rounded-lg p-4 mb-4">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-saffron mb-1">
              Interview scheduled
            </p>
            <p className="text-sm text-ink font-bold">
              {formatDate(interviewSchedule.date)}
              {interviewSchedule.time && ` at ${interviewSchedule.time}`}
            </p>
            {interviewSchedule.mode && (
              <p className="text-xs text-body mt-0.5 capitalize">
                Mode: {interviewSchedule.mode}
              </p>
            )}
          </div>
        )}

        {recruiterNotes && (
          <div className="bg-canvas-warm border border-hairline rounded-lg p-4 mb-4">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-text mb-1">
              Recruiter's note
            </p>
            <p className="text-sm text-body leading-relaxed">{recruiterNotes}</p>
          </div>
        )}

        {status === "applied" && onWithdraw && (
          <div className="flex justify-end">
            <button
              onClick={() => onWithdraw(application._id)}
              className="text-xs uppercase tracking-wider text-error hover:text-error/80 font-bold transition-colors"
            >
              Withdraw application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
