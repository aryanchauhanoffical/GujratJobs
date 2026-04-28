import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ClockIcon, CurrencyRupeeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { formatDate, formatSalary } from '../../utils/helpers';
import WalkInCountdown from './WalkInCountdown';

const URGENCY = {
  100: { bar: 'from-red-500 via-rose-500 to-pink-500',   badge: 'bg-red-100 text-red-700',    label: 'Today',     hover: 'hover:border-red-300/50 hover:shadow-red-500/10' },
  80:  { bar: 'from-orange-400 via-amber-500 to-yellow-400', badge: 'bg-orange-100 text-orange-700', label: 'Tomorrow',  hover: 'hover:border-orange-300/50 hover:shadow-orange-500/10' },
  50:  { bar: 'from-amber-400 via-orange-500 to-rose-500',   badge: 'bg-amber-100 text-amber-700',   label: 'This Week', hover: 'hover:border-amber-300/50 hover:shadow-amber-500/10' },
  10:  { bar: 'from-slate-300 via-slate-400 to-slate-300',   badge: 'bg-slate-100 text-slate-500',   label: 'Upcoming',  hover: 'hover:border-slate-300/50 hover:shadow-slate-500/10' },
};

const WalkInCard = ({ job }) => {
  const { _id, title, company, location, salary, walkInDetails, urgencyScore } = job;

  const urgency = URGENCY[urgencyScore] ?? URGENCY[10];

  const walkInDate = walkInDetails?.date ? new Date(walkInDetails.date) : null;
  const isToday = urgencyScore === 100;

  return (
    <div className={`group relative bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden ${urgency.hover}`}>

      {/* Urgency top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${urgency.bar} opacity-80`} />

      {/* Hover glow */}
      <div className="absolute -inset-24 bg-gradient-to-br from-amber-50 to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full blur-[80px]" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Badges row */}
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-full shadow-md shadow-orange-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Walk-In
          </span>

          {urgencyScore != null && (
            <span className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-lg uppercase ${urgency.badge}`}>
              {isToday && '🔥 '}{urgency.label}
            </span>
          )}
        </div>

        {/* Title & Company */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 mb-1.5">
            {title}
          </h3>
          <div className="flex items-center text-sm font-medium text-slate-500 gap-1.5">
            <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
            <span className="truncate">{company}</span>
          </div>
        </div>

        {/* Details grid */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mb-4 border border-slate-100 flex-1">
          {walkInDetails?.date && (
            <div className="flex items-start gap-2.5 text-sm text-slate-700">
              <ClockIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="font-medium">
                {formatDate(walkInDetails.date, 'dd MMM yyyy')}
                {(walkInDetails.startTime || walkInDetails.endTime) && (
                  <span className="text-slate-500 font-normal">
                    {walkInDetails.startTime && ` • ${walkInDetails.startTime}`}
                    {walkInDetails.endTime && ` - ${walkInDetails.endTime}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {walkInDetails?.venue && (
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <MapPinIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">{walkInDetails.venue}</span>
            </div>
          )}

          {location?.city && !walkInDetails?.venue?.includes(location.city) && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <MapPinIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>{location.city}, Gujarat</span>
            </div>
          )}

          {/* Live countdown for today's drives */}
          {isToday && walkInDate && (
            <div className="pt-1">
              <WalkInCountdown targetDate={walkInDate} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2">
          {salary && (
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold px-2">
              <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-600">
                <CurrencyRupeeIcon className="h-4 w-4" />
              </div>
              {formatSalary(salary)}
            </div>
          )}

          <Link
            to={`/jobs/${_id}`}
            className="block w-full text-center bg-slate-900 group-hover:bg-amber-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 group-hover:shadow-amber-500/30 text-sm"
          >
            Review & Apply
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalkInCard;
