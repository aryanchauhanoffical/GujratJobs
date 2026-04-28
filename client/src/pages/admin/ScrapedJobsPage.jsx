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
  LinkIcon,
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axios";
import { formatDistanceToNow } from "date-fns";

const ADMIN_SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: ChartBarIcon },
  { label: "Manage Users", href: "/admin/users", icon: UsersIcon },
  {
    label: "Manage Recruiters",
    href: "/admin/recruiters",
    icon: BuildingOfficeIcon,
  },
  {
    label: "Scraped Jobs",
    href: "/admin/scraped-jobs",
    icon: ClipboardDocumentListIcon,
  },
];

const SOURCE_COLORS = {
  linkedin: "bg-blue-100 text-blue-700",
  indeed: "bg-purple-100 text-purple-700",
  naukri: "bg-orange-100 text-orange-700",
  manual: "bg-green-100 text-green-700",
};

const DEMO_SCRAPED_JOBS = [
  {
    _id: "sj1",
    title: "Software Developer (Fresher)",
    company: "Infosys BPM",
    location: { city: "Ahmedabad", state: "Gujarat" },
    salary: { min: 20000, max: 35000 },
    experienceLevel: "fresher",
    source: "linkedin",
    sourceUrl: "https://linkedin.com/jobs/123",
    tags: ["Java", "Python", "SQL"],
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "sj2",
    title: "Sales Executive",
    company: "HDFC Bank",
    location: { city: "Surat", state: "Gujarat" },
    salary: { min: 18000, max: 28000 },
    experienceLevel: "fresher",
    source: "naukri",
    sourceUrl: "https://naukri.com/job/456",
    tags: ["Sales", "Banking", "Communication"],
    status: "approved",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "sj3",
    title: "Data Entry Operator",
    company: "Generic Corp",
    location: { city: "Vadodara", state: "Gujarat" },
    salary: { min: 10000, max: 12000 },
    experienceLevel: "fresher",
    source: "indeed",
    sourceUrl: "https://indeed.com/job/789",
    tags: ["Data Entry", "MS Office"],
    status: "flagged",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "sj4",
    title: "React Developer",
    company: "StartupX",
    location: { city: "Rajkot", state: "Gujarat" },
    salary: { min: 25000, max: 40000 },
    experienceLevel: "junior",
    source: "linkedin",
    sourceUrl: "https://linkedin.com/jobs/101",
    tags: ["React", "JavaScript", "Node.js"],
    status: "pending",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ScrapedJobsPage() {
  const queryClient = useQueryClient();
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

  const jobs = data?.jobs || DEMO_SCRAPED_JOBS;

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
    mutationFn: (jobId) =>
      axiosInstance.put(`/admin/scraped-jobs/${jobId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(["scrapedJobs"]);
      toast.success("Job approved and published!");
    },
    onError: () => toast.error("Failed to approve job"),
  });

  const approveAllMutation = useMutation({
    mutationFn: () => axiosInstance.put(`/admin/scraped-jobs/approve-all`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["scrapedJobs"]);
      toast.success(
        `Successfully approved ${res.data?.count || "all pending"} jobs!`,
      );
    },
    onError: () => toast.error("Failed to approve jobs"),
  });

  const rejectMutation = useMutation({
    mutationFn: (jobId) =>
      axiosInstance.delete(`/admin/scraped-jobs/${jobId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(["scrapedJobs"]);
      toast.success("Job removed");
    },
    onError: () => toast.error("Failed to remove job"),
  });

  const triggerScraping = async () => {
    setIsScraping(true);
    try {
      await axiosInstance.post("/scraping/trigger");
      toast.success("Scraping started! New jobs will appear shortly.");
      setTimeout(() => {
        queryClient.invalidateQueries(["scrapedJobs"]);
        setIsScraping(false);
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("Scraping is already running. Please wait.");
      } else {
        toast.error("Failed to trigger scraping. Check Apify API key.");
      }
      setIsScraping(false);
    }
  };

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const flaggedCount = jobs.filter((j) => j.status === "flagged").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar links={ADMIN_SIDEBAR_LINKS} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Scraped Jobs
                </h1>
                <p className="text-gray-500 mt-1">
                  Review jobs scraped from LinkedIn, Indeed, and Naukri
                </p>
              </div>
              <div className="flex items-center gap-3">
                {pendingCount > 0 && (
                  <button
                    onClick={() => approveAllMutation.mutate()}
                    disabled={approveAllMutation.isPending}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {approveAllMutation.isPending
                      ? "Approving..."
                      : `Approve All Pending (${pendingCount})`}
                  </button>
                )}
                <button
                  onClick={triggerScraping}
                  disabled={isScraping}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 ${isScraping ? "animate-spin" : ""}`}
                  />
                  {isScraping ? "Scraping..." : "Trigger New Scrape"}
                </button>
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Scraped",
                  value: jobs.length,
                  color: "text-gray-900",
                },
                {
                  label: "Pending Review",
                  value: pendingCount,
                  color: "text-orange-600",
                },
                {
                  label: "Approved",
                  value: jobs.filter((j) => j.status === "active").length,
                  color: "text-green-600",
                },
                {
                  label: "Flagged",
                  value: flaggedCount,
                  color: "text-red-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center"
                >
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Approved</option>
                <option value="flagged">Flagged</option>
              </select>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="naukri">Naukri</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${
                      job.status === "flagged"
                        ? "border-red-200"
                        : job.status === "pending"
                          ? "border-orange-200"
                          : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          {job.isWalkIn && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Walk-in
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              SOURCE_COLORS[job.source] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {job.source}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              job.status === "active"
                                ? "bg-green-100 text-green-700"
                                : job.status === "flagged"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {job.status === "active" ? "approved" : job.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <BuildingOfficeIcon className="h-3.5 w-3.5" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {job.location?.city}, Gujarat
                          </span>
                          {job.salary?.min && (
                            <span className="flex items-center gap-1">
                              <CurrencyRupeeIcon className="h-3.5 w-3.5" />₹
                              {job.salary.min.toLocaleString()} – ₹
                              {job.salary.max.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {job.tags?.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <TagIcon className="h-3.5 w-3.5 text-gray-400" />
                            {job.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {job.sourceUrl && (
                          <a
                            href={job.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View source"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </a>
                        )}
                        {job.status !== "active" && (
                          <button
                            onClick={() => approveMutation.mutate(job._id)}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => rejectMutation.mutate(job._id)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="font-medium">No scraped jobs found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try triggering a new scrape
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
