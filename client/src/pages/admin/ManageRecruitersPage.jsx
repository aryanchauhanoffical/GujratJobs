import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import { format } from 'date-fns';

const ADMIN_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
  { label: 'Manage Users', href: '/admin/users', icon: UsersIcon },
  { label: 'Manage Recruiters', href: '/admin/recruiters', icon: BuildingOfficeIcon },
  { label: 'Scraped Jobs', href: '/admin/scraped-jobs', icon: ClipboardDocumentListIcon },
];

const DEMO_RECRUITERS = [
  {
    _id: 'r1',
    name: 'Mehul Trivedi',
    email: 'mehul@techcorp.com',
    companyName: 'TechCorp Solutions',
    industry: 'Information Technology',
    location: { city: 'Ahmedabad', state: 'Gujarat' },
    website: 'techcorp.in',
    isApproved: true,
    isActive: true,
    jobsPosted: 12,
    totalHired: 8,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    _id: 'r2',
    name: 'Shreya Kapoor',
    email: 'shreya@textilemill.com',
    companyName: 'Surat Textile Mill',
    industry: 'Manufacturing',
    location: { city: 'Surat', state: 'Gujarat' },
    website: 'surattextile.com',
    isApproved: false,
    isActive: true,
    jobsPosted: 0,
    totalHired: 0,
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    _id: 'r3',
    name: 'Rohan Mehta',
    email: 'rohan@logisticspro.com',
    companyName: 'Gujarat Logistics Pro',
    industry: 'Logistics & Supply Chain',
    location: { city: 'Vadodara', state: 'Gujarat' },
    website: '',
    isApproved: false,
    isActive: true,
    jobsPosted: 0,
    totalHired: 0,
    createdAt: '2024-03-22T10:00:00Z',
  },
  {
    _id: 'r4',
    name: 'Nita Parmar',
    email: 'nita@financeplus.com',
    companyName: 'FinancePlus Advisors',
    industry: 'Finance & Banking',
    location: { city: 'Rajkot', state: 'Gujarat' },
    website: 'financeplus.co',
    isApproved: true,
    isActive: true,
    jobsPosted: 5,
    totalHired: 3,
    createdAt: '2024-02-05T10:00:00Z',
  },
];

export default function ManageRecruitersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminRecruiters', { search, filterStatus }],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/recruiters?search=${search}&status=${filterStatus}`);
      return data.data;
    },
    retry: false,
  });

  const recruiters = data?.recruiters || DEMO_RECRUITERS;

  const filteredRecruiters = recruiters.filter((r) => {
    if (filterStatus === 'pending') return !r.isApproved;
    if (filterStatus === 'approved') return r.isApproved;
    return true;
  });

  const approveMutation = useMutation({
    mutationFn: (recruiterId) => axiosInstance.patch(`/admin/recruiters/${recruiterId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminRecruiters']);
      toast.success('Recruiter approved successfully!');
    },
    onError: () => toast.error('Failed to approve recruiter'),
  });

  const rejectMutation = useMutation({
    mutationFn: (recruiterId) => axiosInstance.patch(`/admin/recruiters/${recruiterId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminRecruiters']);
      toast.success('Recruiter rejected');
    },
    onError: () => toast.error('Failed to reject recruiter'),
  });

  const pendingCount = recruiters.filter((r) => !r.isApproved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar links={ADMIN_SIDEBAR_LINKS} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Recruiters</h1>
                <p className="text-gray-500 mt-1">Approve, review, and manage recruiter accounts</p>
              </div>
              {pendingCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                  {pendingCount} Pending Approval
                </span>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, company, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: `Pending (${pendingCount})` },
                  { value: 'approved', label: 'Approved' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterStatus === tab.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner /></div>
            ) : (
              <div className="space-y-4">
                {filteredRecruiters.map((recruiter) => (
                  <div
                    key={recruiter._id}
                    className={`bg-white rounded-xl shadow-sm border transition-all ${
                      !recruiter.isApproved
                        ? 'border-orange-200 bg-orange-50/30'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                            <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{recruiter.companyName}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                recruiter.isApproved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {recruiter.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">{recruiter.name} · {recruiter.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" />
                                {recruiter.location?.city}, Gujarat
                              </span>
                              <span>{recruiter.industry}</span>
                              {recruiter.website && (
                                <span className="flex items-center gap-1">
                                  <GlobeAltIcon className="h-3 w-3" />
                                  {recruiter.website}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                Joined {recruiter.createdAt ? format(new Date(recruiter.createdAt), 'MMM d, yyyy') : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-500">Jobs Posted</p>
                            <p className="font-semibold text-gray-900">{recruiter.jobsPosted || 0}</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-500">Hired</p>
                            <p className="font-semibold text-gray-900">{recruiter.totalHired || 0}</p>
                          </div>

                          {!recruiter.isApproved ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveMutation.mutate(recruiter._id)}
                                disabled={approveMutation.isPending}
                                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(recruiter._id)}
                                disabled={rejectMutation.isPending}
                                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => rejectMutation.mutate(recruiter._id)}
                              className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRecruiters.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No recruiters found</p>
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
