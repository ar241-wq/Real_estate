'use client';

import { ListingStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ListingStatus;
  statusDisplay: string;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

const statusStyles: Record<ListingStatus, string> = {
  DRAFT: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
  PUBLISHED: 'bg-green-50 text-green-700 hover:bg-green-100',
  SOLD: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  ARCHIVED: 'bg-secondary-50 text-secondary-500 hover:bg-secondary-100',
};

const statusIcons: Record<ListingStatus, React.ReactNode> = {
  DRAFT: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  PUBLISHED: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  SOLD: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ARCHIVED: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
};

export default function StatusBadge({
  status,
  statusDisplay,
  onClick,
  size = 'md',
}: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const baseClasses = `
    inline-flex items-center gap-1.5 font-medium rounded-full
    transition-colors ${sizeClasses} ${statusStyles[status]}
  `;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${baseClasses} cursor-pointer`}>
        {statusIcons[status]}
        {statusDisplay}
        <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      {statusIcons[status]}
      {statusDisplay}
    </span>
  );
}
