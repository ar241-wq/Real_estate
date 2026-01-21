'use client';

import { useState } from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
}

export default function Toggle({
  enabled,
  onChange,
  disabled = false,
  size = 'md',
  label,
}: ToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onChange(!enabled);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5',
    },
  };

  const { track, thumb, translate } = sizeClasses[size];

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex ${track} flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${enabled ? 'bg-primary-600' : 'bg-secondary-200'}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={`
          pointer-events-none inline-block ${thumb} transform rounded-full
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${enabled ? translate : 'translate-x-0'}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
    </button>
  );
}
