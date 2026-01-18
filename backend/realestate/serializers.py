"""
Serializers for the Real Estate API.
"""

from rest_framework import serializers
from .models import Property, PropertyImage, Message, Conversation, ChatMessage


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

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'status', 'status_display',
            'price', 'currency', 'location_text', 'bedrooms',
            'bathrooms', 'size_sqm', 'featured', 'cover_image',
            'created_at'
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
    agent_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'status', 'status_display',
            'price', 'currency', 'location_text', 'address',
            'bedrooms', 'bathrooms', 'size_sqm', 'description',
            'latitude', 'longitude', 'featured',
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
            'id', 'title', 'slug', 'status', 'price', 'currency',
            'location_text', 'address', 'bedrooms', 'bathrooms',
            'size_sqm', 'description', 'latitude', 'longitude',
            'featured', 'agent_name', 'agent_phone', 'agent_email',
            'agent_photo', 'created_at', 'updated_at'
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
