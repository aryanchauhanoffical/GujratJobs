import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import WalkInCard from '../../components/jobs/WalkInCard';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { jobsAPI } from '../../api/jobs.api';
import { GUJARAT_CITIES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import useWalkInPriority from '../../hooks/useWalkInPriority';

const WalkInsPage = () => {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState(user?.location?.city || '');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['walkIns', selectedCity, page],
    queryFn: () => jobsAPI.getWalkIns({ city: selectedCity, page, limit: 12 }),
  });

  const walkIns = useWalkInPriority(data?.jobs || []);
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Walk-in Interviews</h1>
              <p className="text-gray-500 mt-1">Upcoming walk-in interviews across Gujarat</p>
            </div>

            {/* City filter */}
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                className="input text-sm w-44"
              >
                <option value="">All Gujarat</option>
                {GUJARAT_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : walkIns.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <CalendarDaysIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming walk-ins</h3>
              <p className="text-gray-500">
                {selectedCity
                  ? `No walk-in interviews in ${selectedCity} right now. Try another city!`
                  : 'Check back soon for walk-in interviews across Gujarat.'}
              </p>
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity('')}
                  className="btn-outline mt-4"
                >
                  Show All Gujarat Walk-ins
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {walkIns.map((job) => (
                  <WalkInCard key={job._id} job={job} />
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
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

export default WalkInsPage;
