import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">GujaratJobs</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Gujarat's leading job platform connecting local talent with top employers across all major cities.
            </p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/jobs?isWalkIn=true" className="hover:text-white transition-colors">Walk-in Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Recruiters</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=recruiter" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Dashboard</Link></li>
              <li><Link to="/recruiter/profile" className="hover:text-white transition-colors">Company Profile</Link></li>
            </ul>
          </div>

          {/* Gujarat Cities */}
          <div>
            <h3 className="text-white font-semibold mb-4">Top Cities</h3>
            <ul className="space-y-2 text-sm">
              {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar'].map(city => (
                <li key={city}>
                  <Link to={`/jobs?city=${city}`} className="hover:text-white transition-colors">{city}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 GujaratJobs. All rights reserved.</p>
          <div className="flex items-center gap-1 text-accent-400">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>for Gujarat</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
