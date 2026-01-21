import {
  PropertyListItem,
  PropertyDetail,
  PropertyFormData,
  PropertyImage,
  Message,
  MessageCreateData,
  User,
  PaginatedResponse,
  PropertyFilters,
  Conversation,
  ChatMessage,
  StartConversationData,
  SendChatMessageData,
  ListingStatus,
  BuyerSearch,
  BuyerSearchFormData,
  BuyerSearchFilters,
  BuyerSearchStatus,
  Notification,
  NotificationUnreadCount,
  NotificationFilters,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper function for API requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : (null as T);
}

// Get CSRF token
export async function getCsrfToken(): Promise<string> {
  const response = await fetchAPI<{ csrfToken: string }>('/api/csrf/');
  return response.csrfToken;
}

// =============================================================================
// Public API
// =============================================================================

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PaginatedResponse<PropertyListItem>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const endpoint = `/api/properties/${queryString ? `?${queryString}` : ''}`;

  return fetchAPI<PaginatedResponse<PropertyListItem>>(endpoint);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail> {
  // Disable caching to ensure each page view increments the views count
  return fetchAPI<PropertyDetail>(`/api/properties/${slug}/`, {
    cache: 'no-store',
  });
}

export async function createMessage(data: MessageCreateData): Promise<Message> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<Message>('/api/messages/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Admin Authentication
// =============================================================================

export async function adminLogin(
  username: string,
  password: string
): Promise<{ user: User }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ user: User }>('/api/admin/login/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout(): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI('/api/admin/logout/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function getAdminMe(): Promise<{ user: User }> {
  return fetchAPI<{ user: User }>('/api/admin/me/');
}

// =============================================================================
// Admin Properties
// =============================================================================

export async function getAdminProperties(
  filters: PropertyFilters = {}
): Promise<PaginatedResponse<PropertyListItem>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });

  // Default ordering
  if (!filters.ordering) {
    params.append('ordering', '-created_at');
  }

  const queryString = params.toString();
  return fetchAPI<PaginatedResponse<PropertyListItem>>(
    `/api/admin/properties/${queryString ? `?${queryString}` : ''}`
  );
}

export async function getAdminProperty(id: number): Promise<PropertyDetail> {
  return fetchAPI<PropertyDetail>(`/api/admin/properties/${id}/`);
}

export async function createAdminProperty(
  data: PropertyFormData
): Promise<PropertyDetail> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<PropertyDetail>('/api/admin/properties/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

export async function updateAdminProperty(
  id: number,
  data: Partial<PropertyFormData>
): Promise<PropertyDetail> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<PropertyDetail>(`/api/admin/properties/${id}/`, {
    method: 'PATCH',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteAdminProperty(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/properties/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

// =============================================================================
// Admin Property Actions
// =============================================================================

export async function duplicateProperty(id: number): Promise<PropertyDetail> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<PropertyDetail>(`/api/admin/properties/${id}/duplicate/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function togglePropertyFeatured(
  id: number
): Promise<{ id: number; featured: boolean; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; featured: boolean; message: string }>(
    `/api/admin/properties/${id}/toggle_featured/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function markPropertySold(
  id: number
): Promise<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }>(
    `/api/admin/properties/${id}/mark_sold/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function archiveProperty(
  id: number
): Promise<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }>(
    `/api/admin/properties/${id}/archive/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function publishProperty(
  id: number
): Promise<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }>(
    `/api/admin/properties/${id}/publish/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function schedulePropertyPublish(
  id: number,
  publishAt: string
): Promise<{ id: number; scheduled_publish_at: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; scheduled_publish_at: string; message: string }>(
    `/api/admin/properties/${id}/schedule_publish/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ publish_at: publishAt }),
    }
  );
}

export async function updatePropertyListingStatus(
  id: number,
  listingStatus: ListingStatus
): Promise<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; listing_status: ListingStatus; listing_status_display: string; message: string }>(
    `/api/admin/properties/${id}/update_listing_status/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ listing_status: listingStatus }),
    }
  );
}

// =============================================================================
// Admin Property Images
// =============================================================================

export async function getPropertyImages(
  propertyId: number
): Promise<PropertyImage[]> {
  return fetchAPI<PropertyImage[]>(`/api/admin/properties/${propertyId}/images/`);
}

export async function uploadPropertyImage(
  propertyId: number,
  file: File,
  altText: string = ''
): Promise<PropertyImage> {
  const csrfToken = await getCsrfToken();

  const formData = new FormData();
  formData.append('image', file);
  formData.append('alt_text', altText);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/properties/${propertyId}/images/`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function deletePropertyImage(
  propertyId: number,
  imageId: number
): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/properties/${propertyId}/images/${imageId}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function reorderPropertyImages(
  propertyId: number,
  order: number[]
): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/properties/${propertyId}/images/reorder/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ order }),
  });
}

// =============================================================================
// Admin Messages
// =============================================================================

export async function getAdminMessages(
  isRead?: boolean
): Promise<PaginatedResponse<Message>> {
  let endpoint = '/api/admin/messages/';
  if (isRead !== undefined) {
    endpoint += `?is_read=${isRead}`;
  }
  return fetchAPI<PaginatedResponse<Message>>(endpoint);
}

