'use client';

import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';
import SavedPropertyCard from './SavedPropertyCard';

export default function SavedPropertiesContent() {
  const { savedProperties, savedCount, isLoaded, clearAll } = useFavorites();

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved properties?')) {
      clearAll();
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="bg-secondary-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-secondary-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (savedCount === 0) {
    return (
      <div className="bg-secondary-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
              No Saved Properties
            </h1>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              You haven&apos;t saved any properties yet. Browse our listings and click the
              heart icon to save properties you&apos;re interested in.
            </p>
            <Link href="/properties" className="btn-primary">
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
              Saved Properties
            </h1>
            <p className="text-secondary-600 mt-1">
              {savedCount} {savedCount === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center self-start sm:self-auto"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear All
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <SavedPropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
