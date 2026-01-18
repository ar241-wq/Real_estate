'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminProperties, deleteAdminProperty } from '@/lib/api';
import { PropertyListItem } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAdminProperties();
      setProperties(response.results);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteAdminProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const statusColors = {
    BUY: 'bg-green-100 text-green-800',
    RENT: 'bg-blue-100 text-blue-800',
    COMMERCIAL: 'bg-purple-100 text-purple-800',
    DEVELOPMENT: 'bg-orange-100 text-orange-800',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">Properties</h2>
          <p className="text-sm sm:text-base text-secondary-600">
            Manage your property listings
          </p>
        </div>
        <Link href="/admin/dashboard/properties/new" className="self-start sm:self-auto">
          <Button className="w-full sm:w-auto justify-center">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Property
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProperties}>Try Again</Button>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            No properties yet
          </h3>
          <p className="text-secondary-500 mb-4">
            Get started by adding your first property
          </p>
          <Link href="/admin/dashboard/properties/new">
            <Button>Add Property</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-secondary-200 overflow-hidden"
              >
                <div className="flex gap-3 p-4">
                  {/* Image */}
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-secondary-100 rounded-lg overflow-hidden">
                    {property.cover_image ? (
                      <Image
                        src={property.cover_image}
                        alt={property.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-secondary-900 truncate">
                        {property.title}
                      </h3>
                      {property.featured && (
                        <svg
                          className="w-4 h-4 text-yellow-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-secondary-500 truncate mt-0.5">
                      {property.location_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[property.status]
                        }`}
                      >
                        {property.status_display}
                      </span>
                      <span className="text-sm font-semibold text-primary-600">
                        {formatPrice(property.price, property.currency)}
                        {property.status === 'RENT' && (
                          <span className="text-secondary-500 font-normal">/mo</span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      {property.bedrooms} beds • {property.bathrooms} baths • {property.size_sqm} sqm
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 px-4 py-3 bg-secondary-50 border-t border-secondary-200">
                  <Link
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                    title="View on site"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/dashboard/properties/${property.id}/edit`}
                    className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(property.id)}
                    className="p-2 text-secondary-500 hover:text-red-600 hover:bg-secondary-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border border-secondary-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                      Property
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                      Price
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">
                      Location
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-secondary-600">
                      Featured
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-16 h-12 bg-secondary-100 rounded-lg overflow-hidden">
                            {property.cover_image ? (
                              <Image
                                src={property.cover_image}
                                alt={property.title}
                                width={64}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-secondary-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-secondary-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {property.bedrooms} beds, {property.bathrooms} baths,{' '}
                              {property.size_sqm} sqm
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[property.status]
                          }`}
                        >
                          {property.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-secondary-900">
                        {formatPrice(property.price, property.currency)}
                        {property.status === 'RENT' && (
                          <span className="text-secondary-500 font-normal">/mo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary-600">
                        {property.location_text}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {property.featured ? (
                          <svg
                            className="w-5 h-5 text-yellow-500 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <span className="text-secondary-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            className="p-2 text-secondary-400 hover:text-secondary-600"
                            title="View on site"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/dashboard/properties/${property.id}/edit`}
                            className="p-2 text-secondary-400 hover:text-primary-600"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(property.id)}
                            className="p-2 text-secondary-400 hover:text-red-600"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Property"
      >
        <div className="p-4 sm:p-6">
          <p className="text-secondary-600 mb-6">
            Are you sure you want to delete this property? This will also delete
            all associated images. This action cannot be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              isLoading={isDeleting}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
