"""
URL configuration for the Real Estate API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    # Public views
    PublicPropertyListView,
    PublicPropertyDetailView,
    MessageCreateView,
    # Public chat views
    start_conversation,
    send_chat_message,
    get_conversation,
    # Admin auth views
    get_csrf_token,
    admin_login,
    admin_logout,
    admin_me,
    # Admin viewsets
    AdminPropertyViewSet,
    AdminPropertyImageViewSet,
    AdminMessageViewSet,
    AdminConversationViewSet,
    AdminBuyerSearchViewSet,
    AdminNotificationViewSet,
)

# Router for admin viewsets
admin_router = DefaultRouter()
admin_router.register(r'properties', AdminPropertyViewSet, basename='admin-property')
admin_router.register(r'messages', AdminMessageViewSet, basename='admin-message')
admin_router.register(r'conversations', AdminConversationViewSet, basename='admin-conversation')
admin_router.register(r'buyer-searches', AdminBuyerSearchViewSet, basename='admin-buyer-search')
admin_router.register(r'notifications', AdminNotificationViewSet, basename='admin-notification')

urlpatterns = [
    # Public endpoints
    path('properties/', PublicPropertyListView.as_view(), name='property-list'),
    path('properties/<slug:slug>/', PublicPropertyDetailView.as_view(), name='property-detail'),
    path('messages/', MessageCreateView.as_view(), name='message-create'),

    # Public chat endpoints
    path('chat/start/', start_conversation, name='chat-start'),
    path('chat/send/', send_chat_message, name='chat-send'),
    path('chat/<str:session_id>/', get_conversation, name='chat-get'),

    # CSRF token
    path('csrf/', get_csrf_token, name='csrf-token'),

    # Admin authentication
    path('admin/login/', admin_login, name='admin-login'),
    path('admin/logout/', admin_logout, name='admin-logout'),
    path('admin/me/', admin_me, name='admin-me'),

    # Admin CRUD endpoints
    path('admin/', include(admin_router.urls)),

    # Property images (nested under properties)
    path(
        'admin/properties/<int:property_pk>/images/',
        AdminPropertyImageViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='admin-property-images'
    ),
    path(
        'admin/properties/<int:property_pk>/images/<int:pk>/',
        AdminPropertyImageViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='admin-property-image-detail'
    ),
    path(
        'admin/properties/<int:property_pk>/images/reorder/',
        AdminPropertyImageViewSet.as_view({'post': 'reorder'}),
        name='admin-property-images-reorder'
    ),
]
