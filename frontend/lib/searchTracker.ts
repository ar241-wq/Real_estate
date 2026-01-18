// Search Tracker - Tracks user search preferences to provide personalized recommendations

const STORAGE_KEY = 'property_search_history';
const MAX_HISTORY_ITEMS = 50;

interface SearchEntry {
  location: string;
  count: number;
  lastSearched: number;
}

interface SearchHistory {
  searches: SearchEntry[];
  updatedAt: number;
}

// Get search history from localStorage
export function getSearchHistory(): SearchHistory {
  if (typeof window === 'undefined') {
    return { searches: [], updatedAt: Date.now() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading search history:', error);
  }

  return { searches: [], updatedAt: Date.now() };
}

// Save search history to localStorage
function saveSearchHistory(history: SearchHistory): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

// Track a location search
export function trackLocationSearch(location: string): void {
  if (!location || location.trim() === '') return;

  const normalizedLocation = location.trim().toLowerCase();
  const history = getSearchHistory();

  // Find existing entry or create new one
  const existingIndex = history.searches.findIndex(
    (s) => s.location.toLowerCase() === normalizedLocation
  );

  if (existingIndex >= 0) {
    // Update existing entry
    history.searches[existingIndex].count += 1;
    history.searches[existingIndex].lastSearched = Date.now();
  } else {
    // Add new entry
    history.searches.push({
      location: location.trim(),
      count: 1,
      lastSearched: Date.now(),
    });
  }

  // Keep only the most recent entries
  if (history.searches.length > MAX_HISTORY_ITEMS) {
    // Sort by last searched and keep the most recent
    history.searches.sort((a, b) => b.lastSearched - a.lastSearched);
    history.searches = history.searches.slice(0, MAX_HISTORY_ITEMS);
  }

  history.updatedAt = Date.now();
  saveSearchHistory(history);
}

// Get the most searched locations (sorted by count, then recency)
export function getTopSearchedLocations(limit: number = 5): string[] {
  const history = getSearchHistory();

  // Score each location based on count and recency
  const now = Date.now();
  const scored = history.searches.map((s) => {
    // Decay factor: more recent searches get higher weight
    const daysSinceSearch = (now - s.lastSearched) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSinceSearch / 30); // Decay over 30 days

    return {
      location: s.location,
      score: s.count * (0.5 + 0.5 * recencyScore), // Combine count with recency
    };
  });

  // Sort by score and return top locations
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.location);
}

// Get the single most searched location (for primary recommendations)
export function getMostSearchedLocation(): string | null {
  const top = getTopSearchedLocations(1);
  return top.length > 0 ? top[0] : null;
}

// Check if user has any search history
export function hasSearchHistory(): boolean {
  const history = getSearchHistory();
  return history.searches.length > 0;
}

// Clear search history (for privacy/testing)
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
