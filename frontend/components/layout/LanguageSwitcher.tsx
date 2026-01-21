'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg bg-secondary-100 p-0.5">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-primary-600 text-white'
            : 'text-secondary-600 hover:text-secondary-900'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('sq')}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
          language === 'sq'
            ? 'bg-primary-600 text-white'
            : 'text-secondary-600 hover:text-secondary-900'
        }`}
        aria-label="Switch to Albanian"
      >
        SQ
      </button>
    </div>
  );
}
