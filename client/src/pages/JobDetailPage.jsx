/**
 * JobDetailPage — DESIGN.md "Disciplined warmth"
 *
 * Conversion moment. Charcoal hero band with title, cream details,
 * sharp apply CTA, walk-in action panel with phone/whatsapp/email/maps.
 */

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  PhoneIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LoadingSpinner from "../components/layout/LoadingSpinner";
import ApplyModal from "../components/jobs/ApplyModal";
import { Badge } from "@/components/ui/badge";
import { jobsAPI } from "../api/jobs.api";
import {
  formatSalary,
  timeAgo,
  formatDate,
  getJobTypeLabel,
  getExpLevelLabel,
} from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { fadeUp, easeOutCirc, D_REVEAL } from "../lib/motion";

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsAPI.getById(id),
    enabled: !!id,
  });

  const job = data?.job;
  const hasApplied = data?.hasApplied;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink mb-3">
              Job not found
            </h2>
            <p className="text-body mb-6">
              The job you're looking for doesn't exist or has closed.
            </p>
            <Link
              to="/jobs"
              className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm px-6 h-12 inline-flex items-center hover:bg-saffron-active active:scale-[0.98] transition-all duration-150"
            >
              Browse other jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      {/* Hero band — charcoal if walk-in, cream otherwise */}
      <section
        className={`${
          job.isWalkIn
            ? "bg-surface-dark text-on-dark"
            : "bg-canvas-warm text-ink"
        } pt-16 pb-12 px-6 border-b ${
          job.isWalkIn ? "border-on-dark/10" : "border-hairline"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <Link
            to="/jobs"
            className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-tight mb-8 transition-colors ${
              job.isWalkIn
                ? "text-on-dark/70 hover:text-marigold"
                : "text-muted-text hover:text-ink"
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to jobs
          </Link>

          {job.isWalkIn && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: D_REVEAL, ease: easeOutCirc }}
              className="text-[13px] font-bold tracking-[0.15em] uppercase text-marigold mb-4 inline-flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marigold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-marigold"></span>
              </span>
              Walk-in interview
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutCirc }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] max-w-4xl"
          >
            {job.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutCirc }}
            className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-base"
          >
            <span className={`inline-flex items-center gap-2 font-bold ${job.isWalkIn ? "text-on-dark" : "text-ink"}`}>
              <BuildingOfficeIcon className="h-5 w-5 stroke-[1.5]" />
              {job.company}
              {job.isGuaranteedHiring && (
                <CheckBadgeIcon className="h-5 w-5 text-success" title="Verified company" />
              )}
            </span>
            <span className={`inline-flex items-center gap-2 ${job.isWalkIn ? "text-on-dark/70" : "text-body"}`}>
              <MapPinIcon className="h-4 w-4 stroke-[1.5]" />
              {job.location?.city}, {job.location?.state || "Gujarat"}
            </span>
            <span className={`inline-flex items-center gap-2 text-sm ${job.isWalkIn ? "text-on-dark/70" : "text-muted-text"}`}>
              <ClockIcon className="h-4 w-4 stroke-[1.5]" />
              {timeAgo(job.createdAt)}
            </span>
          </motion.div>

          {job.isWalkIn && job.walkInDetails && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOutCirc }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl"
            >
              {job.walkInDetails.date && (
                <div>
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-marigold mb-1">
                    Date
                  </div>
                  <div className="text-lg font-bold tracking-tight text-on-dark">
                    {formatDate(job.walkInDetails.date, "EEE, dd MMM")}
                  </div>
                </div>
              )}
              {(job.walkInDetails.startTime || job.walkInDetails.endTime) && (
                <div>
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-marigold mb-1">
                    Time
                  </div>
                  <div className="text-lg font-bold tracking-tight text-on-dark">
                    {job.walkInDetails.startTime}
                    {job.walkInDetails.endTime &&
                      ` – ${job.walkInDetails.endTime}`}
                  </div>
                </div>
              )}
              {job.walkInDetails.venue && (
                <div className="sm:col-span-1">
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-marigold mb-1">
                    Venue
                  </div>
                  <div className="text-sm text-on-dark/90 leading-snug">
                    {job.walkInDetails.venue}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <main className="flex-1 py-12 px-6 bg-canvas-warm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {job.isGuaranteedHiring && (
                  <Badge className="bg-success/10 text-success border-success/20 rounded-full text-[11px] uppercase font-bold tracking-wider">
                    Guaranteed hiring
                  </Badge>
                )}
                {job.fastTrack && (
                  <Badge className="bg-marigold/10 text-marigold border-marigold/30 rounded-full text-[11px] uppercase font-bold tracking-wider">
                    Fast track
                  </Badge>
                )}
                {job.isFresherFriendly && (
                  <Badge className="bg-saffron/10 text-saffron border-saffron/20 rounded-full text-[11px] uppercase font-bold tracking-wider">
                    Fresher friendly
                  </Badge>
                )}
                {job.source === "scraped" && (
                  <Badge className="bg-canvas text-muted-text border-hairline rounded-full text-[11px] uppercase font-bold tracking-wider">
                    External
                  </Badge>
                )}
              </div>

              {/* Key facts grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-canvas border border-hairline rounded-xl p-6">
                <FactCell label="Salary" value={formatSalary(job.salary)} />
                <FactCell label="Type" value={getJobTypeLabel(job.type)} />
                <FactCell label="Experience" value={getExpLevelLabel(job.experienceLevel)} />
                <FactCell label="Openings" value={`${job.openings || 1}`} />
              </div>

              {/* Description */}
              <Section title="Job description">
                <div className="prose prose-sm max-w-none text-body whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </Section>

              {job.requirements?.length > 0 && (
                <Section title="Requirements">
                  <ul className="space-y-2.5">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-body">
                        <span className="text-saffron mt-1.5 shrink-0 w-1 h-1 rounded-full bg-saffron" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {job.skills?.length > 0 && (
                <Section title="Required skills">
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-canvas-warm border border-hairline text-ink px-3 py-1.5 rounded-md text-sm font-bold tracking-tight"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {job.benefits?.length > 0 && (
                <Section title="Benefits">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-sm text-body">
                        <CheckCircleIcon className="h-4 w-4 text-success stroke-[1.5] shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-canvas border border-hairline rounded-xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-text mb-2">
                    Salary
                  </div>
                  <div className="text-2xl font-bold tracking-tighter text-ink">
                    {formatSalary(job.salary)}
                  </div>
                  {job.salary?.isNegotiable && (
                    <p className="text-xs text-muted-text mt-1">Negotiable</p>
                  )}
                </div>

                {isAuthenticated && user?.role === "jobseeker" ? (
                  hasApplied ? (
                    <div>
                      <div className="bg-success-soft border border-success/20 rounded-lg p-4 mb-4 flex items-center gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-success stroke-[2]" />
                        <div>
                          <p className="text-sm font-bold text-success">Applied</p>
                          <p className="text-xs text-success/80">Track in My applications</p>
                        </div>
                      </div>
                      <Link
                        to="/applications"
                        className="bg-canvas text-ink border border-hairline-strong rounded-full w-full h-10 inline-flex items-center justify-center text-sm font-bold hover:border-ink transition-colors"
                      >
                        View applications
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm w-full py-3.5 hover:bg-saffron-active active:scale-[0.98] transition-all duration-150"
                    >
                      Apply now
                    </button>
                  )
                ) : !isAuthenticated ? (
                  <div>
                    <Link
                      to="/register"
                      className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-sm w-full py-3.5 inline-flex items-center justify-center hover:bg-saffron-active active:scale-[0.98] transition-all duration-150"
                    >
                      Apply now
                    </Link>
                    <p className="text-xs text-muted-text text-center mt-3">
                      Have an account?{" "}
                      <Link to="/login" className="text-saffron font-bold">
                        Sign in
                      </Link>
                    </p>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 mt-4">
                  <button className="bg-canvas-warm text-ink border border-hairline rounded-full flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-bold hover:border-ink transition-colors">
                    <BookmarkIcon className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button className="bg-canvas-warm text-ink border border-hairline rounded-full flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-bold hover:border-ink transition-colors">
                    <ShareIcon className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>

                <div className="mt-5 pt-5 border-t border-hairline space-y-2.5 text-sm">
                  <Stat label="Applicants" value={job.applicantCount || 0} />
                  <Stat label="Views" value={job.views || 0} />
                  {job.deadline && (
                    <Stat
                      label="Deadline"
                      value={formatDate(job.deadline)}
                      valueColor="text-error"
                    />
                  )}
                  {job.qualification && job.qualification !== "Any" && (
                    <Stat label="Qualification" value={job.qualification} />
                  )}
                </div>
              </div>

              {/* Walk-in action panel */}
              {job.isWalkIn && (
                <div className="bg-canvas border border-saffron/30 rounded-xl p-6">
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-saffron mb-4">
                    Walk-in actions
                  </div>

                  {job.walkInDetails?.contactPerson && (
                    <p className="text-sm text-body mb-4">
                      Contact: <strong className="text-ink">{job.walkInDetails.contactPerson}</strong>
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    {job.walkInDetails?.contactPhone && (
                      <ActionButton
                        href={`tel:${job.walkInDetails.contactPhone}`}
                        icon={PhoneIcon}
                        primary
                      >
                        Call {job.walkInDetails.contactPhone}
                      </ActionButton>
                    )}
                    {job.walkInDetails?.contactPhone && (
                      <ActionButton
                        href={`https://wa.me/91${job.walkInDetails.contactPhone.replace(/\D/g, "").slice(-10)}`}
                        external
                        icon={WhatsAppIcon}
                      >
                        WhatsApp
                      </ActionButton>
                    )}
                    {job.walkInDetails?.contactEmail && (
                      <ActionButton
                        href={`mailto:${job.walkInDetails.contactEmail}`}
                        icon={EnvelopeIcon}
                      >
                        Email HR
                      </ActionButton>
                    )}
                    {job.walkInDetails?.venue && (
                      <ActionButton
                        href={`https://maps.google.com/?q=${encodeURIComponent(job.walkInDetails.venue)}`}
                        external
                        icon={MapPinIcon}
                      >
                        Get directions
                      </ActionButton>
                    )}
                  </div>
                </div>
              )}

              {job.sourceUrl && (
                <div className="bg-canvas-warm border border-hairline rounded-xl p-4">
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-text mb-2">
                    External listing
                  </p>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-saffron hover:underline inline-flex items-center gap-1.5"
                  >
                    View original
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showApplyModal && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />
      )}

      <Footer />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      className="bg-canvas border border-hairline rounded-xl p-6"
    >
      <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-5">
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function FactCell({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-text mb-1.5">
        {label}
      </p>
      <p className="text-sm font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function Stat({ label, value, valueColor = "text-ink" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-text">{label}</span>
      <span className={`font-bold tracking-tight ${valueColor}`}>{value}</span>
    </div>
  );
}

function ActionButton({ href, icon: Icon, children, primary = false, external = false }) {
  const base = primary
    ? "bg-saffron text-on-primary hover:bg-saffron-active"
    : "bg-canvas-warm text-ink border border-hairline hover:border-ink";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${base} flex items-center gap-2.5 px-4 py-3 text-sm font-bold tracking-tight transition-all duration-150 active:scale-[0.98]`}
    >
      <Icon className="h-4 w-4 stroke-[1.5]" />
      {children}
    </a>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
