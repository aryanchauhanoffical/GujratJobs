import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { getStatusLabel, getStatusColor, formatDate, formatSalary, timeAgo } from '../../utils/helpers';
import clsx from 'clsx';

const STATUS_STEPS = ['applied', 'viewed', 'shortlisted', 'interview_scheduled', 'hired'];

const statusColorClasses = {
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
};

const ApplicationCard = ({ application, onWithdraw }) => {
  const { job, status, appliedAt, recruiterNotes, interviewSchedule } = application;

  if (!job) return null;

  const color = getStatusColor(status);
  const statusStep = STATUS_STEPS.indexOf(status);
  const isTerminal = ['hired', 'rejected', 'withdrawn'].includes(status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-200 transition-colors">
      {/* Status indicator bar */}
      <div className={clsx(
        'h-1',
        status === 'hired' ? 'bg-green-500' :
        status === 'rejected' ? 'bg-red-400' :
        status === 'shortlisted' ? 'bg-yellow-400' :
        status === 'interview_scheduled' ? 'bg-purple-500' :
        'bg-blue-400'
      )} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <Link
              to={`/jobs/${job._id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {job.title}
            </Link>
            <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
          </div>
          <span className={clsx('badge text-xs', statusColorClasses[color])}>
            {getStatusLabel(status)}
          </span>
        </div>

        {/* Job details */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
          {job.location?.city && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              {job.location.city}
            </span>
          )}
          {job.salary && (
            <span>💰 {formatSalary(job.salary)}</span>
          )}
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            Applied {timeAgo(appliedAt)}
          </span>
        </div>

        {/* Progress timeline */}
        {!isTerminal && (
          <div className="mb-4">
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <div
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      idx <= statusStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    )}
                  >
                    {idx < statusStep ? '✓' : idx + 1}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={clsx(
                      'flex-1 h-0.5',
                      idx < statusStep ? 'bg-primary-600' : 'bg-gray-200'
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {STATUS_STEPS.map((step, idx) => (
                <span key={step} className={clsx(
                  'text-xs',
                  idx <= statusStep ? 'text-primary-600 font-medium' : 'text-gray-400'
                )}>
                  {step === 'interview_scheduled' ? 'Interview' : step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interview details */}
        {status === 'interview_scheduled' && interviewSchedule?.date && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-purple-700 mb-1">Interview Scheduled</p>
            <p className="text-xs text-purple-600">
              {formatDate(interviewSchedule.date)} at {interviewSchedule.time}
            </p>
            {interviewSchedule.mode && (
              <p className="text-xs text-purple-600 capitalize">Mode: {interviewSchedule.mode}</p>
            )}
          </div>
        )}

        {/* Recruiter notes */}
        {recruiterNotes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">Recruiter's Note</p>
            <p className="text-xs text-gray-600">{recruiterNotes}</p>
          </div>
        )}

        {/* Actions */}
        {status === 'applied' && onWithdraw && (
          <div className="flex justify-end">
            <button
              onClick={() => onWithdraw(application._id)}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Withdraw Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
