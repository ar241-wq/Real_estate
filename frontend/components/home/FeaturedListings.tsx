import Link from 'next/link';
import { getProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';

export default async function FeaturedListings() {
  let properties = [];

  try {
    const response = await getProperties({ featured: 'true', page_size: 6 });
    properties = response.results;
  } catch (error) {
    console.error('Failed to fetch featured properties:', error);
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">Featured Properties</h2>
          <p className="section-subtitle mx-auto">
            Discover our hand-picked selection of premium properties available
            for sale and rent
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
            View All Properties
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
