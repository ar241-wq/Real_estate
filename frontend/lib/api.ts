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
  return text ? JSON.parse(text) : null;
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
  return fetchAPI<PropertyDetail>(`/api/properties/${slug}/`);
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
  ordering: string = '-created_at'
): Promise<PaginatedResponse<PropertyListItem>> {
  return fetchAPI<PaginatedResponse<PropertyListItem>>(
    `/api/admin/properties/?ordering=${ordering}`
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
