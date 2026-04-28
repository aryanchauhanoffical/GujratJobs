import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseIcon, UserGroupIcon, CheckBadgeIcon, PlusCircleIcon,
  ArrowRightIcon, EyeIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { recruiterAPI } from '../../api/recruiter.api';
import { timeAgo, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  applied: 'bg-blue-100 text-blue-700',
  viewed: 'bg-gray-100 text-gray-600',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const RecruiterDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['recruiterDashboard'],
    queryFn: recruiterAPI.getDashboard,
  });

  const stats = data?.stats || {};
  const recentApplications = data?.recentApplications || [];
  const topJobs = data?.topJobs || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.name?.split(' ')[0]}</p>
            </div>
            <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2">
              <PlusCircleIcon className="h-5 w-5" />
              Post a Job
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatsCard title="Total Jobs" value={stats.totalJobs || 0} icon={BriefcaseIcon} color="blue" />
                <StatsCard title="Active Jobs" value={stats.activeJobs || 0} icon={BriefcaseIcon} color="green" />
                <StatsCard title="Total Applicants" value={stats.totalApplications || 0} icon={UserGroupIcon} color="purple" />
                <StatsCard title="New This Week" value={stats.newApplications || 0} icon={ClockIcon} color="orange" change={stats.newApplications} />
                <StatsCard title="Shortlisted" value={stats.shortlisted || 0} icon={EyeIcon} color="indigo" />
                <StatsCard title="Hired" value={stats.totalHired || 0} icon={CheckBadgeIcon} color="green" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Applications */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                    <Link to="/recruiter/applicants" className="text-sm text-primary-600 flex items-center gap-1">
                      View All <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  {recentApplications.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500">No applications yet</p>
                      <Link to="/recruiter/post-job" className="btn-primary text-sm mt-4 inline-block">Post a Job</Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {recentApplications.map((app) => (
                        <div key={app._id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {app.applicant?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{app.applicant?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{app.job?.title}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">{timeAgo(app.appliedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Jobs & Quick Actions */}
                <div className="space-y-4">
                  {/* Quick actions */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link to="/recruiter/post-job" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                        <PlusCircleIcon className="h-5 w-5 text-primary-500" />
                        Post New Job
                      </Link>
                      <Link to="/recruiter/jobs" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                        <BriefcaseIcon className="h-5 w-5 text-green-500" />
                        Manage Jobs
                      </Link>
                      <Link to="/recruiter/profile" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                        <CheckBadgeIcon className="h-5 w-5 text-purple-500" />
                        Update Profile
                      </Link>
                    </div>
                  </div>

                  {/* Top jobs */}
                  {topJobs.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Top Jobs by Applicants</h3>
                      <div className="space-y-3">
                        {topJobs.slice(0, 4).map((job) => (
                          <Link
                            key={job._id}
                            to={`/recruiter/jobs/${job._id}/applicants`}
                            className="flex items-center justify-between hover:text-primary-600"
                          >
                            <p className="text-sm text-gray-700 truncate flex-1">{job.title}</p>
                            <span className="text-xs font-semibold text-primary-600 ml-2 flex-shrink-0">
                              {job.applicantCount} apps
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
