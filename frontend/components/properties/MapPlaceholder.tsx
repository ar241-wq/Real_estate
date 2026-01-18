'use client';

import { PropertyListItem } from '@/lib/types';

interface MapPlaceholderProps {
  properties?: PropertyListItem[];
  center?: { lat: number; lng: number };
  singleProperty?: {
    title: string;
    lat: number;
    lng: number;
  };
}

export default function MapPlaceholder({
  properties,
  center,
  singleProperty,
}: MapPlaceholderProps) {
  const hasCoordinates = singleProperty || (properties && properties.length > 0);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-secondary-100 rounded-xl overflow-hidden">
      {/* Map Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Map Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        {/* Map Icon */}
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-primary-600"
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
        </div>

        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Map View
        </h3>

        {singleProperty ? (
          <div className="text-center max-w-md">
            <p className="text-secondary-600 text-sm mb-4">
              {singleProperty.title}
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm">
              <svg
                className="w-4 h-4 text-primary-600 mr-2"
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
              <span className="text-secondary-700">
                {singleProperty.lat.toFixed(4)}, {singleProperty.lng.toFixed(4)}
              </span>
            </div>
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="text-center">
            <p className="text-secondary-600 text-sm mb-4">
              Showing {properties.length} properties
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {properties.slice(0, 5).map((property) => (
                <div
                  key={property.id}
                  className="inline-flex items-center px-3 py-1.5 bg-white rounded-full shadow-sm text-xs"
                >
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
                  <span className="text-secondary-700 truncate max-w-[150px]">
                    {property.title}
                  </span>
                </div>
              ))}
              {properties.length > 5 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-secondary-200 rounded-full text-xs text-secondary-600">
                  +{properties.length - 5} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-secondary-500 text-sm text-center max-w-xs">
            Interactive map integration can be added here. Connect to Google
            Maps, Mapbox, or any map provider.
          </p>
        )}
      </div>

      {/* Simulated Markers */}
      {singleProperty && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-600/30 rounded-full blur-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
