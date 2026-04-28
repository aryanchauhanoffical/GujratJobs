import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import JobList from '../components/jobs/JobList';
import JobFilters from '../components/jobs/JobFilters';
import JobSearch from '../components/jobs/JobSearch';
import useJobStore from '../store/useJobStore';
import { jobsAPI } from '../api/jobs.api';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-salary.max', label: 'Highest Salary' },
  { value: 'salary.min', label: 'Lowest Salary' },
  { value: '-views', label: 'Most Viewed' },
];

const JobsPage = () => {
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { filters, setFilters, setFilter, pagination, setPage } = useJobStore();

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {};
    if (searchParams.get('search')) urlFilters.search = searchParams.get('search');
    if (searchParams.get('city')) urlFilters.city = searchParams.get('city');
    if (searchParams.get('category')) urlFilters.category = searchParams.get('category');
    if (searchParams.get('isWalkIn') === 'true') urlFilters.isWalkIn = true;
    if (Object.keys(urlFilters).length > 0) setFilters(urlFilters);
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', filters, pagination.page],
    queryFn: () => jobsAPI.getAll({
      ...filters,
      isWalkIn: filters.isWalkIn || undefined,
      isGuaranteedHiring: filters.isGuaranteedHiring || undefined,
      fastTrack: filters.fastTrack || undefined,
      isFresherFriendly: filters.isFresherFriendly || undefined,
      page: pagination.page,
      limit: pagination.limit,
    }),
    keepPreviousData: true,
  });

  const jobs = data?.jobs || [];
  const total = data?.pagination?.total || 0;
  const pages = data?.pagination?.pages || 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {filters.city ? `Jobs in ${filters.city}` : 'All Jobs in Gujarat'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {total.toLocaleString()} jobs found
                  {filters.search ? ` for "${filters.search}"` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <JobSearch className="w-64 hidden md:block" />

                {/* Sort */}
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="input text-sm w-44"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="md:hidden btn-secondary flex items-center gap-2"
                >
                  <FunnelIcon className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Mobile search */}
            <div className="mt-4 md:hidden">
              <JobSearch className="w-full" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Filters sidebar - desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <JobFilters />
              </div>
            </aside>

            {/* Job list */}
            <main className="flex-1 min-w-0">
              <JobList
                jobs={jobs}
                isLoading={isLoading || isFetching}
                emptyMessage={
                  filters.search
                    ? `No jobs found for "${filters.search}"`
                    : 'No jobs found with current filters'
                }
              />

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {[...Array(Math.min(7, pages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(Math.min(pages, pagination.page + 1))}
                    disabled={pagination.page === pages}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </main>

      {/* Mobile filters modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[85vh] rounded-t-2xl overflow-y-auto">
            <div className="p-4">
              <JobFilters onClose={() => setShowMobileFilters(false)} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobsPage;
