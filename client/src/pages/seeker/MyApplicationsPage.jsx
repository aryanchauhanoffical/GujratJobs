import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import ApplicationCard from '../../components/dashboard/ApplicationCard';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { applicationsAPI } from '../../api/applications.api';
import { Link } from 'react-router-dom';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Applications' },
  { value: 'applied', label: 'Applied' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Not Selected' },
];

const MyApplicationsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['myApplications', statusFilter, page],
    queryFn: () => applicationsAPI.getMyApplications({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      limit: 10,
    }),
  });

  const withdrawMutation = useMutation({
    mutationFn: applicationsAPI.withdraw,
    onSuccess: () => {
      toast.success('Application withdrawn');
      qc.invalidateQueries(['myApplications']);
    },
    onError: () => toast.error('Failed to withdraw'),
  });

  const applications = data?.applications || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>

          {/* Status filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.label}
                {opt.value !== 'all' && data?.pagination && (
                  <span className="ml-1.5 opacity-70">
                    {applications.filter((a) => a.status === opt.value).length > 0
                      ? `(${applications.filter((a) => a.status === opt.value).length})`
                      : ''}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <BriefcaseIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
              </h3>
              <p className="text-gray-500 mb-6">
                {statusFilter === 'all'
                  ? 'Start applying to jobs in Gujarat!'
                  : 'Try another filter to see your applications.'}
              </p>
              {statusFilter === 'all' && (
                <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app._id}
                    application={app}
                    onWithdraw={(id) => withdrawMutation.mutate(id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="btn-secondary disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyApplicationsPage;
