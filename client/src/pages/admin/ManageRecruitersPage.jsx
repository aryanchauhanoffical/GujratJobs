/**
 * ManageRecruitersPage — DESIGN.md "Disciplined warmth"
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "../../api/axios";

export default function ManageRecruitersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["adminRecruiters", { search, filterStatus }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/recruiters?search=${search}&status=${filterStatus}`,
      );
      return data.data;
    },
    retry: false,
  });

  const recruiters = data?.recruiters || [];
  const filtered = recruiters.filter((r) => {
    if (filterStatus === "pending") return !r.isApproved;
    if (filterStatus === "approved") return r.isApproved;
    return true;
  });
  const pendingCount = recruiters.filter((r) => !r.isApproved).length;

  const approveMutation = useMutation({
    mutationFn: (id) => axiosInstance.patch(`/admin/recruiters/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries(["adminRecruiters"]);
      toast.success("Recruiter approved");
    },
    onError: () => toast.error("Failed to approve recruiter"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => axiosInstance.patch(`/admin/recruiters/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries(["adminRecruiters"]);
      toast.success("Recruiter rejected");
    },
    onError: () => toast.error("Failed to reject recruiter"),
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
                Recruiters
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight">
                Manage recruiters.
              </h1>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-marigold/10 text-marigold border-marigold/30 rounded-full text-xs uppercase font-bold tracking-wider px-3 py-1">
                {pendingCount} pending
              </Badge>
            )}
          </div>

          {/* Filters */}
          <div className="bg-canvas border border-hairline rounded-xl p-5 mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[260px] relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, company, or email..."
                className="w-full pl-10 pr-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: `Pending (${pendingCount})` },
                { value: "approved", label: "Approved" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value)}
                  className={`px-4 h-10 rounded-full text-sm font-bold tracking-tight border transition-colors ${
                    filterStatus === tab.value
                      ? "bg-ink text-on-dark border-ink"
                      : "bg-canvas text-ink border-hairline hover:border-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => (
                <div
                  key={r._id}
                  className={`bg-canvas rounded-xl border p-6 transition-colors ${
                    !r.isApproved ? "border-saffron/30" : "border-hairline"
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-saffron/10 flex items-center justify-center shrink-0">
                        <BuildingOfficeIcon className="h-6 w-6 text-saffron stroke-[1.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold tracking-tight text-ink">{r.companyName}</h3>
                          <Badge
                            className={`uppercase tracking-[0.1em] text-[10px] font-bold rounded-full ${
                              r.isApproved
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-marigold/10 text-marigold border-marigold/30"
                            }`}
                          >
                            {r.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-body mt-0.5">
                          {r.name} · {r.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-text flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {r.location?.city}, Gujarat
                          </span>
                          <span>{r.industry}</span>
                          {r.website && (
                            <span className="inline-flex items-center gap-1">
                              <GlobeAltIcon className="h-3 w-3" />
                              {r.website}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            Joined {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Stat label="Jobs" value={r.jobsPosted || 0} />
                      <Stat label="Hired" value={r.totalHired || 0} />
                      {!r.isApproved ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate(r._id)}
                            disabled={approveMutation.isPending}
                            className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-4 h-9 inline-flex items-center gap-1.5 hover:bg-saffron-active transition-colors disabled:opacity-60"
                          >
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(r._id)}
                            disabled={rejectMutation.isPending}
                            className="bg-canvas text-error border border-error/20 rounded-full px-4 h-9 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:bg-error/5 transition-colors disabled:opacity-60"
                          >
                            <XCircleIcon className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => rejectMutation.mutate(r._id)}
                          className="text-xs text-muted-text hover:text-error font-bold uppercase tracking-wider transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-20 bg-canvas border border-hairline rounded-xl">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto text-muted-soft stroke-[1.5] mb-4" />
                  <p className="text-ink font-bold tracking-tight">No recruiters found</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-right hidden sm:block">
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-text">{label}</p>
      <p className="font-bold tracking-tight text-ink tabular-nums">{value}</p>
    </div>
  );
}
