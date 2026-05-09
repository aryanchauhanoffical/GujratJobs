/**
 * ApplyModal — DESIGN.md "Disciplined warmth"
 *
 * Modal for job application. Sharp 0px primary CTA on submit, full-pill
 * secondary on cancel. Uses motion for backdrop fade + content slide-up.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import { applicationsAPI } from "../../api/applications.api";
import { formatSalary } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import { easeOutCirc } from "../../lib/motion";

export default function ApplyModal({ job, onClose }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");

  const applyMutation = useMutation({
    mutationFn: () =>
      applicationsAPI.apply(job._id, {
        coverLetter,
        expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
      }),
    onSuccess: () => {
      toast.success("Application submitted");
      qc.invalidateQueries(["myApplications"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to apply");
    },
  });

  const noResume = !user?.resume?.url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: easeOutCirc }}
          onClick={(e) => e.stopPropagation()}
          className="bg-canvas rounded-xl max-w-lg w-full shadow-modal"
        >
          {noResume ? <NoResumeContent navigate={navigate} onClose={onClose} /> : (
            <>
              <div className="flex items-start justify-between px-6 py-5 border-b border-hairline">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-saffron mb-2">
                    Apply
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-ink">{job.title}</h3>
                  <p className="text-sm text-body mt-1">
                    {job.company} · {job.location?.city}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-muted-soft hover:text-ink transition-colors p-1"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-success-soft border border-success/20 rounded-lg p-3 flex items-center gap-3">
                  <DocumentCheckIcon className="h-5 w-5 text-success stroke-[1.5]" />
                  <div>
                    <p className="text-sm font-bold text-success">Resume ready</p>
                    <p className="text-xs text-success/80">{user.resume.filename}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-2">
                    Expected salary (monthly)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft text-sm">₹</span>
                    <input
                      type="number"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      placeholder={job.salary?.max ? `Up to ${job.salary.max}` : "Enter amount"}
                      className="w-full pl-7 pr-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all"
                    />
                  </div>
                  {job.salary && (
                    <p className="text-xs text-muted-text mt-1.5">
                      Job offers: {formatSalary(job.salary)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-2">
                    Cover letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the recruiter why you're a great fit for this role..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas resize-none focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all"
                  />
                  <p className="text-xs text-muted-soft mt-1.5 text-right tabular-nums">
                    {coverLetter.length}/1000
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 flex items-center gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="bg-canvas text-ink border border-hairline-strong rounded-full px-6 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-6 h-10 inline-flex items-center gap-2 hover:bg-saffron-active active:scale-[0.98] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {applyMutation.isPending ? (
                    <>
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-on-primary/40 border-t-on-primary rounded-full" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-3.5 w-3.5" />
                      Submit application
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function NoResumeContent({ navigate, onClose }) {
  return (
    <div className="p-8 text-center">
      <div className="w-14 h-14 bg-marigold/10 border border-marigold/30 rounded-xl flex items-center justify-center mx-auto mb-5">
        <ExclamationTriangleIcon className="h-7 w-7 text-marigold stroke-[1.5]" />
      </div>
      <h3 className="text-xl font-bold tracking-tight text-ink mb-2">
        Resume required
      </h3>
      <p className="text-body text-sm mb-7 max-w-sm mx-auto leading-relaxed">
        Upload your resume from your profile before applying to jobs.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onClose}
          className="bg-canvas text-ink border border-hairline-strong rounded-full px-6 h-10 inline-flex items-center text-sm font-bold hover:border-ink transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onClose();
            navigate("/profile");
          }}
          className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-6 h-10 inline-flex items-center hover:bg-saffron-active active:scale-[0.98] transition-colors duration-150"
        >
          Upload resume
        </button>
      </div>
    </div>
  );
}
