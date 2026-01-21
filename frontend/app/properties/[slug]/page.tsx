import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPropertyBySlug } from '@/lib/api';
import GalleryCarousel from '@/components/properties/GalleryCarousel';
import MapPlaceholder from '@/components/properties/MapPlaceholder';
import PropertyActions from './PropertyActions';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const property = await getPropertyBySlug(params.slug);
    return {
      title: property.title,
      description: property.description.slice(0, 160),
    };
  } catch {
    return {
      title: 'Property Not Found',
    };
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  let property;

  try {
    property = await getPropertyBySlug(params.slug);
  } catch (error) {
    notFound();
  }

  const formatPrice = (price: string, currency: string, status: string) => {
    const numPrice = parseFloat(price);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(numPrice);

    if (status === 'RENT') {
      return `${formatted}/month`;
    }
    return formatted;
  };

  const statusColors = {
    BUY: 'bg-green-100 text-green-800',
    RENT: 'bg-blue-100 text-blue-800',
    COMMERCIAL: 'bg-purple-100 text-purple-800',
    DEVELOPMENT: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 overflow-x-auto">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm whitespace-nowrap">
            <li>
              <Link href="/" className="text-secondary-500 hover:text-primary-600">
                Home
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li>
              <Link
                href="/properties"
                className="text-secondary-500 hover:text-primary-600"
              >
                Properties
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li className="text-secondary-900 font-medium truncate max-w-[150px] sm:max-w-[200px]">
              {property.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <GalleryCarousel images={property.images} title={property.title} />

            {/* Title and Status */}
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <span
                  className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    statusColors[property.status]
                  }`}
                >
                  {property.status_display}
                </span>
                {property.featured && (
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-800">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-2">
                {property.title}
              </h1>
              <div className="flex items-start text-secondary-600 text-sm sm:text-base">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
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
                <span>{property.address || property.location_text}</span>
              </div>
            </div>

            {/* Key Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-secondary-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-secondary-900">
                  {property.bedrooms}
                </div>
                <div className="text-xs sm:text-sm text-secondary-600">Bedrooms</div>
              </div>
              <div className="bg-secondary-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-secondary-900">
                  {property.bathrooms}
                </div>
                <div className="text-xs sm:text-sm text-secondary-600">Bathrooms</div>
              </div>
              <div className="bg-secondary-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-secondary-900">
                  {property.size_sqm}
                </div>
                <div className="text-xs sm:text-sm text-secondary-600">Sq Meters</div>
              </div>
              <div className="bg-secondary-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-secondary-900 truncate">
                  {property.status_display}
                </div>
                <div className="text-xs sm:text-sm text-secondary-600">Type</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Description
              </h2>
              <div className="prose prose-secondary max-w-none">
                {property.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-secondary-600 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Map */}
            {(property.map_embed || (property.latitude && property.longitude)) && (
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Location
                </h2>
                <div className="h-[400px] rounded-xl overflow-hidden">
                  {property.map_embed ? (
                    <div
                      className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                      dangerouslySetInnerHTML={{ __html: property.map_embed }}
                    />
                  ) : (
                    <MapPlaceholder
                      singleProperty={{
                        title: property.title,
                        lat: parseFloat(property.latitude!),
                        lng: parseFloat(property.longitude!),
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Price Card */}
              <div className="card p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">
                  {formatPrice(property.price, property.currency, property.status)}
                </div>
                <p className="text-secondary-600 text-sm mb-4 sm:mb-6">
                  {property.status === 'RENT'
                    ? 'Monthly rent'
                    : 'Asking price'}
                </p>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button className="btn-primary w-full justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Schedule a Visit
                  </button>
                  <button className="btn-outline w-full justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Contact Agent
                  </button>
                </div>
              </div>

              {/* Agent Card */}
              {property.agent_name && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Listed By
                  </h3>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {property.agent_photo_url ? (
                        <Image
                          src={property.agent_photo_url}
                          alt={property.agent_name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-secondary-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-secondary-900">
                        {property.agent_name}
                      </h4>
                      <p className="text-sm text-secondary-500 mb-3">
                        Real Estate Agent
                      </p>
                      {property.agent_phone && (
                        <a
                          href={`tel:${property.agent_phone}`}
                          className="flex items-center text-sm text-secondary-600 hover:text-primary-600 mb-1"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {property.agent_phone}
                        </a>
                      )}
                      {property.agent_email && (
                        <a
                          href={`mailto:${property.agent_email}`}
                          className="flex items-center text-sm text-secondary-600 hover:text-primary-600"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {property.agent_email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Share & Save */}
              <PropertyActions property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
