import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPinIcon, ClockIcon, CurrencyRupeeIcon, BuildingOfficeIcon,
  BriefcaseIcon, CalendarDaysIcon, PhoneIcon, ShareIcon,
  BookmarkIcon, ArrowLeftIcon, UserGroupIcon, EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import ApplyModal from '../components/jobs/ApplyModal';
import { jobsAPI } from '../api/jobs.api';
import { formatSalary, timeAgo, formatDate, getJobTypeLabel, getExpLevelLabel } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const JobDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getById(id),
    enabled: !!id,
  });

  const job = data?.job;
  const hasApplied = data?.hasApplied;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-2xl mb-2">😞</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
            <Link to="/jobs" className="btn-primary">Browse Other Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <Link to="/jobs" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {/* Walk-in banner */}
                {job.isWalkIn && (
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-4 mb-5">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-5 w-5" />
                      <span className="font-semibold">Walk-in Interview</span>
                    </div>
                    {job.walkInDetails?.date && (
                      <p className="text-orange-100 text-sm mt-1">
                        {formatDate(job.walkInDetails.date, 'EEEE, dd MMMM yyyy')}
                        {job.walkInDetails.startTime && ` • ${job.walkInDetails.startTime}`}
                        {job.walkInDetails.endTime && ` - ${job.walkInDetails.endTime}`}
                      </p>
                    )}
                    {job.walkInDetails?.venue && (
                      <p className="text-orange-100 text-sm mt-1 flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {job.walkInDetails.venue}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                      <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 font-medium">{job.company}</span>
                      {job.isGuaranteedHiring && (
                        <CheckBadgeIcon className="h-5 w-5 text-green-500" title="Verified Company" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{job.location?.city}, {job.location?.state || 'Gujarat'}</span>
                      {job.location?.address && <span>• {job.location.address}</span>}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {timeAgo(job.createdAt)}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {job.isWalkIn && <span className="badge-orange">📅 Walk-in</span>}
                  {job.isGuaranteedHiring && <span className="badge-green">✅ Guaranteed Hiring</span>}
                  {job.fastTrack && <span className="badge-blue">⚡ Fast Track</span>}
                  {job.isFresherFriendly && <span className="badge-purple">🌱 Fresher Friendly</span>}
                  {job.source === 'scraped' && <span className="badge badge-gray">External</span>}
                </div>

                {/* Key details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Salary</p>
                    <p className="text-sm font-semibold text-gray-900">{formatSalary(job.salary)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Type</p>
                    <p className="text-sm font-semibold text-gray-900">{getJobTypeLabel(job.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Experience</p>
                    <p className="text-sm font-semibold text-gray-900">{getExpLevelLabel(job.experienceLevel)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Openings</p>
                    <p className="text-sm font-semibold text-gray-900">{job.openings || 1} position(s)</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-primary-500 mt-0.5 flex-shrink-0">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {job.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Apply card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
                <div className="text-center mb-5">
                  <div className="text-2xl font-bold text-gray-900">{formatSalary(job.salary)}</div>
                  {job.salary?.isNegotiable && <p className="text-sm text-gray-500">Negotiable</p>}
                </div>

                {isAuthenticated && user?.role === 'jobseeker' ? (
                  hasApplied ? (
                    <div className="text-center">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                        <p className="text-green-700 font-medium text-sm">✓ Applied Successfully</p>
                        <p className="text-green-600 text-xs">Check your applications page</p>
                      </div>
                      <Link to="/applications" className="btn-secondary w-full block text-center">
                        View My Applications
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="btn-primary w-full py-3 text-base"
                    >
                      Apply Now
                    </button>
                  )
                ) : !isAuthenticated ? (
                  <div>
                    <Link to={`/register`} className="btn-primary w-full block text-center py-3">
                      Apply Now
                    </Link>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      <Link to="/login" className="text-primary-600">Sign in</Link> to apply instantly
                    </p>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 mt-4">
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm">
                    <BookmarkIcon className="h-4 w-4" />
                    Save
                  </button>
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm">
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Applicants</span>
                    <span className="font-medium text-gray-900">{job.applicantCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Views</span>
                    <span className="font-medium text-gray-900">{job.views || 0}</span>
                  </div>
                  {job.deadline && (
                    <div className="flex items-center justify-between">
                      <span>Deadline</span>
                      <span className="font-medium text-red-600">{formatDate(job.deadline)}</span>
                    </div>
                  )}
                  {job.qualification && job.qualification !== 'Any' && (
                    <div className="flex items-center justify-between">
                      <span>Qualification</span>
                      <span className="font-medium text-gray-900">{job.qualification}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Walk-in action panel */}
              {job.isWalkIn && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h3 className="font-semibold text-orange-800 mb-3 text-sm">Walk-in Actions</h3>

                  {job.walkInDetails?.contactPerson && (
                    <p className="text-sm text-orange-700 mb-3">
                      Contact: <strong>{job.walkInDetails.contactPerson}</strong>
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    {job.walkInDetails?.contactPhone && (
                      <a
                        href={`tel:${job.walkInDetails.contactPhone}`}
                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Call {job.walkInDetails.contactPhone}
                      </a>
                    )}

                    {job.walkInDetails?.contactPhone && (
                      <a
                        href={`https://wa.me/91${job.walkInDetails.contactPhone.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}

                    {job.walkInDetails?.contactEmail && (
                      <a
                        href={`mailto:${job.walkInDetails.contactEmail}`}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                        Email HR
                      </a>
                    )}

                    {job.walkInDetails?.venue && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(job.walkInDetails.venue)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        <MapPinIcon className="h-4 w-4" />
                        Get Directions
                      </a>
                    )}

                    {job.walkInDetails?.contactLinkedin && (
                      <a
                        href={job.walkInDetails.contactLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#0077b5] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#006097] transition-colors"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {job.sourceUrl && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">External job listing</p>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline break-all"
                  >
                    View original posting
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showApplyModal && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />
      )}

      <Footer />
    </div>
  );
};

export default JobDetailPage;
