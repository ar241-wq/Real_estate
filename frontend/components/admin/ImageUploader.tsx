'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

interface ImageUploaderProps {
  images: PropertyImage[];
  isLoading: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: (imageId: number) => Promise<void>;
  onReorder: (newOrder: number[]) => Promise<void>;
}

export default function ImageUploader({
  images,
  isLoading,
  onUpload,
  onDelete,
  onReorder,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Please select only image files');
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setUploadError('Image size must be less than 10MB');
          continue;
        }

        await onUpload(file);
      }
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: number) => {
    setDeletingId(imageId);
    try {
      await onDelete(imageId);
    } finally {
      setDeletingId(null);
    }
  };

  const moveImage = async (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    const newOrder = images.map((img) => img.id);
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];

    await onReorder(newOrder);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-colors ${
          isUploading
            ? 'border-primary-400 bg-primary-50'
            : 'border-secondary-300 hover:border-primary-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          {isUploading ? (
            <>
              <Spinner />
              <p className="mt-2 text-sm text-secondary-600">Uploading...</p>
            </>
          ) : (
            <>
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-secondary-400 mb-3 sm:mb-4"
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
              <p className="text-sm sm:text-base text-secondary-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs sm:text-sm text-secondary-400">
                PNG, JPG, WEBP up to 10MB
              </p>
            </>
          )}
        </label>
      </div>

      {uploadError && (
        <p className="text-sm text-red-600 text-center">{uploadError}</p>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3 sm:mb-4">
            <h4 className="font-medium text-sm sm:text-base text-secondary-900">
              Uploaded Images ({images.length})
            </h4>
            <p className="text-xs sm:text-sm text-secondary-500">
              First image is the cover photo
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative group rounded-xl overflow-hidden ${
                  index === 0 ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Cover Badge */}
                {index === 0 && (
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary-600 text-white text-[10px] sm:text-xs font-medium rounded">
                    Cover
                  </div>
                )}

                {/* Actions Overlay - Always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 bg-black/50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 sm:space-x-2">
                  {/* Move Up */}
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, 'up')}
                      className="p-1.5 sm:p-2 bg-white rounded-full text-secondary-700 hover:bg-secondary-100"
                      title="Move left"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                  )}

                  {/* Move Down */}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, 'down')}
                      className="p-1.5 sm:p-2 bg-white rounded-full text-secondary-700 hover:bg-secondary-100"
                      title="Move right"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    className="p-1.5 sm:p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                    title="Delete"
                  >
                    {deletingId === image.id ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Order Number */}
                <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/60 text-white text-[10px] sm:text-xs rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !isUploading && (
        <p className="text-center text-secondary-500 py-4">
          No images uploaded yet. Add images to showcase this property.
        </p>
      )}
    </div>
  );
}
