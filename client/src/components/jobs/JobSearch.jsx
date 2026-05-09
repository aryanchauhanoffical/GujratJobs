/**
 * JobSearch — DESIGN.md "Disciplined warmth"
 *
 * Search input. Hairline border, saffron focus ring, magnifier left, clear right.
 */

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useJobStore from "../../store/useJobStore";

export default function JobSearch({ className = "" }) {
  const { filters, setFilter } = useJobStore();
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter("search", localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setFilter]);

  const handleClear = () => {
    setLocalSearch("");
    setFilter("search", "");
  };

  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-soft stroke-[1.5] pointer-events-none" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search jobs, companies, skills..."
        className="w-full pl-11 pr-10 py-3 border border-hairline rounded-lg focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 bg-canvas text-sm transition-all"
      />
      {localSearch && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-ink transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
