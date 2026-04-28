import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ADMIN_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
  { label: 'Manage Users', href: '/admin/users', icon: UsersIcon },
  { label: 'Manage Recruiters', href: '/admin/recruiters', icon: BuildingOfficeIcon },
  { label: 'Scraped Jobs', href: '/admin/scraped-jobs', icon: ClipboardDocumentListIcon },
];

const fetchUsers = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await axiosInstance.get(`/admin/users?${params}`);
  return data.data;
};

// Demo data fallback
const DEMO_USERS = [
  { _id: '1', name: 'Priya Patel', email: 'priya@example.com', role: 'jobseeker', location: { city: 'Ahmedabad', state: 'Gujarat' }, isVerified: true, isActive: true, createdAt: '2024-01-15T10:00:00Z', applicationsCount: 12 },
  { _id: '2', name: 'Rahul Shah', email: 'rahul@example.com', role: 'jobseeker', location: { city: 'Surat', state: 'Gujarat' }, isVerified: true, isActive: true, createdAt: '2024-01-20T10:00:00Z', applicationsCount: 7 },
  { _id: '3', name: 'Anita Desai', email: 'anita@example.com', role: 'jobseeker', location: { city: 'Vadodara', state: 'Gujarat' }, isVerified: false, isActive: true, createdAt: '2024-02-01T10:00:00Z', applicationsCount: 3 },
  { _id: '4', name: 'Kiran Modi', email: 'kiran@example.com', role: 'jobseeker', location: { city: 'Rajkot', state: 'Gujarat' }, isVerified: true, isActive: false, createdAt: '2024-02-10T10:00:00Z', applicationsCount: 0 },
  { _id: '5', name: 'Divya Joshi', email: 'divya@example.com', role: 'jobseeker', location: { city: 'Gandhinagar', state: 'Gujarat' }, isVerified: true, isActive: true, createdAt: '2024-02-15T10:00:00Z', applicationsCount: 15 },
];

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', { search, filterCity, filterStatus, page }],
    queryFn: () => fetchUsers({ search, city: filterCity, status: filterStatus, page, limit: 20 }),
    retry: false,
  });

  const users = data?.users || DEMO_USERS;
  const totalPages = data?.totalPages || 1;

  const toggleStatus = useMutation({
    mutationFn: ({ userId, action }) => axiosInstance.patch(`/admin/users/${userId}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user'),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar links={ADMIN_SIDEBAR_LINKS} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Manage Job Seekers</h1>
              <p className="text-gray-500 mt-1">View, verify, and manage all registered job seekers</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Cities</option>
                {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Anand', 'Navsari'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner /></div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applications</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-semibold text-sm">{user.name?.[0]}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm flex items-center gap-1">
                                  {user.name}
                                  {user.isVerified && <CheckBadgeIcon className="h-4 w-4 text-blue-500" />}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                              {user.location?.city || 'N/A'}, {user.location?.state || 'Gujarat'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">{user.applicationsCount || 0}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleStatus.mutate({
                                userId: user._id,
                                action: user.isActive ? 'suspend' : 'activate',
                              })}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {user.isActive ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
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
