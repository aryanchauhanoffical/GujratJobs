import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon, DocumentTextIcon, PhoneIcon, EnvelopeIcon,
  MapPinIcon, StarIcon, CheckIcon, XMarkIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { applicationsAPI } from '../../api/applications.api';
import { recruiterAPI } from '../../api/recruiter.api';
import { timeAgo, getInitials } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { value: 'shortlisted', label: '⭐ Shortlist', colorClass: 'text-yellow-600 hover:bg-yellow-50' },
  { value: 'interview_scheduled', label: '📅 Schedule Interview', colorClass: 'text-purple-600 hover:bg-purple-50' },
  { value: 'hired', label: '✅ Hire', colorClass: 'text-green-600 hover:bg-green-50' },
  { value: 'rejected', label: '❌ Reject', colorClass: 'text-red-600 hover:bg-red-50' },
];

const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  viewed: 'bg-gray-100 text-gray-600',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const ViewApplicantsPage = () => {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['jobApplications', jobId, statusFilter],
    queryFn: () => applicationsAPI.getJobApplications(jobId, {
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, recruiterNotes }) => applicationsAPI.updateStatus(id, { status, recruiterNotes }),
    onSuccess: () => {
      toast.success('Application status updated');
      qc.invalidateQueries(['jobApplications', jobId]);
      setSelectedApp(null);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const applications = data?.applications || [];
  const job = data?.job;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/recruiter/jobs" className="text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
              {job && <p className="text-gray-500">{job.title} • {job.company}</p>}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'applied', 'viewed', 'shortlisted', 'interview_scheduled', 'hired', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                  statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-200 transition-colors">
                  {/* Applicant header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-semibold overflow-hidden flex-shrink-0">
                      {app.applicant?.profilePic ? (
                        <img src={app.applicant.profilePic} alt={app.applicant.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(app.applicant?.name)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{app.applicant?.name}</h3>
                        <span className={`badge text-xs capitalize ${STATUS_COLORS[app.status] || 'bg-gray-100'}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {app.applicant?.location?.city && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {app.applicant.location.city}
                          </span>
                        )}
                        <span>{app.applicant?.experience || 0} yrs exp</span>
                        <span>Applied {timeAgo(app.appliedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {app.applicant?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.applicant.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* Cover letter snippet */}
                  {app.coverLetter && (
                    <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mb-3 line-clamp-2 italic">
                      "{app.coverLetter}"
                    </p>
                  )}

                  {/* Contact & Resume */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                    {app.applicant?.email && (
                      <a href={`mailto:${app.applicant.email}`} className="flex items-center gap-1 hover:text-primary-600">
                        <EnvelopeIcon className="h-3.5 w-3.5" />
                        Email
                      </a>
                    )}
                    {app.applicant?.phone && (
                      <a href={`tel:${app.applicant.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {app.applicant.phone}
                      </a>
                    )}
                    {app.resumeSnapshot?.url && (
                      <a
                        href={app.resumeSnapshot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                      >
                        <DocumentTextIcon className="h-3.5 w-3.5" />
                        Resume
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  {!['hired', 'rejected'].includes(app.status) && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatusMutation.mutate({ id: app._id, status: opt.value })}
                          disabled={updateStatusMutation.isPending}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors bg-white border border-gray-200 ${opt.colorClass}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ViewApplicantsPage;
