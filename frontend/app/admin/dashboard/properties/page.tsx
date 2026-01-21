'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAdminProperties,
  deleteAdminProperty,
  duplicateProperty,
  togglePropertyFeatured,
  markPropertySold,
  archiveProperty,
  publishProperty,
  schedulePropertyPublish,
  updatePropertyListingStatus,
} from '@/lib/api';
import { PropertyListItem, ListingStatus, PropertyFilters } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Toggle from '@/components/ui/Toggle';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';
import StatusBadge from '@/components/ui/StatusBadge';
import SchedulePublishModal from '@/components/admin/SchedulePublishModal';
import StatusChangeModal from '@/components/admin/StatusChangeModal';

type SortOption = '-created_at' | '-updated_at' | 'title' | '-title' | 'price' | '-price';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: '-created_at', label: 'Newest First' },
  { value: '-updated_at', label: 'Recently Updated' },
  { value: 'title', label: 'Title A-Z' },
  { value: '-title', label: 'Title Z-A' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

const statusFilterOptions: { value: ListingStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'ARCHIVED', label: 'Archived' },
];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  return date.toLocaleDateString();
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('-created_at');

  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<PropertyListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<PropertyListItem | null>(null);
  const [statusModal, setStatusModal] = useState<PropertyListItem | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const filters: PropertyFilters = {
        ordering: sortBy,
      };
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (statusFilter) {
        filters.listing_status = statusFilter;
      }

      const response = await getAdminProperties(filters);
      setProperties(response.results);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProperties]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteAdminProperty(deleteConfirm.id);
      setProperties((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete property:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (property: PropertyListItem) => {
    try {
      await duplicateProperty(property.id);
      fetchProperties();
    } catch (err) {
      console.error('Failed to duplicate property:', err);
    }
  };

  const handleToggleFeatured = async (property: PropertyListItem) => {
    try {
      const result = await togglePropertyFeatured(property.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, featured: result.featured } : p))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const handleMarkSold = async (property: PropertyListItem) => {
    try {
      const result = await markPropertySold(property.id);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id
            ? { ...p, listing_status: result.listing_status, listing_status_display: result.listing_status_display }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to mark as sold:', err);
    }
  };

  const handleArchive = async (property: PropertyListItem) => {
    try {
      const result = await archiveProperty(property.id);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id
            ? { ...p, listing_status: result.listing_status, listing_status_display: result.listing_status_display }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  const handlePublish = async (property: PropertyListItem) => {
    try {
      const result = await publishProperty(property.id);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id
            ? { ...p, listing_status: result.listing_status, listing_status_display: result.listing_status_display }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  };

  const handleSchedulePublish = async (property: PropertyListItem, dateTime: string) => {
    await schedulePropertyPublish(property.id, dateTime);
    fetchProperties();
  };

  const handleStatusChange = async (property: PropertyListItem, newStatus: ListingStatus) => {
    const result = await updatePropertyListingStatus(property.id, newStatus);
    setProperties((prev) =>
      prev.map((p) =>
        p.id === property.id
          ? { ...p, listing_status: result.listing_status, listing_status_display: result.listing_status_display }
          : p
      )
    );
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const getDropdownItems = (property: PropertyListItem): DropdownItem[] => {
    const items: DropdownItem[] = [
      {
        label: 'Edit',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => window.location.href = `/admin/dashboard/properties/${property.id}/edit`,
      },
      {
        label: 'Duplicate',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ),
        onClick: () => handleDuplicate(property),
      },
      {
        label: 'View on site',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        ),
        onClick: () => window.open(`/properties/${property.slug}`, '_blank'),
      },
    ];

    // Add status-specific actions
    if (property.listing_status === 'DRAFT') {
      items.push({
        label: 'Publish',
        divider: true,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        onClick: () => handlePublish(property),
      });
      items.push({
        label: 'Schedule',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        onClick: () => setScheduleModal(property),
      });
    }

    if (property.listing_status === 'PUBLISHED') {
      items.push({
        label: 'Mark as Sold',
        divider: true,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => handleMarkSold(property),
      });
    }

    if (property.listing_status !== 'ARCHIVED') {
      items.push({
        label: 'Archive',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        onClick: () => handleArchive(property),
      });
    }

    items.push({
      label: 'Delete',
      divider: true,
      variant: 'danger',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setDeleteConfirm(property),
    });

    return items;
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
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ListingStatus | '')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
            <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            {searchQuery || statusFilter ? 'No properties found' : 'No properties yet'}
          </h3>
          <p className="text-secondary-500 mb-4">
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first property'}
          </p>
          {!searchQuery && !statusFilter && (
            <Link href="/admin/dashboard/properties/new">
              <Button>Add Property</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
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
                        <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-secondary-900 truncate">{property.title}</h3>
                    </div>
                    <p className="text-sm text-secondary-500 truncate mt-0.5">{property.location_text}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge
                        status={property.listing_status}
                        statusDisplay={property.listing_status_display}
                        onClick={() => setStatusModal(property)}
                        size="sm"
                      />
                      <span className="text-sm font-semibold text-primary-600">
                        {formatPrice(property.price, property.currency)}
                        {property.status === 'RENT' && <span className="text-secondary-500 font-normal">/mo</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-secondary-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {property.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {property.leads_count}
                      </span>
                      <span>{formatRelativeTime(property.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary-50 border-t border-secondary-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondary-500">Featured</span>
                    <Toggle
                      enabled={property.featured}
                      onChange={() => handleToggleFeatured(property)}
                      size="sm"
                    />
                  </div>
                  <Dropdown items={getDropdownItems(property)} />
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
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Property</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-secondary-600">Views</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-secondary-600">Leads</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-secondary-600">Featured</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Updated</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-[60px] h-[45px] bg-secondary-100 rounded-lg overflow-hidden">
                            {property.cover_image ? (
                              <Image
                                src={property.cover_image}
                                alt={property.title}
                                width={60}
                                height={45}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-secondary-900 truncate max-w-[200px]">{property.title}</div>
                            <div className="text-sm text-secondary-500 truncate max-w-[200px]">{property.location_text}</div>
                            <div className="text-sm font-semibold text-primary-600 mt-0.5">
                              {formatPrice(property.price, property.currency)}
                              {property.status === 'RENT' && <span className="text-secondary-500 font-normal">/mo</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={property.listing_status}
                          statusDisplay={property.listing_status_display}
                          onClick={() => setStatusModal(property)}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-secondary-600">
                          <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{property.views_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-secondary-600">
                          <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{property.leads_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Toggle
                            enabled={property.featured}
                            onChange={() => handleToggleFeatured(property)}
                            size="sm"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary-600 text-sm">
                        {formatRelativeTime(property.updated_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <Dropdown items={getDropdownItems(property)} />
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
            Are you sure you want to delete <span className="font-medium text-secondary-900">{deleteConfirm?.title}</span>?
            This will also delete all associated images. This action cannot be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Publish Modal */}
      {scheduleModal && (
        <SchedulePublishModal
          isOpen={!!scheduleModal}
          onClose={() => setScheduleModal(null)}
          onSchedule={(dateTime) => handleSchedulePublish(scheduleModal, dateTime)}
          propertyTitle={scheduleModal.title}
        />
      )}

      {/* Status Change Modal */}
      {statusModal && (
        <StatusChangeModal
          isOpen={!!statusModal}
          onClose={() => setStatusModal(null)}
          onStatusChange={(status) => handleStatusChange(statusModal, status)}
          currentStatus={statusModal.listing_status}
          propertyTitle={statusModal.title}
        />
      )}
    </div>
  );
}
