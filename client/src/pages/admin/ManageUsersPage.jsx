/**
 * ManageUsersPage — DESIGN.md "Disciplined warmth"
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import LoadingSpinner from "../../components/layout/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "../../api/axios";
import { GUJARAT_CITIES } from "../../utils/constants";

const fetchUsers = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await axiosInstance.get(`/admin/users?${params}`);
  return data.data;
};

export default function ManageUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", { search, filterCity, filterStatus, page }],
    queryFn: () =>
      fetchUsers({ search, city: filterCity, status: filterStatus, page, limit: 20 }),
    retry: false,
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  const toggleStatus = useMutation({
    mutationFn: ({ userId, action }) =>
      axiosInstance.patch(`/admin/users/${userId}/${action}`),
    onSuccess: () => {
      qc.invalidateQueries(["adminUsers"]);
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-canvas-warm">
          <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-saffron mb-3">
            Users
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter text-ink leading-tight mb-8">
            Manage job seekers.
          </h1>

          {/* Filters */}
          <div className="bg-canvas border border-hairline rounded-xl p-5 mb-6 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all"
              />
            </div>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron transition-all"
            >
              <option value="">All cities</option>
              {GUJARAT_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron transition-all"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="bg-canvas border border-hairline rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-canvas-warm border-b border-hairline">
                      <Th>User</Th>
                      <Th>Location</Th>
                      <Th>Applications</Th>
                      <Th>Status</Th>
                      <Th>Joined</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-canvas-warm transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-saffron text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold tracking-tight text-ink text-sm flex items-center gap-1.5 truncate">
                                {user.name}
                                {user.isVerified && (
                                  <CheckBadgeIcon className="h-4 w-4 text-success shrink-0" />
                                )}
                              </div>
                              <div className="text-xs text-body truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-body">
                            <MapPinIcon className="h-3.5 w-3.5 text-muted-soft" />
                            {user.location?.city || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold tracking-tight text-ink tabular-nums">
                          {user.applicationsCount || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`uppercase tracking-[0.1em] text-[10px] font-bold rounded-full ${
                              user.isActive
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-error/10 text-error border-error/20"
                            }`}
                          >
                            {user.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-text">
                          {user.createdAt
                            ? format(new Date(user.createdAt), "MMM d, yyyy")
                            : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              toggleStatus.mutate({
                                userId: user._id,
                                action: user.isActive ? "suspend" : "activate",
                              })
                            }
                            className={`text-xs font-bold uppercase tracking-wider px-3 h-8 rounded-full border transition-colors ${
                              user.isActive
                                ? "bg-canvas text-error border-error/20 hover:bg-error/5"
                                : "bg-canvas text-success border-success/20 hover:bg-success/5"
                            }`}
                          >
                            {user.isActive ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-hairline flex items-center justify-between">
                  <p className="text-sm text-body tabular-nums">
                    Page <span className="font-bold text-ink">{page}</span> of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="bg-canvas text-ink border border-hairline-strong rounded-full px-4 h-9 text-xs font-bold uppercase tracking-wider hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="bg-canvas text-ink border border-hairline-strong rounded-full px-4 h-9 text-xs font-bold uppercase tracking-wider hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-text">
      {children}
    </th>
  );
}
