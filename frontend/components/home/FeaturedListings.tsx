'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';

export default function FeaturedListings() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await getProperties({ featured: 'true', page_size: 6 });
        setProperties(response.results);
      } catch (error) {
        console.error('Failed to fetch featured properties:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-secondary-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-secondary-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary-100 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('featured.title')}</h2>
          <p className="section-subtitle mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="btn-outline inline-flex items-center"
          >
            {t('featured.viewAll')}
            <svg
              className="w-4 h-4 ml-2"
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
      </div>
    </section>
  );
}
