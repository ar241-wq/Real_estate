import { Metadata } from 'next';
import { Suspense } from 'react';
import PropertiesContent from './PropertiesContent';
import Spinner from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Properties',
  description:
    'Browse our selection of properties for sale and rent. Filter by location, price, bedrooms, and more.',
};

export default function PropertiesPage() {
  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-2">
            Properties
          </h1>
          <p className="text-secondary-600">
            Find your perfect property from our curated selection
          </p>
        </div>

        {/* Properties Content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          }
        >
          <PropertiesContent />
        </Suspense>
      </div>
    </div>
  );
}
