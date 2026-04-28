import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { getInitials } from '../../utils/helpers';
import {
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/jobs?isWalkIn=true', label: 'Walk-in Jobs' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/';
    const links = {
      jobseeker: '/dashboard',
      recruiter: '/recruiter/dashboard',
      admin: '/admin/dashboard',
    };
    return links[user.role] || '/';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BriefcaseIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Gujarat<span className="text-primary-600">Jobs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Location indicator */}
            {user?.location?.city && (
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                <MapPinIcon className="h-4 w-4 text-primary-500" />
                <span>{user.location.city}</span>
              </div>
            )}

            {isAuthenticated ? (
              <>
                <NotificationBell />

                {/* User menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user?.name)
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-500 hidden md:block" />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 focus:outline-none z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full capitalize font-medium">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={getDashboardLink()}
                              className={`flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                            >
                              <Cog6ToothIcon className="h-4 w-4" />
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>

                        {user?.role === 'jobseeker' && (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/profile"
                                  className={`flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                                >
                                  <UserCircleIcon className="h-4 w-4" />
                                  My Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/applications"
                                  className={`flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                                >
                                  <BriefcaseIcon className="h-4 w-4" />
                                  My Applications
                                </Link>
                              )}
                            </Menu.Item>
                          </>
                        )}

                        {user?.role === 'recruiter' && (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/recruiter/profile"
                                  className={`flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                                >
                                  <BuildingOfficeIcon className="h-4 w-4" />
                                  Company Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/recruiter/post-job"
                                  className={`flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`}
                                >
                                  <BriefcaseIcon className="h-4 w-4" />
                                  Post a Job
                                </Link>
                              )}
                            </Menu.Item>
                          </>
                        )}
                      </div>

                      <div className="py-1 border-t border-gray-100">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 ${active ? 'bg-red-50' : ''}`}
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to={getDashboardLink()}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
