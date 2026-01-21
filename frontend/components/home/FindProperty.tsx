import Link from 'next/link';
import { getProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';

export default async function FindProperty() {
  let properties: any[] = [];

  try {
    const response = await getProperties({ page_size: 2 });
    properties = response.results;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-white">
      {/* Top Wave Divider */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <svg
          className="relative block w-full h-16 text-secondary-100"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary-600 mb-4">
            Latest Listings
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
            Find Your Perfect Property
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Browse our latest listings and find the home of your dreams
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-center max-w-5xl mx-auto">
          {properties.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="btn-primary inline-flex items-center"
          >
            Browse All Properties
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
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rotate-180">
        <svg
          className="relative block w-full h-16 text-secondary-100"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
