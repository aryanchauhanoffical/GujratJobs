/**
 * JobCard — DESIGN.md "Disciplined warmth"
 *
 * The most reused card in the app. 12px radius, hairline border,
 * whisper-of-lift hover, sharp 0px primary CTA on apply, no gradients,
 * no emoji, two-weight typography only.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

import {
  formatSalary,
  timeAgo,
  getJobTypeLabel,
  getExpLevelLabel,
  formatDate,
} from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "@/components/ui/badge";
import ApplyModal from "./ApplyModal";
import { D_HOVER, easeOutQuart } from "../../lib/motion";

export default function JobCard({ job, compact = false }) {
  const { user, isAuthenticated } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const {
    _id,
    title,
    company,
    companyLogo,
    location,
    salary,
    type,
    experienceLevel,
    isWalkIn,
    walkInDetails,
    isGuaranteedHiring,
    fastTrack,
    isFresherFriendly,
    applicantCount = 0,
    createdAt,
    source,
    skills = [],
  } = job;

  const hasHighResponse = applicantCount < 10;

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: D_HOVER, ease: easeOutQuart }}
        className={`bg-canvas rounded-xl border ${
          isWalkIn ? "border-l-4 border-l-saffron border-hairline" : "border-hairline"
        } hover:border-ink hover:shadow-card transition-all duration-200 overflow-hidden`}
      >
        {isWalkIn && (
          <div className="bg-saffron px-5 py-2 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-on-primary stroke-[2]" />
            <p className="text-on-primary text-xs font-bold tracking-wide uppercase">
              Walk-in
              {walkInDetails?.date && ` · ${formatDate(walkInDetails.date, "dd MMM")}`}
              {walkInDetails?.startTime && ` · ${walkInDetails.startTime}`}
            </p>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-surface-soft flex items-center justify-center shrink-0 border border-hairline overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt={company} className="w-full h-full object-cover" />
                ) : (
                  <BuildingOfficeIcon className="h-6 w-6 text-muted-soft stroke-[1.5]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/jobs/${_id}`}
                  className="font-bold text-base tracking-tight text-ink hover:text-saffron transition-colors line-clamp-1"
                >
                  {title}
                </Link>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm text-body truncate">{company}</span>
                  {isGuaranteedHiring && (
                    <CheckBadgeIcon
                      className="h-4 w-4 text-success shrink-0"
                      title="Verified company"
                    />
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-soft shrink-0 inline-flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {timeAgo(createdAt)}
            </span>
          </div>

          {/* Tags row */}
          {(isGuaranteedHiring || fastTrack || isFresherFriendly || source === "scraped") && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {isGuaranteedHiring && (
                <Badge className="bg-success/10 text-success border-success/20 rounded-full text-[11px] uppercase font-bold tracking-wider">
                  Guaranteed
                </Badge>
              )}
              {fastTrack && (
                <Badge className="bg-marigold/10 text-marigold border-marigold/30 rounded-full text-[11px] uppercase font-bold tracking-wider">
                  Fast track
                </Badge>
              )}
              {isFresherFriendly && (
                <Badge className="bg-saffron/10 text-saffron border-saffron/20 rounded-full text-[11px] uppercase font-bold tracking-wider">
                  Fresher friendly
                </Badge>
              )}
              {source === "scraped" && (
                <Badge className="bg-surface-soft text-muted-text border-hairline rounded-full text-[11px] uppercase font-bold tracking-wider">
                  External
                </Badge>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4 text-sm text-body">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-muted-soft stroke-[1.5]" />
                {location?.city}, {location?.state || "Gujarat"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CurrencyRupeeIcon className="h-4 w-4 text-muted-soft stroke-[1.5]" />
                {formatSalary(salary)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="bg-surface-soft text-muted-text px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {getJobTypeLabel(type)}
              </span>
              <span className="bg-surface-soft text-muted-text px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {getExpLevelLabel(experienceLevel)}
              </span>
            </div>
          </div>

          {skills.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1 mb-4">
              {skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs text-body bg-canvas-warm border border-hairline px-2 py-0.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-xs text-muted-soft self-center">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <div className="text-xs text-muted-text">
              {hasHighResponse ? (
                <span className="font-bold text-success uppercase tracking-wider">
                  High response chance
                </span>
              ) : (
                <span>{applicantCount} applicants</span>
              )}
            </div>

            {isAuthenticated && user?.role === "jobseeker" ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-5 h-9 inline-flex items-center gap-2 hover:bg-saffron-active active:scale-[0.98] transition-colors duration-150"
              >
                Apply
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                to={`/jobs/${_id}`}
                className="text-ink hover:text-saffron text-sm font-bold tracking-tight inline-flex items-center gap-1.5 transition-colors"
              >
                View details
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {showApplyModal && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />
      )}
    </>
  );
}
