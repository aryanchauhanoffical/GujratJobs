import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';

const fetchAdminStats = async () => {
  const { data } = await axiosInstance.get('/admin/analytics');
  return data.data;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    retry: false,
  });

  // Fallback demo stats
  const displayStats = stats || {
    totalUsers: 15420,
    totalRecruiters: 1280,
    pendingRecruiters: 34,
    totalJobs: 8750,
    activeJobs: 4320,
    scrapedJobs: 3100,
    totalApplications: 52000,
    totalHired: 8900,
    flaggedJobs: 12,
  };

  const statCards = [
    { title: 'Total Job Seekers', value: displayStats.totalUsers?.toLocaleString(), icon: UsersIcon, color: 'blue' },
    { title: 'Total Recruiters', value: displayStats.totalRecruiters?.toLocaleString(), icon: BuildingOfficeIcon, color: 'purple' },
    { title: 'Active Jobs', value: displayStats.activeJobs?.toLocaleString(), icon: BriefcaseIcon, color: 'green' },
    { title: 'Total Hired', value: displayStats.totalHired?.toLocaleString(), icon: CheckCircleIcon, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Platform overview and analytics for GujaratJobs</p>
            </div>

            {/* Alert: Pending approvals */}
            {displayStats.pendingRecruiters > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-amber-800 text-sm">
                  <span className="font-semibold">{displayStats.pendingRecruiters} recruiters</span> are awaiting approval.{' '}
                  <Link to="/admin/recruiters" className="underline font-medium">Review now →</Link>
                </p>
              </div>
            )}

            {/* Alert: Flagged jobs */}
            {displayStats.flaggedJobs > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-red-800 text-sm">
                  <span className="font-semibold">{displayStats.flaggedJobs} jobs</span> have been flagged for review.{' '}
                  <Link to="/admin/scraped-jobs" className="underline font-medium">Review now →</Link>
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner /></div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statCards.map((s) => (
                    <StatsCard key={s.title} {...s} />
                  ))}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Applications</h3>
                    <p className="text-3xl font-bold text-gray-900">{displayStats.totalApplications?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>+18% this month</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Scraped Jobs (Gujarat)</h3>
                    <p className="text-3xl font-bold text-gray-900">{displayStats.scrapedJobs?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">From LinkedIn, Indeed, Naukri</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Hire Rate</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayStats.totalApplications
                        ? `${Math.round((displayStats.totalHired / displayStats.totalApplications) * 100)}%`
                        : '17%'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Applications → Hired conversion</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Approve Recruiters', href: '/admin/recruiters', icon: '✅', desc: `${displayStats.pendingRecruiters} pending` },
                      { label: 'Review Scraped Jobs', href: '/admin/scraped-jobs', icon: '🔍', desc: `${displayStats.flaggedJobs} flagged` },
                      { label: 'Manage Users', href: '/admin/users', icon: '👥', desc: `${displayStats.totalUsers?.toLocaleString()} total` },
                      { label: 'Platform Analytics', href: '/admin/dashboard', icon: '📊', desc: 'View reports' },
                    ].map((action) => (
                      <Link
                        key={action.label}
                        to={action.href}
                        className="flex flex-col items-center text-center p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                      >
                        <span className="text-3xl mb-2">{action.icon}</span>
                        <span className="font-medium text-gray-800 group-hover:text-indigo-700 text-sm">{action.label}</span>
                        <span className="text-xs text-gray-400 mt-1">{action.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Region Coverage */}
                <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                  <h2 className="text-lg font-semibold mb-2">Gujarat Coverage</h2>
                  <p className="text-indigo-100 text-sm mb-4">Jobs active across major Gujarat cities</p>
                  <div className="flex flex-wrap gap-2">
                    {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Anand'].map((city) => (
                      <span key={city} className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">{city}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
