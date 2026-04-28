import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  BoltIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { formatSalary, timeAgo, getJobTypeLabel, getExpLevelLabel, truncate } from '../../utils/helpers';
import ApplyModal from './ApplyModal';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const JobCard = ({ job, compact = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const {
    _id, title, company, companyLogo, location, salary, type, experienceLevel,
    isWalkIn, walkInDetails, isGuaranteedHiring, fastTrack, isFresherFriendly,
    applicantCount = 0, createdAt, tags = [], source, skills = [],
  } = job;

  const hasHighResponse = applicantCount < 10;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
        {/* Walk-in highlight bar */}
        {isWalkIn && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5">
            <p className="text-white text-xs font-semibold flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              Walk-in Interview{walkInDetails?.date ? ` on ${formatDate(walkInDetails.date, 'dd MMM')}` : ''}
              {walkInDetails?.startTime && ` at ${walkInDetails.startTime}`}
            </p>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Company logo */}
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt={company} className="w-full h-full object-cover" />
                ) : (
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/jobs/${_id}`}
                  className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 group-hover:text-primary-600"
                >
                  {title}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm text-gray-600 truncate">{company}</span>
                  {isGuaranteedHiring && (
                    <CheckBadgeIcon className="h-4 w-4 text-green-500 flex-shrink-0" title="Verified Company" />
                  )}
                </div>
              </div>
            </div>

            {/* Time */}
            <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {timeAgo(createdAt)}
            </span>
          </div>

          {/* Tags/Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {isWalkIn && (
              <span className="badge-orange">
                📅 Walk-in
              </span>
            )}
            {isGuaranteedHiring && (
              <span className="badge-green">
                ✅ Guaranteed Hiring
              </span>
            )}
            {fastTrack && (
              <span className="badge-blue">
                ⚡ Fast Track
              </span>
            )}
            {isFresherFriendly && (
              <span className="badge-purple">
                🌱 Fresher Friendly
              </span>
            )}
            {source === 'scraped' && (
              <span className="badge badge-gray">
                External
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                {location?.city}, {location?.state || 'Gujarat'}
              </span>
              <span className="flex items-center gap-1">
                <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                {formatSalary(salary)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                {getJobTypeLabel(type)}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium capitalize">
                {getExpLevelLabel(experienceLevel)}
              </span>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1 mb-4">
              {skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-xs text-gray-500">+{skills.length - 4} more</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {hasHighResponse && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <StarIcon className="h-3.5 w-3.5" />
                  High Response Chance
                </span>
              )}
              {!hasHighResponse && (
                <span>{applicantCount} applicants</span>
              )}
            </div>

            {isAuthenticated && user?.role === 'jobseeker' ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Apply Now
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to={`/jobs/${_id}`}
                className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View Details
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} />
      )}
    </>
  );
};

// Needed for walk-in bar
const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
  </svg>
);

export default JobCard;
