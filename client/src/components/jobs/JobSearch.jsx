import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useJobStore from '../../store/useJobStore';

const JobSearch = ({ className = '' }) => {
  const { filters, setFilter } = useJobStore();
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setFilter]);

  const handleClear = () => {
    setLocalSearch('');
    setFilter('search', '');
  };

  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search jobs, companies, skills..."
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
      />
      {localSearch && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default JobSearch;
