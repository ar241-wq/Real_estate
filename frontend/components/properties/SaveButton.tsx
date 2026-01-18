'use client';

import { useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { PropertyListItem, PropertyDetail } from '@/lib/types';

interface SaveButtonProps {
  property: PropertyListItem | PropertyDetail;
  variant?: 'icon' | 'text';
  className?: string;
}

export default function SaveButton({
  property,
  variant = 'icon',
  className = '',
}: SaveButtonProps) {
  const { isPropertySaved, toggleSaveFromList, toggleSaveFromDetail, isLoaded } =
    useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const isSaved = isPropertySaved(property.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Determine if it's a list item or detail based on the presence of 'images' property
    if ('images' in property) {
      toggleSaveFromDetail(property as PropertyDetail);
    } else {
      toggleSaveFromList(property as PropertyListItem);
    }
  };

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    if (variant === 'icon') {
      return (
        <button
          className={`p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all ${className}`}
          disabled
        >
          <svg
            className="w-5 h-5 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      );
    }
    return (
      <button
        className={`flex items-center text-secondary-400 ${className}`}
        disabled
      >
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Save
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all ${
          isAnimating ? 'scale-125' : 'scale-100'
        } ${className}`}
        aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        title={isSaved ? 'Remove from saved' : 'Save property'}
      >
        <svg
          className={`w-5 h-5 transition-colors ${
            isSaved ? 'text-red-500 fill-red-500' : 'text-secondary-600'
          }`}
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center transition-colors ${
        isSaved
          ? 'text-red-500 hover:text-red-600'
          : 'text-secondary-600 hover:text-primary-600'
      } ${isAnimating ? 'scale-110' : 'scale-100'} ${className}`}
      aria-label={isSaved ? 'Remove from saved' : 'Save property'}
    >
      <svg
        className={`w-5 h-5 mr-2 transition-colors ${
          isSaved ? 'fill-red-500' : ''
        }`}
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}
