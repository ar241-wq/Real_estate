// Property types
export type PropertyStatus = 'BUY' | 'RENT' | 'COMMERCIAL' | 'DEVELOPMENT';
export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';

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
  listing_status: ListingStatus;
  listing_status_display: string;
  price: string;
  currency: string;
  location_text: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: string;
  featured: boolean;
  cover_image: string | null;
  views_count: number;
  leads_count: number;
  scheduled_publish_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyDetail {
  id: number;
  title: string;
  slug: string;
  status: PropertyStatus;
  status_display: string;
  listing_status: ListingStatus;
  listing_status_display: string;
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
  map_embed: string;
  featured: boolean;
  views_count: number;
  leads_count: number;
  scheduled_publish_at: string | null;
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
  listing_status?: ListingStatus;
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
  map_embed?: string;
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
  listing_status?: ListingStatus;
  q?: string;
  search?: string;
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

// Buyer Search types
export type BuyerSearchStatus = 'ACTIVE' | 'PAUSED' | 'FULFILLED';
export type BuyerPropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'COMMERCIAL' | '';

export interface BuyerSearch {
  id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  contact: string;
  bedrooms_min: number;
  bedrooms_max: number | null;
  bedrooms_range: string;
  budget_min: string | null;
  budget_max: string | null;
  budget_range: string;
  currency: string;
  location_city: string;
  location_area: string;
  location: string;
  property_type: BuyerPropertyType;
  property_type_display: string;
  parking_required: boolean;
  balcony_required: boolean;
  furnished_required: boolean;
  notes: string;
  status: BuyerSearchStatus;
  status_display: string;
  matches_count: number;
  created_at: string;
  updated_at: string;
}

export interface BuyerSearchFormData {
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  bedrooms_min: number;
  bedrooms_max?: number | null;
  budget_min?: string | null;
  budget_max?: string | null;
  currency: string;
  location_city?: string;
  location_area?: string;
  property_type?: BuyerPropertyType;
  parking_required: boolean;
  balcony_required: boolean;
  furnished_required: boolean;
  notes?: string;
  status?: BuyerSearchStatus;
}

export interface BuyerSearchFilters {
  search?: string;
  status?: BuyerSearchStatus;
  location?: string;
  ordering?: string;
}

// Notification types
export type NotificationType = 'NEW_CHAT' | 'NEW_LEAD' | 'PROPERTY_INQUIRY' | 'AGENT_RESPONSE_DELAY';
export type NotificationPriority = 'NORMAL' | 'HIGH';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  notification_type_display: string;
  priority: NotificationPriority;
  priority_display: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string;
  time_ago: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationUnreadCount {
  unread_count: number;
  high_priority_count: number;
}

export interface NotificationFilters {
  is_read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}
