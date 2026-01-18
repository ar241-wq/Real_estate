'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAdminProperty } from '@/lib/api';
import { PropertyDetail } from '@/lib/types';
import PropertyForm from '@/components/admin/PropertyForm';
import Spinner from '@/components/ui/Spinner';

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = Number(params.id);

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getAdminProperty(propertyId);
        setProperty(data);
      } catch (err) {
        setError('Failed to load property');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
          Property not found
        </h3>
        <p className="text-secondary-500">{error || 'The property could not be loaded'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">Edit Property</h2>
        <p className="text-sm sm:text-base text-secondary-600">
          Update property details and images
        </p>
      </div>

      <PropertyForm property={property} isEdit />
    </div>
  );
}
