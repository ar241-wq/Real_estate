import { SavedProperty, PropertyListItem, PropertyDetail } from './types';

const STORAGE_KEY = 'savedProperties';

/**
 * Get all saved properties from localStorage
 */
export function getSavedProperties(): SavedProperty[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a property is saved by its ID
 */
export function isPropertySaved(id: number): boolean {
  const saved = getSavedProperties();
  return saved.some((p) => p.id === id);
}

/**
 * Save a property from a PropertyListItem (PropertyCard)
 */
export function savePropertyFromList(property: PropertyListItem): SavedProperty[] {
  const saved = getSavedProperties();

  // Don't save duplicates
  if (saved.some((p) => p.id === property.id)) {
    return saved;
  }

  const savedProperty: SavedProperty = {
    id: property.id,
    slug: property.slug,
    title: property.title,
    price: property.price,
    currency: property.currency,
    status: property.status,
    status_display: property.status_display,
    location_text: property.location_text,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    size_sqm: property.size_sqm,
    cover_image: property.cover_image,
    savedAt: new Date().toISOString(),
  };

  const updated = [...saved, savedProperty];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Save a property from a PropertyDetail (detail page)
 */
export function savePropertyFromDetail(property: PropertyDetail): SavedProperty[] {
  const saved = getSavedProperties();

  // Don't save duplicates
  if (saved.some((p) => p.id === property.id)) {
    return saved;
  }

  // Get cover image from the first image if available
  const coverImage = property.images.length > 0 ? property.images[0].image_url : null;

  const savedProperty: SavedProperty = {
    id: property.id,
    slug: property.slug,
    title: property.title,
    price: property.price,
    currency: property.currency,
    status: property.status,
    status_display: property.status_display,
    location_text: property.location_text,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    size_sqm: property.size_sqm,
    cover_image: coverImage,
    savedAt: new Date().toISOString(),
  };

  const updated = [...saved, savedProperty];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Remove a property from saved by its ID
 */
export function removeProperty(id: number): SavedProperty[] {
  const saved = getSavedProperties();
  const updated = saved.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Clear all saved properties
 */
export function clearAllSaved(): SavedProperty[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
