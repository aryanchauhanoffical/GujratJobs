import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon,
  XMarkIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { jobsAPI } from '../../api/jobs.api';
import { formatSalary, timeAgo } from '../../utils/helpers';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  draft: 'bg-yellow-100 text-yellow-700',
};

const ManageJobsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['myJobs', statusFilter, page],
    queryFn: () => jobsAPI.getMyJobs({ status: statusFilter === 'all' ? undefined : statusFilter, page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: jobsAPI.delete,
    onSuccess: () => { toast.success('Job deleted'); qc.invalidateQueries(['myJobs']); },
    onError: () => toast.error('Failed to delete job'),
  });

  const closeMutation = useMutation({
    mutationFn: jobsAPI.close,
    onSuccess: () => { toast.success('Job closed'); qc.invalidateQueries(['myJobs']); },
    onError: () => toast.error('Failed to close job'),
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
            <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2">
              <PlusCircleIcon className="h-5 w-5" />
              Post New Job
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5">
            {['all', 'active', 'closed', 'draft'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <BriefcaseIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <Link to="/recruiter/post-job" className="btn-primary mt-4 inline-block">Post Your First Job</Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Applicants</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Posted</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.company}</p>
                          <div className="flex gap-1 mt-1">
                            {job.isWalkIn && <span className="badge-orange text-xs">Walk-in</span>}
                            {job.isGuaranteedHiring && <span className="badge-green text-xs">Guaranteed</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <p className="text-sm text-gray-600">{job.location?.city}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/recruiter/jobs/${job._id}/applicants`}
                            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <UserGroupIcon className="h-4 w-4" />
                            {job.applicantCount || 0}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`badge capitalize ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">{timeAgo(job.createdAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/jobs/${job._id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            {job.status === 'active' && (
                              <button
                                onClick={() => closeMutation.mutate(job._id)}
                                className="p-1.5 text-yellow-500 hover:text-yellow-600 rounded-lg hover:bg-yellow-50"
                                title="Close job"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Delete this job? This cannot be undone.')) {
                                  deleteMutation.mutate(job._id);
                                }
                              }}
                              className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">Previous</button>
                  <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
                  <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Need BriefcaseIcon
const BriefcaseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export default ManageJobsPage;
