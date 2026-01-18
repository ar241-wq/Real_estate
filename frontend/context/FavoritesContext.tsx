'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { SavedProperty, PropertyListItem, PropertyDetail } from '@/lib/types';
import {
  getSavedProperties,
  isPropertySaved as checkPropertySaved,
  savePropertyFromList,
  savePropertyFromDetail,
  removeProperty,
  clearAllSaved,
} from '@/lib/favorites';

interface FavoritesContextType {
  savedProperties: SavedProperty[];
  savedCount: number;
  isLoaded: boolean;
  isPropertySaved: (id: number) => boolean;
  toggleSaveFromList: (property: PropertyListItem) => void;
  toggleSaveFromDetail: (property: PropertyDetail) => void;
  unsaveProperty: (id: number) => void;
  clearAll: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved properties from localStorage on mount
  useEffect(() => {
    setSavedProperties(getSavedProperties());
    setIsLoaded(true);
  }, []);

  const isPropertySaved = useCallback(
    (id: number) => {
      return savedProperties.some((p) => p.id === id);
    },
    [savedProperties]
  );

  const toggleSaveFromList = useCallback((property: PropertyListItem) => {
    if (checkPropertySaved(property.id)) {
      setSavedProperties(removeProperty(property.id));
    } else {
      setSavedProperties(savePropertyFromList(property));
    }
  }, []);

  const toggleSaveFromDetail = useCallback((property: PropertyDetail) => {
    if (checkPropertySaved(property.id)) {
      setSavedProperties(removeProperty(property.id));
    } else {
      setSavedProperties(savePropertyFromDetail(property));
    }
  }, []);

  const unsaveProperty = useCallback((id: number) => {
    setSavedProperties(removeProperty(id));
  }, []);

  const clearAll = useCallback(() => {
    setSavedProperties(clearAllSaved());
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        savedProperties,
        savedCount: savedProperties.length,
        isLoaded,
        isPropertySaved,
        toggleSaveFromList,
        toggleSaveFromDetail,
        unsaveProperty,
        clearAll,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
