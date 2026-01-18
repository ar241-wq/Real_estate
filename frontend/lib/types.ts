// Property types
export type PropertyStatus = 'BUY' | 'RENT' | 'COMMERCIAL' | 'DEVELOPMENT';

export interface PropertyImage {
  id: number;
  image: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  width: number | null;
  height: number | null;
}

export interface PropertyListItem {
  id: number;
  title: string;
  slug: string;
  status: PropertyStatus;
  status_display: string;
  price: string;
  currency: string;
  location_text: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: string;
  featured: boolean;
  cover_image: string | null;
  created_at: string;
}

export interface PropertyDetail {
  id: number;
  title: string;
  slug: string;
  status: PropertyStatus;
  status_display: string;
  price: string;
  currency: string;
  location_text: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: string;
  description: string;
  latitude: string | null;
  longitude: string | null;
  featured: boolean;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  agent_photo_url: string | null;
  images: PropertyImage[];
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  title: string;
  status: PropertyStatus;
  price: string;
  currency: string;
  location_text: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: string;
  description: string;
  latitude?: string;
  longitude?: string;
  featured: boolean;
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
}

// Message types
export interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageCreateData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

// Pagination types
export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filter types
export interface PropertyFilters {
  status?: PropertyStatus;
  q?: string;
  location?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
  min_size?: string;
  max_size?: string;
  featured?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Chat types
export interface ChatMessage {
  id: number;
  content: string;
  is_from_visitor: boolean;
  is_read: boolean;
  created_at: string;
}

export interface ConversationLastMessage {
  content: string;
  is_from_visitor: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  session_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  is_active: boolean;
  has_unread: boolean;
  unread_count?: number;
  last_message?: ConversationLastMessage;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface StartConversationData {
  session_id: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  message: string;
}

export interface SendChatMessageData {
  session_id: string;
  content: string;
}

// Saved properties types
export interface SavedProperty {
  id: number;
  slug: string;
  title: string;
  price: string;
  currency: string;
  status: PropertyStatus;
  status_display: string;
  location_text: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: string;
  cover_image: string | null;
  savedAt: string;
}
