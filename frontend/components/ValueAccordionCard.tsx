'use client';

interface ValueAccordionCardProps {
  id: string;
  title: string;
  text: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ValueAccordionCard({
  id,
  title,
  text,
  isOpen,
  onToggle,
}: ValueAccordionCardProps) {
  const contentId = `accordion-content-${id}`;

  return (
    <div>
      {/* Header - Clickable */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full text-left py-5 flex items-center justify-between gap-4 cursor-pointer hover:text-primary-600 transition-colors duration-200"
      >
        <h3 className={`text-base font-semibold transition-colors duration-200 ${
          isOpen ? 'text-primary-600' : 'text-secondary-900'
        }`}>
          {title}
        </h3>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180 text-primary-600' : 'rotate-0 text-secondary-400'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable Content */}
      <div
        id={contentId}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-secondary-500 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
