/**
 * Navbar — DESIGN.md "Disciplined warmth"
 *
 * BMW-clean: 64px height, hairline bottom border, two type weights only,
 * sharp 0px primary CTA, full-pill secondary. No gradients, no glass.
 */

import React, { useState, Fragment } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { getInitials } from "../../utils/helpers";

const NAV_LINKS = [
  { to: "/jobs", label: "Find Jobs" },
  { to: "/jobs?isWalkIn=true", label: "Walk-ins" },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path.split("?")[0];

  const dashboardLink = (() => {
    if (!user) return "/";
    return (
      {
        jobseeker: "/dashboard",
        recruiter: "/recruiter/dashboard",
        admin: "/admin/dashboard",
      }[user.role] || "/"
    );
  })();

  return (
    <nav className="bg-canvas border-b border-hairline sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark — text only, no logo blob */}
          <Link
            to="/"
            className="font-bold text-lg tracking-tight text-ink hover:text-saffron transition-colors"
          >
            Gujarat<span className="text-saffron">Jobs</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 h-16 inline-flex items-center text-sm font-bold tracking-tight transition-colors ${
                  isActive(to)
                    ? "text-saffron border-b-2 border-saffron -mb-px"
                    : "text-ink hover:text-saffron"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side: auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 px-3 h-10 rounded-full border border-hairline-strong hover:border-ink transition-colors">
                    <div className="w-7 h-7 rounded-full bg-saffron text-on-primary flex items-center justify-center text-xs font-bold">
                      {getInitials(user?.name || "U")}
                    </div>
                    <span className="text-sm font-bold text-ink max-w-[120px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-muted-text" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-canvas border border-hairline shadow-modal focus:outline-none">
                      <div className="p-2">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={dashboardLink}
                              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold ${
                                active ? "bg-canvas-warm" : ""
                              }`}
                            >
                              <Cog6ToothIcon className="h-4 w-4 text-muted-text" />
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold ${
                                active ? "bg-canvas-warm" : ""
                              }`}
                            >
                              <UserCircleIcon className="h-4 w-4 text-muted-text" />
                              Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <div className="border-t border-hairline my-1" />
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-error ${
                                active ? "bg-error-soft" : ""
                              }`}
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 h-10 inline-flex items-center text-sm font-bold text-ink hover:text-saffron transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs px-6 h-10 inline-flex items-center hover:bg-saffron-active active:scale-[0.98] transition-all duration-100"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center text-ink"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-hairline py-4">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 text-sm font-bold text-ink hover:bg-canvas-warm"
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-hairline my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardLink}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 text-sm font-bold text-ink hover:bg-canvas-warm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-left px-3 py-3 text-sm font-bold text-error hover:bg-error-soft"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 text-sm font-bold text-ink hover:bg-canvas-warm"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 mx-3 bg-saffron text-on-primary uppercase font-bold tracking-[0.05em] text-xs h-10 inline-flex items-center justify-center hover:bg-saffron-active"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
