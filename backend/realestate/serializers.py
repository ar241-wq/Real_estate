"""
Serializers for the Real Estate API.
"""

from django.utils import timezone
from rest_framework import serializers
from .models import Property, PropertyImage, Message, Conversation, ChatMessage, BuyerSearch, Notification


class PropertyImageSerializer(serializers.ModelSerializer):
    """Serializer for property images."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'sort_order', 'width', 'height']
        read_only_fields = ['id', 'width', 'height', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class PropertyListSerializer(serializers.ModelSerializer):
    """Serializer for property listings (minimal fields)."""

    cover_image = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    listing_status_display = serializers.CharField(source='get_listing_status_display', read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'status', 'status_display',
            'listing_status', 'listing_status_display',
            'price', 'currency', 'location_text', 'bedrooms',
            'bathrooms', 'size_sqm', 'featured', 'cover_image',
            'views_count', 'leads_count', 'scheduled_publish_at',
            'created_at', 'updated_at'
        ]

    def get_cover_image(self, obj):
        first_image = obj.images.order_by('sort_order').first()
        if first_image and first_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Serializer for property detail view (all fields + images)."""

    images = PropertyImageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    listing_status_display = serializers.CharField(source='get_listing_status_display', read_only=True)
    agent_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'status', 'status_display',
            'listing_status', 'listing_status_display',
            'price', 'currency', 'location_text', 'address',
            'bedrooms', 'bathrooms', 'size_sqm', 'description',
            'latitude', 'longitude', 'map_embed', 'featured',
            'views_count', 'leads_count', 'scheduled_publish_at',
            'agent_name', 'agent_phone', 'agent_email', 'agent_photo_url',
            'images', 'created_at', 'updated_at'
        ]

    def get_agent_photo_url(self, obj):
        if obj.agent_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.agent_photo.url)
            return obj.agent_photo.url
        return None


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating properties (admin)."""

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'status', 'listing_status',
            'price', 'currency', 'location_text', 'address',
            'bedrooms', 'bathrooms', 'size_sqm', 'description',
            'latitude', 'longitude', 'map_embed', 'featured',
            'views_count', 'leads_count', 'scheduled_publish_at',
            'agent_name', 'agent_phone', 'agent_email', 'agent_photo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages (public)."""

    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'phone', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        # Require at least email or phone
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError(
                'Please provide either an email or phone number.'
            )
        return data


class MessageListSerializer(serializers.ModelSerializer):
    """Serializer for listing messages (admin)."""

    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'phone', 'message', 'is_read', 'created_at']


class MessageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating message read status (admin)."""

    class Meta:
        model = Message
        fields = ['id', 'is_read']
        read_only_fields = ['id']


# =============================================================================
# Chat Serializers
# =============================================================================

class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""

    class Meta:
        model = ChatMessage
        fields = ['id', 'content', 'is_from_visitor', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer for conversation list view."""

    last_message = serializers.SerializerMethodField()
    unread_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'session_id', 'visitor_name', 'visitor_email', 'visitor_phone',
            'is_active', 'has_unread', 'unread_count', 'last_message',
            'created_at', 'updated_at'
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content[:100],
                'is_from_visitor': last_msg.is_from_visitor,
                'created_at': last_msg.created_at,
            }
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Serializer for conversation detail with all messages."""

    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'session_id', 'visitor_name', 'visitor_email', 'visitor_phone',
            'is_active', 'has_unread', 'messages', 'created_at', 'updated_at'
        ]


class ConversationCreateSerializer(serializers.Serializer):
    """Serializer for starting a new conversation (public)."""

    session_id = serializers.CharField(max_length=100)
    visitor_name = serializers.CharField(max_length=255, required=False, default='Visitor')
    visitor_email = serializers.EmailField(required=False, allow_blank=True)
    visitor_phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    message = serializers.CharField()


class ChatMessageCreateSerializer(serializers.Serializer):
    """Serializer for sending a chat message (public)."""

    session_id = serializers.CharField(max_length=100)
    content = serializers.CharField()


class AdminReplySerializer(serializers.Serializer):
    """Serializer for admin reply to a conversation."""

    content = serializers.CharField()


# =============================================================================
# Buyer Search Serializers
# =============================================================================

class BuyerSearchListSerializer(serializers.ModelSerializer):
    """Serializer for buyer search list view."""

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    matches_count = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()
    bedrooms_range = serializers.SerializerMethodField()
    budget_range = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = BuyerSearch
        fields = [
            'id', 'buyer_name', 'buyer_email', 'buyer_phone', 'contact',
            'bedrooms_min', 'bedrooms_max', 'bedrooms_range',
            'budget_min', 'budget_max', 'budget_range', 'currency',
            'location_city', 'location_area', 'location',
            'property_type', 'property_type_display',
            'parking_required', 'balcony_required', 'furnished_required',
            'notes', 'status', 'status_display', 'matches_count',
            'created_at', 'updated_at'
        ]

    def get_matches_count(self, obj):
        return obj.get_matching_properties_count()

    def get_contact(self, obj):
        return obj.buyer_phone or obj.buyer_email or '-'

    def get_bedrooms_range(self, obj):
        if obj.bedrooms_max:
            return f'{obj.bedrooms_min}-{obj.bedrooms_max}'
        elif obj.bedrooms_min:
            return f'{obj.bedrooms_min}+'
        return 'Any'

    def get_budget_range(self, obj):
        if obj.budget_min and obj.budget_max:
            return f'{int(obj.budget_min):,} - {int(obj.budget_max):,}'
        elif obj.budget_min:
            return f'{int(obj.budget_min):,}+'
        elif obj.budget_max:
            return f'Up to {int(obj.budget_max):,}'
        return 'Any'

    def get_location(self, obj):
        parts = []
        if obj.location_city:
            parts.append(obj.location_city)
        if obj.location_area:
            parts.append(obj.location_area)
        return ', '.join(parts) if parts else 'Any'


class BuyerSearchDetailSerializer(serializers.ModelSerializer):
    """Serializer for buyer search detail view."""

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    matches_count = serializers.SerializerMethodField()

    class Meta:
        model = BuyerSearch
        fields = [
            'id', 'buyer_name', 'buyer_email', 'buyer_phone',
            'bedrooms_min', 'bedrooms_max',
            'budget_min', 'budget_max', 'currency',
            'location_city', 'location_area',
            'property_type', 'property_type_display',
            'parking_required', 'balcony_required', 'furnished_required',
            'notes', 'status', 'status_display', 'matches_count',
            'created_at', 'updated_at'
        ]

    def get_matches_count(self, obj):
        return obj.get_matching_properties_count()


class BuyerSearchCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating buyer searches."""

    class Meta:
        model = BuyerSearch
        fields = [
            'id', 'buyer_name', 'buyer_email', 'buyer_phone',
            'bedrooms_min', 'bedrooms_max',
            'budget_min', 'budget_max', 'currency',
            'location_city', 'location_area',
            'property_type',
            'parking_required', 'balcony_required', 'furnished_required',
            'notes', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# =============================================================================
# Notification Serializers
# =============================================================================

class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer for notification list view."""

    notification_type_display = serializers.CharField(
        source='get_notification_type_display', read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display', read_only=True
    )
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display',
            'priority', 'priority_display', 'title', 'message',
            'is_read', 'action_url', 'time_ago',
            'created_at', 'updated_at'
        ]

    def get_time_ago(self, obj):
        """Return a human-readable time ago string."""
        now = timezone.now()
        diff = now - obj.created_at

        seconds = diff.total_seconds()
        if seconds < 60:
            return 'Just now'
        elif seconds < 3600:
            minutes = int(seconds // 60)
            return f'{minutes}m ago'
        elif seconds < 86400:
            hours = int(seconds // 3600)
            return f'{hours}h ago'
        elif seconds < 604800:
            days = int(seconds // 86400)
            return f'{days}d ago'
        else:
            weeks = int(seconds // 604800)
            return f'{weeks}w ago'


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notification read status."""

    class Meta:
        model = Notification
        fields = ['id', 'is_read']
        read_only_fields = ['id']
