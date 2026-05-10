/**
 * ScrapedJobsPage — DESIGN.md "Disciplined warmth"
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import StatsCard from "../../components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "../../api/axios";

const SOURCE_BADGE = {
  linkedin: "bg-saffron/10 text-saffron border-saffron/20",
  indeed: "bg-saffron/10 text-saffron border-saffron/20",
  naukri: "bg-marigold/10 text-marigold border-marigold/30",
  manual: "bg-success/10 text-success border-success/20",
};

const STATUS_BADGE = {
  active: "bg-success/10 text-success border-success/20",
  pending_approval: "bg-marigold/10 text-marigold border-marigold/30",
  pending: "bg-marigold/10 text-marigold border-marigold/30",
  flagged: "bg-error/10 text-error border-error/20",
  closed: "bg-canvas-warm text-muted-text border-hairline",
};

export default function ScrapedJobsPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [search, setSearch] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["scrapedJobs", { filterStatus, filterSource, search }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/scraping/jobs?status=${filterStatus}&source=${filterSource}&search=${search}`,
      );
      return data.data;
    },
    retry: false,
  });

  const jobs = data?.jobs || [];

  const filteredJobs = jobs.filter((j) => {
    if (filterStatus !== "all" && j.status !== filterStatus) return false;
    if (filterSource !== "all" && j.source !== filterSource) return false;
    if (
      search &&
      !j.title.toLowerCase().includes(search.toLowerCase()) &&
      !j.company.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const approveMutation = useMutation({
    mutationFn: (jobId) => axiosInstance.put(`/admin/scraped-jobs/${jobId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries(["scrapedJobs"]);
      toast.success("Job approved and published");
    },
    onError: () => toast.error("Failed to approve job"),
  });

  const approveAllMutation = useMutation({
    mutationFn: () => axiosInstance.put(`/admin/scraped-jobs/approve-all`),
    onSuccess: (res) => {
      qc.invalidateQueries(["scrapedJobs"]);
      toast.success(`Approved ${res.data?.count || "all pending"} jobs`);
    },
    onError: () => toast.error("Failed to approve jobs"),
  });

  const rejectMutation = useMutation({
    mutationFn: (jobId) => axiosInstance.delete(`/admin/scraped-jobs/${jobId}/reject`),
    onSuccess: () => {
      qc.invalidateQueries(["scrapedJobs"]);
      toast.success("Job removed");
    },
    onError: () => toast.error("Failed to remove job"),
  });

  const triggerScraping = async () => {
    setIsScraping(true);
    try {
      await axiosInstance.post("/scraping/trigger");
      toast.success("Scraping started — new jobs will appear shortly");
      setTimeout(() => {
        qc.invalidateQueries(["scrapedJobs"]);
        setIsScraping(false);
      }, 3000);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Scraping is already running");
      } else {
        toast.error("Failed to trigger scraping");
      }
      setIsScraping(false);
    }
  };

  const pendingCount = jobs.filter((j) => j.status === "pending" || j.status === "pending_approval").length;
  const flaggedCount = jobs.filter((j) => j.status === "flagged").length;
  const approvedCount = jobs.filter((j) => j.status === "active").length;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                Scraped jobs
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight">
                Review aggregated jobs.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <button
                  onClick={() => approveAllMutation.mutate()}
                  disabled={approveAllMutation.isPending}
                  className="bg-canvas text-success border border-success/30 rounded-full px-5 h-10 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:bg-success/5 transition-colors disabled:opacity-60"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  {approveAllMutation.isPending ? "Approving..." : `Approve all (${pendingCount})`}
                </button>
              )}
              <button
                onClick={triggerScraping}
                disabled={isScraping}
                className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-5 h-10 inline-flex items-center gap-2 hover:bg-saffron-active transition-colors disabled:opacity-60"
              >
                <ArrowPathIcon className={`h-3.5 w-3.5 ${isScraping ? "animate-spin" : ""}`} />
                {isScraping ? "Scraping" : "Run scraping"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total scraped" value={jobs.length} icon={ClipboardDocumentListIcon} />
            <StatsCard title="Pending review" value={pendingCount} icon={MagnifyingGlassIcon} accent={pendingCount > 0} />
            <StatsCard title="Approved" value={approvedCount} icon={CheckCircleIcon} />
            <StatsCard title="Flagged" value={flaggedCount} icon={XCircleIcon} accent={flaggedCount > 0} />
          </div>

          {/* Filters */}
          <div className="bg-canvas border border-hairline rounded-xl p-5 mb-6 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft pointer-events-none" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron transition-all"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="active">Approved</option>
              <option value="flagged">Flagged</option>
            </select>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron transition-all"
            >
              <option value="all">All sources</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="naukri">Naukri</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className={`bg-canvas rounded-xl border p-6 transition-colors ${
                    job.status === "flagged"
                      ? "border-error/30"
                      : job.status === "pending" || job.status === "pending_approval"
                      ? "border-marigold/30"
                      : "border-hairline"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold tracking-tight text-ink">{job.title}</h3>
                        {job.isWalkIn && (
                          <Badge className="bg-saffron/10 text-saffron border-saffron/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                            Walk-in
                          </Badge>
                        )}
                        <Badge
                          className={`${SOURCE_BADGE[job.source] || SOURCE_BADGE.manual} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full`}
                        >
                          {job.source}
                        </Badge>
                        <Badge
                          className={`${STATUS_BADGE[job.status] || STATUS_BADGE.pending} uppercase tracking-[0.1em] text-[10px] font-bold rounded-full`}
                        >
                          {job.status === "active" ? "approved" : job.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-body flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                          <BuildingOfficeIcon className="h-3.5 w-3.5 text-muted-soft" />
                          {job.company}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5 text-muted-soft" />
                          {job.location?.city}, Gujarat
                        </span>
                        {job.salary?.min > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <CurrencyRupeeIcon className="h-3.5 w-3.5 text-muted-soft" />
                            {job.salary.min.toLocaleString()} – {job.salary.max?.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs text-muted-text">
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {job.tags?.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <TagIcon className="h-3.5 w-3.5 text-muted-soft" />
                          {job.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-canvas-warm border border-hairline text-body px-2 py-0.5 rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {job.sourceUrl && (
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted-soft hover:text-saffron hover:bg-canvas-warm rounded-md transition-colors"
                          title="View source"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>
                      )}
                      {job.status !== "active" && (
                        <button
                          onClick={() => approveMutation.mutate(job._id)}
                          disabled={approveMutation.isPending}
                          className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-4 h-9 inline-flex items-center gap-1.5 hover:bg-saffron-active transition-colors disabled:opacity-60"
                        >
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => rejectMutation.mutate(job._id)}
                        disabled={rejectMutation.isPending}
                        className="bg-canvas text-error border border-error/20 rounded-full px-4 h-9 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:bg-error/5 transition-colors disabled:opacity-60"
                      >
                        <XCircleIcon className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="bg-canvas border border-hairline rounded-xl text-center py-20">
                  <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-muted-soft stroke-[1.5] mb-4" />
                  <p className="text-ink font-bold tracking-tight">No scraped jobs found</p>
                  <p className="text-sm text-body mt-1">Try triggering a new scrape</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
