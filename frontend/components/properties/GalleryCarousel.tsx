'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/lib/types';
import Modal from '@/components/ui/Modal';

interface GalleryCarouselProps {
  images: PropertyImage[];
  title: string;
}

export default function GalleryCarousel({ images, title }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-secondary-200 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-secondary-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-secondary-500">No images available</p>
        </div>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-secondary-100">
          <Image
            src={images[currentIndex].image_url}
            alt={images[currentIndex].alt_text || `${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover cursor-pointer"
            sizes="(max-width: 1200px) 100vw, 800px"
            onClick={() => openLightbox(currentIndex)}
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Previous image"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Next image"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/60 rounded-full text-white text-xs sm:text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* View All Button */}
          <button
            onClick={() => openLightbox(currentIndex)}
            className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 rounded-lg text-xs sm:text-sm font-medium text-secondary-700 hover:bg-white transition-colors shadow-lg"
          >
            View All
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                  index === currentIndex
                    ? 'ring-2 ring-primary-600'
                    : 'ring-1 ring-secondary-200 hover:ring-secondary-300'
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        size="full"
      >
        <div className="relative bg-black h-full flex flex-col">
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Close lightbox"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Main Image */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4">
            <Image
              src={images[lightboxIndex].image_url}
              alt={images[lightboxIndex].alt_text || `${title} - Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={lightboxNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Next image"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex justify-start sm:justify-center gap-2 p-3 sm:p-4 bg-black/80 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setLightboxIndex(index)}
                className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden ${
                  index === lightboxIndex
                    ? 'ring-2 ring-white'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/60 rounded-full text-white text-xs sm:text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      </Modal>
    </>
  );
}
