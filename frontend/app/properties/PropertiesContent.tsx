'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProperties } from '@/lib/api';
import { PropertyListItem, PropertyFilters } from '@/lib/types';
import FilterBar from '@/components/properties/FilterBar';
import PropertyGrid from '@/components/properties/PropertyGrid';
import MapPlaceholder from '@/components/properties/MapPlaceholder';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 0,
    currentPage: 1,
    next: null as string | null,
    previous: null as string | null,
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    setError('');

    try {
      const filters: PropertyFilters = {
        status: searchParams.get('status') as any || undefined,
        location: searchParams.get('location') || undefined,
        min_price: searchParams.get('min_price') || undefined,
        max_price: searchParams.get('max_price') || undefined,
        bedrooms: searchParams.get('bedrooms') || undefined,
        min_size: searchParams.get('min_size') || undefined,
        max_size: searchParams.get('max_size') || undefined,
        featured: searchParams.get('featured') || undefined,
        ordering: searchParams.get('ordering') || '-created_at',
        page: parseInt(searchParams.get('page') || '1'),
      };

      const response = await getProperties(filters);
      setProperties(response.results);
      setPagination({
        count: response.count,
        totalPages: response.total_pages,
        currentPage: response.current_page,
        next: response.next,
        previous: response.previous,
      });
    } catch (err) {
      setError('Failed to load properties. Please try again.');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/properties?${params.toString()}`;
  };

  return (
    <>
      {/* Filter Bar */}
      <FilterBar onViewChange={setView} currentView={view} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-secondary-500 mb-4">{error}</p>
          <button onClick={fetchProperties} className="btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Results Count */}
          <div className="mb-6 text-secondary-600">
            Showing {properties.length} of {pagination.count} properties
          </div>

          {/* View Toggle Content */}
          {view === 'grid' ? (
            <PropertyGrid properties={properties} />
          ) : (
            <div className="h-[600px]">
              <MapPlaceholder properties={properties} />
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {/* Previous Button */}
              {pagination.previous ? (
                <Link
                  href={buildPageUrl(pagination.currentPage - 1)}
                  className="btn-outline"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </Link>
              ) : (
                <button className="btn-outline opacity-50 cursor-not-allowed" disabled>
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
              )}

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.currentPage) <= 1
                  )
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-secondary-400">...</span>
                        )}
                        <Link
                          href={buildPageUrl(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                            page === pagination.currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-secondary-600 hover:bg-secondary-100'
                          }`}
                        >
                          {page}
                        </Link>
                      </span>
                    );
                  })}
              </div>

              {/* Next Button */}
              {pagination.next ? (
                <Link
                  href={buildPageUrl(pagination.currentPage + 1)}
                  className="btn-outline"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <button className="btn-outline opacity-50 cursor-not-allowed" disabled>
                  Next
                  <svg
                    className="w-5 h-5 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
