'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProperties } from '@/lib/api';
import { PropertyListItem } from '@/lib/types';
import { getTopSearchedLocations, hasSearchHistory } from '@/lib/searchTracker';
import PropertyCard from '@/components/properties/PropertyCard';
import Spinner from '@/components/ui/Spinner';

export default function RecommendedProperties() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [topLocation, setTopLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSection, setShowSection] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Check if user has search history
      if (!hasSearchHistory()) {
        setShowSection(false);
        setIsLoading(false);
        return;
      }

      const topLocations = getTopSearchedLocations(1);
      if (topLocations.length === 0) {
        setShowSection(false);
        setIsLoading(false);
        return;
      }

      const location = topLocations[0];
      setTopLocation(location);

      try {
        const response = await getProperties({
          location: location,
          ordering: '-created_at',
        });

        if (response.results.length > 0) {
          // Show up to 4 properties
          setProperties(response.results.slice(0, 4));
          setShowSection(true);
        } else {
          setShowSection(false);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setShowSection(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Don't render anything if loading or no recommendations
  if (isLoading) {
    return null;
  }

  if (!showSection || properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">
                Recommended for You
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900">
              Properties in {topLocation}
            </h2>
            <p className="mt-2 text-secondary-600">
              Based on your recent searches
            </p>
          </div>
          <Link
            href={`/properties?location=${encodeURIComponent(topLocation || '')}`}
            className="btn-outline hidden sm:inline-flex"
          >
            View All
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href={`/properties?location=${encodeURIComponent(topLocation || '')}`}
            className="btn-primary"
          >
            View All in {topLocation}
          </Link>
        </div>
      </div>
    </section>
  );
}
