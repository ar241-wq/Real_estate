'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SavedProperty } from '@/lib/types';
import { useFavorites } from '@/context/FavoritesContext';

interface SavedPropertyCardProps {
  property: SavedProperty;
}

export default function SavedPropertyCard({ property }: SavedPropertyCardProps) {
  const { unsaveProperty } = useFavorites();

  const formatPrice = (price: string, currency: string, status: string) => {
    const numPrice = parseFloat(price);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(numPrice);

    if (status === 'RENT') {
      return `${formatted}/mo`;
    }
    return formatted;
  };

  const statusColors = {
    BUY: 'bg-green-100 text-green-800',
    RENT: 'bg-blue-100 text-blue-800',
    COMMERCIAL: 'bg-purple-100 text-purple-800',
    DEVELOPMENT: 'bg-orange-100 text-orange-800',
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveProperty(property.id);
  };

  return (
    <Link href={`/properties/${property.slug}`} className="group">
      <article className="card h-full hover:shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {property.cover_image ? (
            <Image
              src={property.cover_image}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                statusColors[property.status]
              }`}
            >
              {property.status_display}
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110"
            aria-label="Remove from saved"
            title="Remove from saved"
          >
            <svg
              className="w-5 h-5 text-red-500 fill-red-500"
              fill="currentColor"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Price */}
          <div className="text-xl font-bold text-primary-600 mb-2">
            {formatPrice(property.price, property.currency, property.status)}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-secondary-500 text-sm mb-4">
            <svg
              className="w-4 h-4 mr-1.5 flex-shrink-0"
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
            <span className="line-clamp-1">{property.location_text}</span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-secondary-100">
            <div className="flex items-center text-secondary-600 text-xs sm:text-sm">
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {property.bedrooms} Beds
            </div>
            <div className="flex items-center text-secondary-600 text-xs sm:text-sm">
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
              {property.bathrooms} Baths
            </div>
            <div className="flex items-center text-secondary-600 text-xs sm:text-sm">
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              {property.size_sqm} sqm
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
