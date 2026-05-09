/**
 * WalkInCard — DESIGN.md "Disciplined warmth"
 *
 * Distinct from JobCard: saffron left-border accent, urgency tier color,
 * embedded countdown for today's drives, sharp CTA on bottom.
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

import { formatDate, formatSalary } from "../../utils/helpers";
import { Badge } from "@/components/ui/badge";
import WalkInCountdown from "./WalkInCountdown";
import { D_HOVER, easeOutQuart } from "../../lib/motion";

const URGENCY = {
  100: { label: "Today",    classes: "border-marigold/40 text-marigold bg-marigold/5" },
  80:  { label: "Tomorrow", classes: "border-saffron/40 text-saffron bg-saffron/5" },
  50:  { label: "This week", classes: "border-saffron/30 text-saffron bg-saffron/5" },
  10:  { label: "Upcoming", classes: "border-hairline text-muted-text" },
};

export default function WalkInCard({ job }) {
  const {
    _id,
    title,
    company,
    location,
    salary,
    walkInDetails,
    urgencyScore,
  } = job;

  const urgency = URGENCY[urgencyScore] ?? URGENCY[10];
  const walkInDate = walkInDetails?.date ? new Date(walkInDetails.date) : null;
  const isToday = urgencyScore === 100;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: D_HOVER, ease: easeOutQuart }}
      className="bg-canvas border border-hairline border-l-4 border-l-saffron rounded-xl p-6 hover:shadow-card transition-shadow flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-saffron">
            Walk-in
          </span>
        </div>
        {urgencyScore != null && (
          <Badge
            className={`${urgency.classes} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full px-2.5`}
          >
            {urgency.label}
          </Badge>
        )}
      </div>

      {/* Title + company */}
      <div className="mb-5">
        <h3 className="text-xl font-bold tracking-tight text-ink leading-snug line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex items-center text-sm text-body gap-1.5">
          <BuildingOfficeIcon className="h-4 w-4 text-muted-soft stroke-[1.5]" />
          <span className="truncate">{company}</span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-canvas-warm border border-hairline rounded-xl p-4 space-y-3 mb-4 flex-1">
        {walkInDetails?.date && (
          <div className="flex items-start gap-2.5 text-sm text-ink">
            <ClockIcon className="h-4 w-4 text-saffron stroke-[1.5] mt-0.5" />
            <div className="font-bold tracking-tight">
              {formatDate(walkInDetails.date, "dd MMM yyyy")}
              {(walkInDetails.startTime || walkInDetails.endTime) && (
                <span className="text-muted-text font-normal">
                  {walkInDetails.startTime && ` · ${walkInDetails.startTime}`}
                  {walkInDetails.endTime && ` – ${walkInDetails.endTime}`}
                </span>
              )}
            </div>
          </div>
        )}

        {walkInDetails?.venue && (
          <div className="flex items-start gap-2.5 text-sm text-body">
            <MapPinIcon className="h-4 w-4 text-saffron stroke-[1.5] mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{walkInDetails.venue}</span>
          </div>
        )}

        {location?.city && !walkInDetails?.venue?.includes(location.city) && (
          <div className="flex items-center gap-2.5 text-sm text-body">
            <MapPinIcon className="h-4 w-4 text-muted-soft stroke-[1.5]" />
            <span>{location.city}, Gujarat</span>
          </div>
        )}

        {isToday && walkInDate && (
          <div className="pt-1 border-t border-hairline">
            <WalkInCountdown targetDate={walkInDate} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        {salary && (formatSalary(salary)) && (
          <div className="flex items-center gap-2 mb-4 text-ink font-bold text-sm">
            <CurrencyRupeeIcon className="h-4 w-4 text-muted-soft stroke-[1.5]" />
            {formatSalary(salary)}
          </div>
        )}
        <Link
          to={`/jobs/${_id}`}
          className="block w-full text-center bg-saffron hover:bg-saffron-active active:scale-[0.98] text-on-primary font-bold uppercase tracking-[0.05em] text-sm py-3 transition-all duration-150"
        >
          Review & apply
        </Link>
      </div>
    </motion.div>
  );
}
