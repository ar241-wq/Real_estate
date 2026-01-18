import { PropertyListItem } from '@/lib/types';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
  properties: PropertyListItem[];
  emptyMessage?: string;
}

export default function PropertyGrid({
  properties,
  emptyMessage = 'No properties found',
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-1">
          {emptyMessage}
        </h3>
        <p className="text-secondary-500">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
