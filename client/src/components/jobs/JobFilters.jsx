/**
 * JobFilters — DESIGN.md "Disciplined warmth"
 *
 * Sidebar filter panel. BMW-style: 13px uppercase eyebrows, hairline
 * sections, saffron radio/checkbox accents. No emoji on filter labels.
 */

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useJobStore from "../../store/useJobStore";
import {
  GUJARAT_CITIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  SALARY_RANGES,
} from "../../utils/constants";

export default function JobFilters({ onClose }) {
  const { filters, setFilter, setFilters, resetFilters, getActiveFilterCount } =
    useJobStore();
  const activeCount = getActiveFilterCount();

  const handleSalaryRange = (range) => {
    setFilters({ minSalary: range.min || "", maxSalary: range.max || "" });
  };

  return (
    <div className="bg-canvas border border-hairline rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="bg-saffron text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs uppercase tracking-wider font-bold text-error hover:text-error/80"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-soft hover:text-ink transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-7">
        <FilterSection label="City">
          <select
            value={filters.city}
            onChange={(e) => setFilter("city", e.target.value)}
            className="w-full px-3 py-2 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron transition-colors"
          >
            <option value="">All Gujarat cities</option>
            {GUJARAT_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FilterSection>

        <FilterSection label="Job type">
          <RadioGroup
            name="jobType"
            value={filters.type}
            onChange={(v) => setFilter("type", v)}
            options={[{ value: "", label: "All types" }, ...JOB_TYPES]}
          />
        </FilterSection>

        <FilterSection label="Experience">
          <RadioGroup
            name="expLevel"
            value={filters.experienceLevel}
            onChange={(v) => setFilter("experienceLevel", v)}
            options={[{ value: "", label: "All levels" }, ...EXPERIENCE_LEVELS]}
          />
        </FilterSection>

        <FilterSection label="Salary range">
          <div className="space-y-2.5">
            {SALARY_RANGES.map((range, idx) => (
              <label key={idx} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="salary"
                  checked={
                    parseInt(filters.minSalary || 0) === range.min &&
                    parseInt(filters.maxSalary || 0) === range.max
                  }
                  onChange={() => handleSalaryRange(range)}
                  className="text-saffron focus:ring-saffron border-hairline-strong"
                />
                <span className="text-sm text-body">{range.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Special">
          <div className="space-y-2.5">
            {[
              { key: "isWalkIn", label: "Walk-in jobs only" },
              { key: "isGuaranteedHiring", label: "Guaranteed hiring" },
              { key: "fastTrack", label: "Fast track" },
              { key: "isFresherFriendly", label: "Fresher friendly" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!filters[key]}
                  onChange={(e) => setFilter(key, e.target.checked)}
                  className="rounded text-saffron focus:ring-saffron border-hairline-strong"
                />
                <span className="text-sm text-body">{label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Category">
          <select
            value={filters.category}
            onChange={(e) => setFilter("category", e.target.value)}
            className="w-full px-3 py-2 border border-hairline rounded-lg text-sm bg-canvas focus:outline-none focus:border-saffron transition-colors"
          >
            <option value="">All categories</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] font-bold tracking-[0.15em] uppercase text-ink mb-3">
        {label}
      </label>
      {children}
    </div>
  );
}

function RadioGroup({ name, value, onChange, options }) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="text-saffron focus:ring-saffron border-hairline-strong"
          />
          <span className="text-sm text-body">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
