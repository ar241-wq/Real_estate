'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type AnimationType =
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'scale-in'
  | 'scale-in-bounce';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

const animationClasses: Record<AnimationType, string> = {
  'fade-in': 'animate-fade-in',
  'fade-in-up': 'animate-fade-in-up',
  'fade-in-down': 'animate-fade-in-down',
  'slide-in-left': 'animate-slide-in-left',
  'slide-in-right': 'animate-slide-in-right',
  'scale-in': 'animate-scale-in',
  'scale-in-bounce': 'animate-scale-in-bounce',
};

export default function AnimateOnScroll({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration = 800,
  threshold = 0.1,
  className = '',
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const animationClass = isVisible ? animationClasses[animation] : '';

  const style = {
    opacity: isVisible ? undefined : 0,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  };

  return (
    <div
      ref={ref}
      className={`${className} ${animationClass}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Stagger container for animating multiple children with delays
interface StaggerContainerProps {
  children: ReactNode[];
  animation?: AnimationType;
  staggerDelay?: number;
  baseDelay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  childClassName?: string;
}

export function StaggerContainer({
  children,
  animation = 'fade-in-up',
  staggerDelay = 100,
  baseDelay = 0,
  duration = 800,
  threshold = 0.1,
  className = '',
  childClassName = '',
}: StaggerContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const animationClass = isVisible ? animationClasses[animation] : '';

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`${childClassName} ${animationClass}`}
          style={{
            opacity: isVisible ? undefined : 0,
            animationDelay: `${baseDelay + index * staggerDelay}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
