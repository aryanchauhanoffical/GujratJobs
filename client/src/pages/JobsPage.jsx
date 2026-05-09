/**
 * JobsPage — DESIGN.md "Disciplined warmth"
 *
 * Browse experience. Cream hero band with title + count + search,
 * sticky filter sidebar (desktop), bottom-sheet on mobile, BMW-style
 * pagination with hairline borders.
 */

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import JobList from "../components/jobs/JobList";
import JobFilters from "../components/jobs/JobFilters";
import JobSearch from "../components/jobs/JobSearch";
import useJobStore from "../store/useJobStore";
import { jobsAPI } from "../api/jobs.api";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "-salary.max", label: "Highest salary" },
  { value: "salary.min", label: "Lowest salary" },
  { value: "-views", label: "Most viewed" },
];

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { filters, setFilters, setFilter, pagination, setPage } = useJobStore();

  useEffect(() => {
    const urlFilters = {};
    if (searchParams.get("search")) urlFilters.search = searchParams.get("search");
    if (searchParams.get("city")) urlFilters.city = searchParams.get("city");
    if (searchParams.get("category")) urlFilters.category = searchParams.get("category");
    if (searchParams.get("isWalkIn") === "true") urlFilters.isWalkIn = true;
    if (Object.keys(urlFilters).length > 0) setFilters(urlFilters);
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["jobs", filters, pagination.page],
    queryFn: () =>
      jobsAPI.getAll({
        ...filters,
        isWalkIn: filters.isWalkIn || undefined,
        isGuaranteedHiring: filters.isGuaranteedHiring || undefined,
        fastTrack: filters.fastTrack || undefined,
        isFresherFriendly: filters.isFresherFriendly || undefined,
        page: pagination.page,
        limit: pagination.limit,
      }),
    keepPreviousData: true,
  });

  const jobs = data?.jobs || [];
  const total = data?.pagination?.total || 0;
  const pages = data?.pagination?.pages || 1;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />

      <main className="flex-1">
        {/* Hero header */}
        <div className="bg-canvas-warm border-b border-hairline py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
              {filters.city ? filters.city : "All Gujarat"}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-ink">
              {filters.city ? `Jobs in ${filters.city}` : "Find your next job"}
            </h1>
            <p className="text-body text-base mt-3">
              <span className="font-bold text-ink tabular-nums">
                {total.toLocaleString()}
              </span>{" "}
              {total === 1 ? "job" : "jobs"} found
              {filters.search ? ` for "${filters.search}"` : ""}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <JobSearch className="flex-1 min-w-[260px]" />
              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                className="px-4 py-3 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all min-w-[170px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden bg-canvas text-ink border border-hairline-strong rounded-full px-5 h-12 inline-flex items-center gap-2 text-sm font-bold hover:border-ink transition-colors"
              >
                <FunnelIcon className="h-4 w-4 stroke-[1.5]" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex gap-8">
            <aside className="hidden md:block w-72 shrink-0">
              <div className="sticky top-24">
                <JobFilters />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <JobList
                jobs={jobs}
                isLoading={isLoading || isFetching}
                emptyMessage={
                  filters.search
                    ? `No jobs found for "${filters.search}"`
                    : "No jobs found with current filters"
                }
              />

              {pages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-12">
                  <PaginationButton
                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </PaginationButton>
                  {[...Array(Math.min(7, pages))].map((_, i) => {
                    const page = i + 1;
                    const active = pagination.page === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-10 h-10 rounded-full text-sm font-bold tracking-tight transition-colors tabular-nums ${
                          active
                            ? "bg-ink text-on-dark"
                            : "bg-canvas text-ink border border-hairline hover:border-ink"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <PaginationButton
                    onClick={() => setPage(Math.min(pages, pagination.page + 1))}
                    disabled={pagination.page === pages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </PaginationButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-ink/50 z-50 flex items-end"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="bg-canvas w-full max-h-[85vh] overflow-y-auto rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-canvas border-b border-hairline px-5 py-4 flex items-center justify-between">
              <span className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink">
                Filters
              </span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-muted-soft hover:text-ink"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <JobFilters onClose={() => setShowMobileFilters(false)} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function PaginationButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 rounded-full bg-canvas text-ink border border-hairline hover:border-ink inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
