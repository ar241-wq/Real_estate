'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackLocationSearch } from '@/lib/searchTracker';

export default function SearchBar() {
  const router = useRouter();
  const [status, setStatus] = useState('BUY');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (location) {
      params.append('location', location);
      // Track the location search for recommendations
      trackLocationSearch(location);
    }
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-xl shadow-lg p-3 sm:p-4 max-w-4xl mx-auto"
    >
      <div className="flex flex-col gap-3">
        {/* Top Row: Status Toggle and Location */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Toggle */}
          <div className="flex rounded-lg bg-secondary-100 p-1 self-start">
            {['BUY', 'RENT'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  status === option
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {option === 'BUY' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>

          {/* Location Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Enter city or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 bg-secondary-50 sm:bg-transparent rounded-lg sm:rounded-none border-0 focus:outline-none focus:ring-2 sm:focus:ring-0 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Bottom Row: Price Range and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Price Range */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute inset-y-0 left-3 flex items-center text-secondary-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full sm:w-28 pl-7 pr-2 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 bg-secondary-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <span className="text-secondary-400">-</span>
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute inset-y-0 left-3 flex items-center text-secondary-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full sm:w-28 pl-7 pr-2 py-3 text-sm text-secondary-900 placeholder:text-secondary-400 bg-secondary-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="btn-primary px-6 py-3 w-full sm:w-auto justify-center"
            aria-label="Search properties"
          >
            <svg
              className="w-5 h-5 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="sm:inline ml-2 sm:ml-0">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
