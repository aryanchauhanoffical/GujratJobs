import React from 'react';
import JobCard from './JobCard';
import LoadingSpinner from '../layout/LoadingSpinner';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import useJobStore from '../../store/useJobStore';

const JobList = ({ jobs = [], isLoading = false, emptyMessage = 'No jobs found' }) => {
  const { viewMode, setViewMode } = useJobStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 text-sm">Loading jobs...</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{emptyMessage}</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Try adjusting your search or filters to find more jobs.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{jobs.length}</span> jobs found
        </p>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Job grid/list */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
          : 'space-y-3'
      }>
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} compact={viewMode === 'list'} />
        ))}
      </div>
    </div>
  );
};

export default JobList;
