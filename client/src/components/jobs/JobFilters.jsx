import React from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import useJobStore from '../../store/useJobStore';
import { GUJARAT_CITIES, JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, SALARY_RANGES } from '../../utils/constants';

const JobFilters = ({ onClose }) => {
  const { filters, setFilter, setFilters, resetFilters, getActiveFilterCount } = useJobStore();
  const activeCount = getActiveFilterCount();

  const handleSalaryRange = (range) => {
    setFilters({ minSalary: range.min || '', maxSalary: range.max || '' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <select
            value={filters.city}
            onChange={(e) => setFilter('city', e.target.value)}
            className="input text-sm"
          >
            <option value="">All Gujarat Cities</option>
            {GUJARAT_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
          <div className="space-y-2">
            {JOB_TYPES.map((t) => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jobType"
                  value={t.value}
                  checked={filters.type === t.value}
                  onChange={(e) => setFilter('type', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{t.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="jobType"
                value=""
                checked={filters.type === ''}
                onChange={() => setFilter('type', '')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">All Types</span>
            </label>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="expLevel"
                  value={level.value}
                  checked={filters.experienceLevel === level.value}
                  onChange={(e) => setFilter('experienceLevel', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="expLevel"
                value=""
                checked={filters.experienceLevel === ''}
                onChange={() => setFilter('experienceLevel', '')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">All Levels</span>
            </label>
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
          <div className="space-y-2">
            {SALARY_RANGES.map((range, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="salary"
                  checked={
                    parseInt(filters.minSalary || 0) === range.min &&
                    parseInt(filters.maxSalary || 0) === range.max
                  }
                  onChange={() => handleSalaryRange(range)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special</label>
          <div className="space-y-2">
            {[
              { key: 'isWalkIn', label: '📅 Walk-in Jobs Only' },
              { key: 'isGuaranteedHiring', label: '✅ Guaranteed Hiring' },
              { key: 'fastTrack', label: '⚡ Fast Track' },
              { key: 'isFresherFriendly', label: '🌱 Fresher Friendly' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters[key]}
                  onChange={(e) => setFilter(key, e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="input text-sm"
          >
            <option value="">All Categories</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
