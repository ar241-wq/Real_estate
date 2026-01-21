'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ListingStatus } from '@/lib/types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: ListingStatus) => Promise<void>;
  currentStatus: ListingStatus;
  propertyTitle: string;
}

const statusOptions: { value: ListingStatus; label: string; description: string; color: string }[] = [
  {
    value: 'DRAFT',
    label: 'Draft',
    description: 'Property is not visible to the public',
    color: 'bg-secondary-100 text-secondary-700',
  },
  {
    value: 'PUBLISHED',
    label: 'Published',
    description: 'Property is live and visible to everyone',
    color: 'bg-green-50 text-green-700',
  },
  {
    value: 'SOLD',
    label: 'Sold',
    description: 'Property has been sold or rented',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
    description: 'Property is hidden from public view',
    color: 'bg-secondary-50 text-secondary-500',
  },
];

export default function StatusChangeModal({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  propertyTitle,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onStatusChange(selectedStatus);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Status">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <p className="text-secondary-600 mb-4">
          Update the listing status for <span className="font-medium text-secondary-900">{propertyTitle}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {statusOptions.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all
                ${
                  selectedStatus === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }
              `}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={selectedStatus === option.value}
                onChange={() => setSelectedStatus(option.value)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-secondary-900">{option.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${option.color}`}>
                    {option.value === currentStatus ? 'Current' : ''}
                  </span>
                </div>
                <p className="text-sm text-secondary-500 mt-0.5">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={selectedStatus === currentStatus}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
