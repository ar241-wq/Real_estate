'use client';

import { useState } from 'react';
import ValueAccordionCard from './ValueAccordionCard';

interface Value {
  title: string;
  description: string;
}

interface ValuesAccordionProps {
  values: Value[];
  allowMultiple?: boolean;
}

export default function ValuesAccordion({
  values,
  allowMultiple = false,
}: ValuesAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(index)) {
        // Close this card
        newSet.delete(index);
      } else {
        // Open this card
        if (allowMultiple) {
          newSet.add(index);
        } else {
          // Accordion mode: close others, open this one
          newSet.clear();
          newSet.add(index);
        }
      }

      return newSet;
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-secondary-200 divide-y divide-secondary-200 px-6 lg:px-8">
      {values.map((value, index) => (
        <ValueAccordionCard
          key={value.title}
          id={`value-${index}`}
          title={value.title}
          text={value.description}
          isOpen={openIds.has(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
