'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';

interface SavedLinkProps {
  variant?: 'desktop' | 'mobile';
  onClick?: () => void;
}

export default function SavedLink({ variant = 'desktop', onClick }: SavedLinkProps) {
  const { savedCount, isLoaded } = useFavorites();
  const pathname = usePathname();
  const isActive = pathname === '/saved';

  if (variant === 'mobile') {
    return (
      <Link
        href="/saved"
        className={`flex items-center text-base font-medium ${
          isActive ? 'text-primary-600' : 'text-secondary-600'
        }`}
        onClick={onClick}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill={isActive ? 'currentColor' : 'none'}
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
        Saved
        {isLoaded && savedCount > 0 && (
          <span className="ml-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {savedCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/saved"
      className={`relative flex items-center text-sm font-medium transition-colors ${
        isActive
          ? 'text-primary-600'
          : 'text-secondary-600 hover:text-secondary-900'
      }`}
      title="Saved Properties"
    >
      <svg
        className="w-5 h-5"
        fill={isActive ? 'currentColor' : 'none'}
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
      {isLoaded && savedCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
          {savedCount > 99 ? '99+' : savedCount}
        </span>
      )}
    </Link>
  );
}
