/**
 * JobList — DESIGN.md "Disciplined warmth"
 *
 * Job results container. View toggle (grid/list), result count, empty
 * state. Uses motion stagger from lib/motion.js.
 */

import React from "react";
import { motion } from "framer-motion";
import { Squares2X2Icon, ListBulletIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

import JobCard from "./JobCard";
import LoadingSpinner from "../layout/LoadingSpinner";
import useJobStore from "../../store/useJobStore";
import { stagger, fadeUp } from "../../lib/motion";

export default function JobList({
  jobs = [],
  isLoading = false,
  emptyMessage = "No jobs found",
}) {
  const { viewMode, setViewMode } = useJobStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-text text-sm">Loading jobs...</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-canvas-warm border border-hairline rounded-xl flex items-center justify-center mb-5">
          <BriefcaseIcon className="h-7 w-7 text-muted-soft stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-ink mb-2">
          {emptyMessage}
        </h3>
        <p className="text-body text-sm max-w-sm">
          Try adjusting your search or filters to find more jobs.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-body">
          <span className="font-bold text-ink">{jobs.length}</span> {jobs.length === 1 ? "job" : "jobs"} found
        </p>
        <div className="flex items-center gap-1 border border-hairline rounded-full p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={`p-2 rounded-full transition-colors ${
              viewMode === "grid"
                ? "bg-ink text-on-dark"
                : "text-muted-soft hover:text-ink"
            }`}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`p-2 rounded-full transition-colors ${
              viewMode === "list"
                ? "bg-ink text-on-dark"
                : "text-muted-soft hover:text-ink"
            }`}
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 lg:grid-cols-2 gap-5"
            : "space-y-4"
        }
      >
        {jobs.map((job) => (
          <motion.div key={job._id} variants={fadeUp}>
            <JobCard job={job} compact={viewMode === "list"} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
