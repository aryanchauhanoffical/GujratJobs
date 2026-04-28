import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseIcon, ClipboardDocumentListIcon, StarIcon,
  CalendarDaysIcon, ArrowRightIcon, MapPinIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/dashboard/StatsCard';
import ApplicationCard from '../../components/dashboard/ApplicationCard';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { applicationsAPI } from '../../api/applications.api';
import { jobsAPI } from '../../api/jobs.api';
import { useAuth } from '../../context/AuthContext';

const SeekerDashboard = () => {
  const { user } = useAuth();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['myApplications', 'recent'],
    queryFn: () => applicationsAPI.getMyApplications({ limit: 5 }),
  });

  const { data: walkInsData } = useQuery({
    queryKey: ['walkIns', user?.location?.city],
    queryFn: () => jobsAPI.getWalkIns({ city: user?.location?.city, limit: 3 }),
  });

  const applications = appsData?.applications || [];
  const stats = {
    total: appsData?.pagination?.total || 0,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interviews: applications.filter((a) => a.status === 'interview_scheduled').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Good morning, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {user?.location?.city
                ? `You're viewing jobs near ${user.location.city}, Gujarat`
                : 'Set your location to see nearby jobs'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Applications"
              value={stats.total}
              icon={ClipboardDocumentListIcon}
              color="blue"
            />
            <StatsCard
              title="Shortlisted"
              value={stats.shortlisted}
              icon={StarIcon}
              color="yellow"
            />
            <StatsCard
              title="Interviews"
              value={stats.interviews}
              icon={CalendarDaysIcon}
              color="purple"
            />
            <StatsCard
              title="Walk-ins Near You"
              value={walkInsData?.pagination?.total || 0}
              icon={MapPinIcon}
              color="orange"
            />
          </div>

          {/* Profile completion alert */}
          {!user?.resume?.url && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium text-yellow-800">Upload your resume to apply faster</p>
                  <p className="text-sm text-yellow-600">Recruiters want to see your resume before reviewing applications</p>
                </div>
              </div>
              <Link to="/profile" className="btn-primary text-sm bg-yellow-500 hover:bg-yellow-600 border-0">
                Upload Now
              </Link>
            </div>
          )}

          {!user?.location?.city && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Set your location</p>
                  <p className="text-sm text-blue-600">Get personalized job recommendations in your city</p>
                </div>
              </div>
              <Link to="/profile" className="btn-primary text-sm">Set Location</Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent applications */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Link to="/applications" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  View All <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {appsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : applications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No applications yet</p>
                  <p className="text-gray-400 text-sm mb-4">Start applying to jobs in Gujarat</p>
                  <Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <ApplicationCard key={app._id} application={app} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions + Walk-ins */}
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/jobs" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                    <BriefcaseIcon className="h-5 w-5 text-primary-500" />
                    Browse Jobs
                  </Link>
                  <Link to="/walk-ins" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                    <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
                    Walk-in Interviews
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    Update Profile
                  </Link>
                </div>
              </div>

              {/* Upcoming walk-ins */}
              {walkInsData?.jobs?.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-orange-800">Upcoming Walk-ins</h3>
                    <Link to="/walk-ins" className="text-xs text-orange-600 hover:text-orange-700">View All</Link>
                  </div>
                  <div className="space-y-3">
                    {walkInsData.jobs.slice(0, 2).map((job) => (
                      <Link
                        key={job._id}
                        to={`/jobs/${job._id}`}
                        className="block bg-white rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.company}</p>
                        {job.walkInDetails?.date && (
                          <p className="text-xs text-orange-600 mt-1">
                            📅 {new Date(job.walkInDetails.date).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SeekerDashboard;
