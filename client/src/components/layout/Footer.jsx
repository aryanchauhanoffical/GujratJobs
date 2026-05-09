/**
 * Footer — DESIGN.md "Disciplined warmth"
 *
 * BMW dark feature band closing — surface-dark, three columns max,
 * no rounded corners, hairline-thin separators, no emoji.
 */

import React from "react";
import { Link } from "react-router-dom";

const SEEKER_LINKS = [
  { to: "/jobs", label: "Browse jobs" },
  { to: "/jobs?isWalkIn=true", label: "Walk-ins" },
  { to: "/register", label: "Create account" },
  { to: "/dashboard", label: "My dashboard" },
];

const RECRUITER_LINKS = [
  { to: "/register?role=recruiter", label: "Post a job" },
  { to: "/recruiter/dashboard", label: "Recruiter dashboard" },
  { to: "/recruiter/profile", label: "Company profile" },
];

const CITIES = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Gandhinagar",
  "Bhavnagar",
];

export default function Footer() {
  return (
    <footer className="bg-surface-dark text-on-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="font-bold text-2xl tracking-tight text-on-dark"
            >
              Gujarat<span className="text-marigold">Jobs</span>
            </Link>
            <p className="mt-5 text-sm text-on-dark/70 leading-relaxed max-w-xs">
              Verified recruiters, real walk-ins, and honest hiring — built
              for Gujarat freshers.
            </p>
          </div>

          <FooterColumn title="For job seekers" links={SEEKER_LINKS} />
          <FooterColumn title="For recruiters" links={RECRUITER_LINKS} />

          <div>
            <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-on-dark mb-5">
              Top cities
            </h3>
            <ul className="space-y-3">
              {CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to={`/jobs?city=${city}`}
                    className="text-sm text-on-dark/70 hover:text-marigold transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-on-dark/15 mt-14 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-on-dark/50">
            © {new Date().getFullYear()} GujaratJobs. All rights reserved.
          </p>
          <p className="text-xs text-on-dark/50 tracking-wide">
            Made in Gujarat, for Gujarat.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-on-dark mb-5">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-on-dark/70 hover:text-marigold transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
