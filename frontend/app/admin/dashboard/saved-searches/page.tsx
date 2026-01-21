'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBuyerSearches,
  deleteBuyerSearch,
  createBuyerSearch,
  updateBuyerSearch,
  pauseBuyerSearch,
  activateBuyerSearch,
  fulfillBuyerSearch,
  getBuyerSearchMatches,
} from '@/lib/api';
import { BuyerSearch, BuyerSearchFormData, BuyerSearchStatus, BuyerSearchFilters, PropertyListItem } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';
import BuyerSearchModal from '@/components/admin/BuyerSearchModal';

const statusFilterOptions: { value: BuyerSearchStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'FULFILLED', label: 'Fulfilled' },
];

const statusStyles: Record<BuyerSearchStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  FULFILLED: 'bg-blue-50 text-blue-700',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<BuyerSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BuyerSearchStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<BuyerSearch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BuyerSearch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Matches modal
  const [matchesModal, setMatchesModal] = useState<BuyerSearch | null>(null);
  const [matches, setMatches] = useState<PropertyListItem[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const fetchSearches = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const filters: BuyerSearchFilters = {};
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (statusFilter) {
        filters.status = statusFilter;
      }
      if (locationFilter) {
        filters.location = locationFilter;
      }

      const response = await getBuyerSearches(filters);
      setSearches(response.results);
    } catch (err) {
      setError('Failed to load saved searches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, locationFilter]);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearches();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSearches]);

  const handleSave = async (data: BuyerSearchFormData) => {
    if (editingSearch) {
      await updateBuyerSearch(editingSearch.id, data);
    } else {
      await createBuyerSearch(data);
    }
    fetchSearches();
    setEditingSearch(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteBuyerSearch(deleteConfirm.id);
      setSearches((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete search:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePause = async (search: BuyerSearch) => {
    try {
      const result = await pauseBuyerSearch(search.id);
      setSearches((prev) =>
        prev.map((s) =>
          s.id === search.id ? { ...s, status: result.status, status_display: result.status_display } : s
        )
      );
    } catch (err) {
      console.error('Failed to pause search:', err);
    }
  };

  const handleActivate = async (search: BuyerSearch) => {
    try {
      const result = await activateBuyerSearch(search.id);
      setSearches((prev) =>
        prev.map((s) =>
          s.id === search.id ? { ...s, status: result.status, status_display: result.status_display } : s
        )
      );
    } catch (err) {
      console.error('Failed to activate search:', err);
    }
  };

  const handleFulfill = async (search: BuyerSearch) => {
    try {
      const result = await fulfillBuyerSearch(search.id);
      setSearches((prev) =>
        prev.map((s) =>
          s.id === search.id ? { ...s, status: result.status, status_display: result.status_display } : s
        )
      );
    } catch (err) {
      console.error('Failed to mark as fulfilled:', err);
    }
  };

  const handleViewMatches = async (search: BuyerSearch) => {
    setMatchesModal(search);
    setIsLoadingMatches(true);
    try {
      const result = await getBuyerSearchMatches(search.id);
      setMatches(result.results);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const getDropdownItems = (search: BuyerSearch): DropdownItem[] => {
    const items: DropdownItem[] = [
      {
        label: 'View Details',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        onClick: () => {
          setEditingSearch(search);
          setShowModal(true);
        },
      },
      {
        label: 'Edit Preferences',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => {
          setEditingSearch(search);
          setShowModal(true);
        },
      },
    ];

    if (search.status === 'ACTIVE') {
      items.push({
        label: 'Pause Search',
        divider: true,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => handlePause(search),
      });
    }

    if (search.status === 'PAUSED') {
      items.push({
        label: 'Activate Search',
        divider: true,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => handleActivate(search),
      });
    }

    if (search.status !== 'FULFILLED') {
      items.push({
        label: 'Mark as Fulfilled',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        onClick: () => handleFulfill(search),
      });
    }

    items.push({
      label: 'Delete Search',
      divider: true,
      variant: 'danger',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => setDeleteConfirm(search),
    });

    return items;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">Saved Buyer Searches</h2>
          <p className="text-sm sm:text-base text-secondary-600">
            Manage buyer preferences and match properties
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSearch(null);
            setShowModal(true);
          }}
          className="self-start sm:self-auto"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Saved Search
        </Button>
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
                placeholder="Search by name or contact..."
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
              onChange={(e) => setStatusFilter(e.target.value as BuyerSearchStatus | '')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="sm:w-40">
            <input
              type="text"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
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
          <Button onClick={fetchSearches}>Try Again</Button>
        </div>
      ) : searches.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-1">
            {searchQuery || statusFilter || locationFilter ? 'No searches found' : 'No saved searches yet'}
          </h3>
          <p className="text-secondary-500 mb-4">
            {searchQuery || statusFilter || locationFilter
              ? 'Try adjusting your filters'
              : 'Get started by adding a buyer search'}
          </p>
          {!searchQuery && !statusFilter && !locationFilter && (
            <Button onClick={() => setShowModal(true)}>Add Saved Search</Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {searches.map((search) => (
              <div key={search.id} className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-medium text-secondary-900">{search.buyer_name}</h3>
                      <p className="text-sm text-secondary-500">{search.contact}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[search.status]}`}>
                      {search.status_display}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-secondary-500">Bedrooms:</span>
                      <span className="ml-1 text-secondary-900">{search.bedrooms_range}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500">Budget:</span>
                      <span className="ml-1 text-secondary-900">{search.budget_range} {search.currency}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500">Location:</span>
                      <span className="ml-1 text-secondary-900">{search.location || 'Any'}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500">Type:</span>
                      <span className="ml-1 text-secondary-900">{search.property_type_display || 'Any'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewMatches(search)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {search.matches_count} matching properties
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary-50 border-t border-secondary-200">
                  <span className="text-xs text-secondary-500">Created {formatDate(search.created_at)}</span>
                  <Dropdown items={getDropdownItems(search)} />
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
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Buyer Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Bedrooms</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Budget Range</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Location</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Type</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-secondary-600">Matches</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {searches.map((search) => (
                    <tr key={search.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-secondary-900">{search.buyer_name}</span>
                      </td>
                      <td className="px-6 py-4 text-secondary-600">{search.contact}</td>
                      <td className="px-6 py-4 text-secondary-600">{search.bedrooms_range}</td>
                      <td className="px-6 py-4 text-secondary-600">
                        {search.budget_range} {search.currency}
                      </td>
                      <td className="px-6 py-4 text-secondary-600">{search.location || '-'}</td>
                      <td className="px-6 py-4 text-secondary-600">{search.property_type_display || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[search.status]}`}>
                          {search.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewMatches(search)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {search.matches_count}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-secondary-600 text-sm">
                        {formatDate(search.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <Dropdown items={getDropdownItems(search)} />
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

      {/* Add/Edit Modal */}
      <BuyerSearchModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSearch(null);
        }}
        onSave={handleSave}
        buyerSearch={editingSearch}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Saved Search"
      >
        <div className="p-4 sm:p-6">
          <p className="text-secondary-600 mb-6">
            Are you sure you want to delete the search for{' '}
            <span className="font-medium text-secondary-900">{deleteConfirm?.buyer_name}</span>?
            This action cannot be undone.
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

      {/* Matches Modal */}
      <Modal
        isOpen={!!matchesModal}
        onClose={() => {
          setMatchesModal(null);
          setMatches([]);
        }}
        title={`Matching Properties for ${matchesModal?.buyer_name}`}
      >
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {isLoadingMatches ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-500">No matching properties found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-4 p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                >
                  <div className="flex-shrink-0 w-16 h-12 bg-secondary-100 rounded overflow-hidden">
                    {property.cover_image ? (
                      <img
                        src={property.cover_image}
                        alt={property.title}
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-secondary-900 truncate">{property.title}</h4>
                    <p className="text-sm text-secondary-500">{property.location_text}</p>
                    <p className="text-sm font-medium text-primary-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: property.currency,
                        maximumFractionDigits: 0,
                      }).format(parseFloat(property.price))}
                    </p>
                  </div>
                  <a
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
