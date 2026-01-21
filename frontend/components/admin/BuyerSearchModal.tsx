'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { BuyerSearch, BuyerSearchFormData, BuyerPropertyType, BuyerSearchStatus } from '@/lib/types';

interface BuyerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BuyerSearchFormData) => Promise<void>;
  buyerSearch?: BuyerSearch | null;
}

const propertyTypeOptions: { value: BuyerPropertyType; label: string }[] = [
  { value: '', label: 'Any Type' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const statusOptions: { value: BuyerSearchStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'FULFILLED', label: 'Fulfilled' },
];

export default function BuyerSearchModal({
  isOpen,
  onClose,
  onSave,
  buyerSearch,
}: BuyerSearchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BuyerSearchFormData>({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    bedrooms_min: 0,
    bedrooms_max: null,
    budget_min: null,
    budget_max: null,
    currency: 'EUR',
    location_city: '',
    location_area: '',
    property_type: '',
    parking_required: false,
    balcony_required: false,
    furnished_required: false,
    notes: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (buyerSearch) {
      setFormData({
        buyer_name: buyerSearch.buyer_name,
        buyer_email: buyerSearch.buyer_email || '',
        buyer_phone: buyerSearch.buyer_phone || '',
        bedrooms_min: buyerSearch.bedrooms_min,
        bedrooms_max: buyerSearch.bedrooms_max,
        budget_min: buyerSearch.budget_min,
        budget_max: buyerSearch.budget_max,
        currency: buyerSearch.currency,
        location_city: buyerSearch.location_city || '',
        location_area: buyerSearch.location_area || '',
        property_type: buyerSearch.property_type,
        parking_required: buyerSearch.parking_required,
        balcony_required: buyerSearch.balcony_required,
        furnished_required: buyerSearch.furnished_required,
        notes: buyerSearch.notes || '',
        status: buyerSearch.status,
      });
    } else {
      setFormData({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        bedrooms_min: 0,
        bedrooms_max: null,
        budget_min: null,
        budget_max: null,
        currency: 'EUR',
        location_city: '',
        location_area: '',
        property_type: '',
        parking_required: false,
        balcony_required: false,
        furnished_required: false,
        notes: '',
        status: 'ACTIVE',
      });
    }
    setError('');
  }, [buyerSearch, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.buyer_name.trim()) {
      setError('Buyer name is required');
      return;
    }

    if (!formData.buyer_email && !formData.buyer_phone) {
      setError('Please provide either an email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save buyer search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={buyerSearch ? 'Edit Buyer Search' : 'Add Saved Search'}
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Buyer Information */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary-900 mb-3 pb-2 border-b border-secondary-200">
            Buyer Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Buyer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter buyer name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.buyer_email}
                  onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.buyer_phone}
                  onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Criteria */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary-900 mb-3 pb-2 border-b border-secondary-200">
            Search Criteria
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Min Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedrooms_min}
                  onChange={(e) => setFormData({ ...formData, bedrooms_min: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedrooms_max || ''}
                  onChange={(e) => setFormData({ ...formData, bedrooms_max: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Min Budget
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget_min || ''}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value || null })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Max Budget
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget_max || ''}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value || null })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Tirana"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  value={formData.location_area}
                  onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., City Center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Property Type
              </label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value as BuyerPropertyType })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {propertyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Optional Preferences */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary-900 mb-3 pb-2 border-b border-secondary-200">
            Optional Preferences
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.parking_required}
                onChange={(e) => setFormData({ ...formData, parking_required: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <span className="text-sm text-secondary-700">Parking Required</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.balcony_required}
                onChange={(e) => setFormData({ ...formData, balcony_required: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <span className="text-sm text-secondary-700">Balcony Required</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.furnished_required}
                onChange={(e) => setFormData({ ...formData, furnished_required: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <span className="text-sm text-secondary-700">Furnished Required</span>
            </label>
          </div>
        </div>

        {/* Notes & Status */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary-900 mb-3 pb-2 border-b border-secondary-200">
            Notes & Status
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Agent Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Internal notes about this buyer..."
              />
            </div>
            {buyerSearch && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BuyerSearchStatus })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {buyerSearch ? 'Save Changes' : 'Add Search'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
