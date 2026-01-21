'use client';

import { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
}

export default function Dropdown({ items, trigger, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
      >
        {trigger || (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5
            focus:outline-none transform opacity-100 scale-100
            ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          `}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div key={index}>
                {item.divider && index > 0 && (
                  <div className="my-1 border-t border-secondary-200" />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center px-4 py-2 text-sm transition-colors
                    ${
                      item.variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-secondary-700 hover:bg-secondary-50'
                    }
                  `}
                >
                  {item.icon && <span className="mr-3 w-4 h-4">{item.icon}</span>}
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
