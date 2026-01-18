'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminProperty,
  updateAdminProperty,
  getPropertyImages,
  uploadPropertyImage,
  deletePropertyImage,
  reorderPropertyImages,
} from '@/lib/api';
import { PropertyDetail, PropertyFormData, PropertyImage, PropertyStatus } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import ImageUploader from './ImageUploader';

interface PropertyFormProps {
  property?: PropertyDetail;
  isEdit?: boolean;
}

const statusOptions = [
  { value: 'BUY', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'DEVELOPMENT', label: 'New Development' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export default function PropertyForm({ property, isEdit }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: property?.title || '',
    status: (property?.status as PropertyStatus) || 'BUY',
    price: property?.price || '',
    currency: property?.currency || 'USD',
    location_text: property?.location_text || '',
    address: property?.address || '',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    size_sqm: property?.size_sqm || '',
    description: property?.description || '',
    latitude: property?.latitude || '',
    longitude: property?.longitude || '',
    featured: property?.featured || false,
    agent_name: property?.agent_name || '',
    agent_phone: property?.agent_phone || '',
    agent_email: property?.agent_email || '',
  });

  useEffect(() => {
    if (isEdit && property) {
      loadImages();
    }
  }, [isEdit, property]);

  const loadImages = async () => {
    if (!property) return;
    setIsLoadingImages(true);
    try {
      const imgs = await getPropertyImages(property.id);
      setImages(Array.isArray(imgs) ? imgs : []);
    } catch (err) {
      console.error('Failed to load images:', err);
      setImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        ...formData,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
      };

      if (isEdit && property) {
        await updateAdminProperty(property.id, data);
      } else {
        await createAdminProperty(data);
      }

      router.push('/admin/dashboard/properties');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save property. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!property) return;

    try {
      const newImage = await uploadPropertyImage(property.id, file, '');
      setImages((prev) => [...(Array.isArray(prev) ? prev : []), newImage]);
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw err;
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (!property) return;

    try {
      await deletePropertyImage(property.id, imageId);
      setImages((prev) => (Array.isArray(prev) ? prev : []).filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  const handleImageReorder = async (newOrder: number[]) => {
    if (!property) return;

    try {
      await reorderPropertyImages(property.id, newOrder);
      // Refresh images to get updated order
      loadImages();
    } catch (err) {
      console.error('Failed to reorder images:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-4 sm:mb-6">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Modern Downtown Penthouse"
            />
          </div>

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
            <div className="w-full sm:w-32">
              <Select
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                options={currencyOptions}
              />
            </div>
          </div>

          <Input
            label="Location"
            name="location_text"
            value={formData.location_text}
            onChange={handleChange}
            required
            placeholder="e.g., Downtown, New York"
          />

          <Input
            label="Full Address (optional)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g., 123 Fifth Avenue, New York, NY"
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-4 sm:mb-6">
          Property Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label="Bedrooms"
            name="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={handleChange}
            required
            min={0}
          />

          <Input
            label="Bathrooms"
            name="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={handleChange}
            required
            min={0}
          />

          <Input
            label="Size (sqm)"
            name="size_sqm"
            type="number"
            value={formData.size_sqm}
            onChange={handleChange}
            required
            placeholder="0"
          />
        </div>

        <div className="mt-4 sm:mt-6">
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Describe the property..."
          />
        </div>

        <div className="mt-4 sm:mt-6 flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
          <label
            htmlFor="featured"
            className="ml-2 text-sm font-medium text-secondary-700"
          >
            Featured property (shown on homepage)
          </label>
        </div>
      </div>

      {/* Location Coordinates */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-4 sm:mb-6">
          Location Coordinates (optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude || ''}
            onChange={handleChange}
            placeholder="e.g., 40.7128"
          />

          <Input
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude || ''}
            onChange={handleChange}
            placeholder="e.g., -74.0060"
          />
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-4 sm:mb-6">
          Agent Information (optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label="Agent Name"
            name="agent_name"
            value={formData.agent_name}
            onChange={handleChange}
            placeholder="e.g., John Smith"
          />

          <Input
            label="Agent Phone"
            name="agent_phone"
            type="tel"
            value={formData.agent_phone}
            onChange={handleChange}
            placeholder="e.g., +1 (555) 123-4567"
          />

          <Input
            label="Agent Email"
            name="agent_email"
            type="email"
            value={formData.agent_email}
            onChange={handleChange}
            placeholder="e.g., agent@example.com"
          />
        </div>
      </div>

      {/* Images (only for edit mode) */}
      {isEdit && property && (
        <div className="bg-white rounded-xl border border-secondary-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-4 sm:mb-6">
            Property Images
          </h3>
          <ImageUploader
            images={images}
            isLoading={isLoadingImages}
            onUpload={handleImageUpload}
            onDelete={handleImageDelete}
            onReorder={handleImageReorder}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:space-x-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto justify-center"
          onClick={() => router.push('/admin/dashboard/properties')}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto justify-center">
          {isEdit ? 'Save Changes' : 'Create Property'}
        </Button>
      </div>

      {!isEdit && (
        <p className="text-xs sm:text-sm text-secondary-500 text-center">
          You can add images after creating the property.
        </p>
      )}
    </form>
  );
}
