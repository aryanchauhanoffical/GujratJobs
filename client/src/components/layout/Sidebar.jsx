import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PlusCircleIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const seekerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/jobs', label: 'Find Jobs', icon: BriefcaseIcon },
  { to: '/applications', label: 'My Applications', icon: ClipboardDocumentListIcon },
  { to: '/walk-ins', label: 'Walk-in Jobs', icon: CalendarDaysIcon },
  { to: '/profile', label: 'My Profile', icon: UserIcon },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: PlusCircleIcon },
  { to: '/recruiter/jobs', label: 'Manage Jobs', icon: BriefcaseIcon },
  { to: '/recruiter/applicants', label: 'Applicants', icon: UsersIcon },
  { to: '/recruiter/profile', label: 'Company Profile', icon: BuildingOfficeIcon },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/admin/users', label: 'Manage Users', icon: UsersIcon },
  { to: '/admin/recruiters', label: 'Recruiters', icon: ShieldCheckIcon },
  { to: '/admin/scraped-jobs', label: 'Scraped Jobs', icon: DocumentMagnifyingGlassIcon },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'recruiter'
    ? recruiterLinks
    : seekerLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              location.pathname === to
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className={clsx('h-5 w-5', location.pathname === to ? 'text-primary-600' : 'text-gray-400')} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
