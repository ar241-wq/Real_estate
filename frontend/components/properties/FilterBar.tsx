'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyStatus } from '@/lib/types';
import { trackLocationSearch } from '@/lib/searchTracker';

const statusOptions = [
  { value: '', label: 'All Types' },
  { value: 'BUY', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'DEVELOPMENT', label: 'New Development' },
];

const bedroomOptions = [
  { value: '', label: 'Any Beds' },
  { value: '1', label: '1 Bed' },
  { value: '2', label: '2 Beds' },
  { value: '3', label: '3 Beds' },
  { value: '4', label: '4+ Beds' },
];

const sortOptions = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

interface FilterBarProps {
  onViewChange?: (view: 'grid' | 'map') => void;
  currentView?: 'grid' | 'map';
}

export default function FilterBar({
  onViewChange,
  currentView = 'grid',
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    minSize: searchParams.get('min_size') || '',
    maxSize: searchParams.get('max_size') || '',
    ordering: searchParams.get('ordering') || '-created_at',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.status) params.set('status', filters.status);
    if (filters.location) {
      params.set('location', filters.location);
      // Track the location search for recommendations
      trackLocationSearch(filters.location);
    }
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.minSize) params.set('min_size', filters.minSize);
    if (filters.maxSize) params.set('max_size', filters.maxSize);
    if (filters.ordering) params.set('ordering', filters.ordering);

    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      minSize: '',
      maxSize: '',
      ordering: '-created_at',
    });
    router.push('/properties');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters when ordering changes
  useEffect(() => {
    const currentOrdering = searchParams.get('ordering') || '-created_at';
    if (filters.ordering !== currentOrdering) {
      applyFilters();
    }
  }, [filters.ordering]);

  const hasActiveFilters =
    filters.status ||
    filters.location ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms ||
    filters.minSize ||
    filters.maxSize;

  return (
    <div className="bg-white border border-secondary-200 rounded-xl p-4 lg:p-6 mb-8">
      {/* Main Filter Row */}
      <div className="space-y-4">
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
          {/* Status Tabs */}
          <div className="flex rounded-lg bg-secondary-100 p-1 overflow-x-auto">
            {statusOptions.slice(0, 3).map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  handleFilterChange('status', option.value);
                  setTimeout(applyFilters, 0);
                }}
                className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  filters.status === option.value
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Location Search */}
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="input pl-10 w-full"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
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
            </div>
          </div>
        </div>

        {/* Second row: Filters, Sort, View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* More Filters Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-outline flex items-center text-sm"
          >
            <svg
              className="w-5 h-5 mr-1 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="hidden xs:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 sm:ml-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={filters.ordering}
            onChange={(e) => handleFilterChange('ordering', e.target.value)}
            className="input w-auto text-sm flex-1 sm:flex-none min-w-0"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          {onViewChange && (
            <div className="flex rounded-lg bg-secondary-100 p-1 ml-auto">
              <button
                onClick={() => onViewChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  currentView === 'grid'
                    ? 'bg-white shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
                aria-label="Grid view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onViewChange('map')}
                className={`p-2 rounded-md transition-colors ${
                  currentView === 'map'
                    ? 'bg-white shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
                aria-label="Map view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Property Type (full list) */}
            <div>
              <label className="label">Property Type</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="label">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="input"
              >
                {bedroomOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label">Min Price</label>
              <input
                type="number"
                placeholder="No min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Max Price</label>
              <input
                type="number"
                placeholder="No max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input"
              />
            </div>

            {/* Size Range */}
            <div>
              <label className="label">Min Size (sqm)</label>
              <input
                type="number"
                placeholder="No min"
                value={filters.minSize}
                onChange={(e) => handleFilterChange('minSize', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Max Size (sqm)</label>
              <input
                type="number"
                placeholder="No max"
                value={filters.maxSize}
                onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <button onClick={clearFilters} className="btn-ghost text-red-600">
              Clear All
            </button>
            <button onClick={applyFilters} className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