export async function getAdminMessage(id: number): Promise<Message> {
  return fetchAPI<Message>(`/api/admin/messages/${id}/`);
}

export async function markMessageRead(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/messages/${id}/mark_read/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function markMessageUnread(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/messages/${id}/mark_unread/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function deleteAdminMessage(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/messages/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

// =============================================================================
// Public Chat API
// =============================================================================

export async function startConversation(data: StartConversationData): Promise<Conversation> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<Conversation>('/api/chat/start/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

export async function sendChatMessage(data: SendChatMessageData): Promise<ChatMessage> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<ChatMessage>('/api/chat/send/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

export async function getConversation(sessionId: string): Promise<Conversation> {
  return fetchAPI<Conversation>(`/api/chat/${sessionId}/`);
}

// =============================================================================
// Admin Conversations API
// =============================================================================

export async function getAdminConversations(
  hasUnread?: boolean
): Promise<PaginatedResponse<Conversation>> {
  let endpoint = '/api/admin/conversations/';
  if (hasUnread !== undefined) {
    endpoint += `?has_unread=${hasUnread}`;
  }
  return fetchAPI<PaginatedResponse<Conversation>>(endpoint);
}

export async function getAdminConversation(id: number): Promise<Conversation> {
  return fetchAPI<Conversation>(`/api/admin/conversations/${id}/`);
}

export async function sendAdminReply(conversationId: number, content: string): Promise<ChatMessage> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<ChatMessage>(`/api/admin/conversations/${conversationId}/reply/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ content }),
  });
}

export async function deleteAdminConversation(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/conversations/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function getUnreadConversationsCount(): Promise<{ unread_count: number }> {
  return fetchAPI<{ unread_count: number }>('/api/admin/conversations/unread_count/');
}

// =============================================================================
// Admin Buyer Searches API
// =============================================================================

export async function getBuyerSearches(
  filters: BuyerSearchFilters = {}
): Promise<PaginatedResponse<BuyerSearch>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, String(value));
    }
  });

  if (!filters.ordering) {
    params.append('ordering', '-created_at');
  }

  const queryString = params.toString();
  return fetchAPI<PaginatedResponse<BuyerSearch>>(
    `/api/admin/buyer-searches/${queryString ? `?${queryString}` : ''}`
  );
}

export async function getBuyerSearch(id: number): Promise<BuyerSearch> {
  return fetchAPI<BuyerSearch>(`/api/admin/buyer-searches/${id}/`);
}

export async function createBuyerSearch(data: BuyerSearchFormData): Promise<BuyerSearch> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<BuyerSearch>('/api/admin/buyer-searches/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

export async function updateBuyerSearch(
  id: number,
  data: Partial<BuyerSearchFormData>
): Promise<BuyerSearch> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<BuyerSearch>(`/api/admin/buyer-searches/${id}/`, {
    method: 'PATCH',
    headers: {
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteBuyerSearch(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/buyer-searches/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function pauseBuyerSearch(
  id: number
): Promise<{ id: number; status: BuyerSearchStatus; status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; status: BuyerSearchStatus; status_display: string; message: string }>(
    `/api/admin/buyer-searches/${id}/pause/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function activateBuyerSearch(
  id: number
): Promise<{ id: number; status: BuyerSearchStatus; status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; status: BuyerSearchStatus; status_display: string; message: string }>(
    `/api/admin/buyer-searches/${id}/activate/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function fulfillBuyerSearch(
  id: number
): Promise<{ id: number; status: BuyerSearchStatus; status_display: string; message: string }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ id: number; status: BuyerSearchStatus; status_display: string; message: string }>(
    `/api/admin/buyer-searches/${id}/fulfill/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );
}

export async function getBuyerSearchMatches(
  id: number
): Promise<{ count: number; results: PropertyListItem[] }> {
  return fetchAPI<{ count: number; results: PropertyListItem[] }>(
    `/api/admin/buyer-searches/${id}/matches/`
  );
}

// =============================================================================
// Admin Notifications API
// =============================================================================

export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<PaginatedResponse<Notification>> {
  const params = new URLSearchParams();

  if (filters.is_read !== undefined) {
    params.append('is_read', String(filters.is_read));
  }
  if (filters.type) {
    params.append('type', filters.type);
  }
  if (filters.priority) {
    params.append('priority', filters.priority);
  }

  const queryString = params.toString();
  return fetchAPI<PaginatedResponse<Notification>>(
    `/api/admin/notifications/${queryString ? `?${queryString}` : ''}`
  );
}

export async function getNotificationUnreadCount(): Promise<NotificationUnreadCount> {
  return fetchAPI<NotificationUnreadCount>('/api/admin/notifications/unread_count/');
}

export async function markNotificationRead(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/notifications/${id}/mark_read/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}

export async function markAllNotificationsRead(
  includeHighPriority: boolean = false
): Promise<{ message: string; count: number }> {
  const csrfToken = await getCsrfToken();

  return fetchAPI<{ message: string; count: number }>(
    '/api/admin/notifications/mark_all_read/',
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ include_high_priority: includeHighPriority }),
    }
  );
}

export async function deleteNotification(id: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetchAPI(`/api/admin/notifications/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });
}
