'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface SchedulePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (dateTime: string) => Promise<void>;
  propertyTitle: string;
}

export default function SchedulePublishModal({
  isOpen,
  onClose,
  onSchedule,
  propertyTitle,
}: SchedulePublishModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Please select a date');
      return;
    }

    const dateTime = `${date}T${time}:00`;
    const scheduledDate = new Date(dateTime);

    if (scheduledDate <= new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    setIsLoading(true);
    try {
      await onSchedule(dateTime);
      setDate('');
      setTime('09:00');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule publication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDate('');
    setTime('09:00');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Publication">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <p className="text-secondary-600 mb-4">
          Schedule when <span className="font-medium text-secondary-900">{propertyTitle}</span> should be published.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="schedule-date" className="block text-sm font-medium text-secondary-700 mb-1">
              Date
            </label>
            <input
              id="schedule-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="schedule-time" className="block text-sm font-medium text-secondary-700 mb-1">
              Time
            </label>
            <input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {date && time && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">
              Will be published on{' '}
              <span className="font-medium">
                {new Date(`${date}T${time}`).toLocaleString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
