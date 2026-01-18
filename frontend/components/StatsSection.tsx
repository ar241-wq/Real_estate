'use client';

import AnimatedCounter from './ui/AnimatedCounter';

const stats = [
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 1200, suffix: '+', label: 'Properties Sold' },
  { value: 50, suffix: '+', label: 'Expert Agents' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
];

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-24 bg-secondary-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2000}
                />
              </div>
              <div className="text-secondary-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
