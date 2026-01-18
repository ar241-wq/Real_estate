"""
Views for the Real Estate API.
"""

from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.middleware.csrf import get_token
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Property, PropertyImage, Message, Conversation, ChatMessage
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateUpdateSerializer,
    PropertyImageSerializer,
    MessageCreateSerializer,
    MessageListSerializer,
    MessageUpdateSerializer,
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    ChatMessageCreateSerializer,
    ChatMessageSerializer,
    AdminReplySerializer,
)
from .permissions import IsAdminOrStaff
from .throttling import MessageCreateThrottle


# =============================================================================
# Public API Views
# =============================================================================

class PublicPropertyListView(generics.ListAPIView):
    """
    Public endpoint to list properties with filtering and search.

    Query Parameters:
    - status: BUY, RENT, COMMERCIAL, DEVELOPMENT
    - q: Search in title and location_text
    - location: Filter by location_text (contains)
    - min_price: Minimum price
    - max_price: Maximum price
    - bedrooms: Exact number of bedrooms
    - min_size: Minimum size in sqm
    - max_size: Maximum size in sqm
    - featured: true/false
    - ordering: price, -price, created_at, -created_at
    """

    serializer_class = PropertyListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Property.objects.all()
        params = self.request.query_params

        # Status filter
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        # Search query (title or location)
        search_query = params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(location_text__icontains=search_query)
            )

        # Location filter
        location = params.get('location')
        if location:
            queryset = queryset.filter(location_text__icontains=location)

        # Price range
        min_price = params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Bedrooms
        bedrooms = params.get('bedrooms')
        if bedrooms:
            queryset = queryset.filter(bedrooms=bedrooms)

        # Size range
        min_size = params.get('min_size')
        if min_size:
            queryset = queryset.filter(size_sqm__gte=min_size)

        max_size = params.get('max_size')
        if max_size:
            queryset = queryset.filter(size_sqm__lte=max_size)

        # Featured filter
        featured = params.get('featured')
        if featured is not None:
            featured_bool = featured.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(featured=featured_bool)

        # Ordering
        ordering = params.get('ordering', '-created_at')
        valid_orderings = ['price', '-price', 'created_at', '-created_at']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)

        return queryset


class PublicPropertyDetailView(generics.RetrieveAPIView):
    """Public endpoint to get property details by slug."""

    serializer_class = PropertyDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    queryset = Property.objects.all()


class MessageCreateView(generics.CreateAPIView):
    """Public endpoint to create a contact message."""

    serializer_class = MessageCreateSerializer
    permission_classes = [AllowAny]
    throttle_classes = [MessageCreateThrottle]


# =============================================================================
# Admin Authentication Views
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token for the frontend."""
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Authenticate admin user and create session.

    Expects: { "username": "...", "password": "..." }
    Returns: User info on success, error on failure.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not (user.is_staff or user.is_superuser):
        return Response(
            {'error': 'Access denied. Admin privileges required.'},
            status=status.HTTP_403_FORBIDDEN
        )

    login(request, user)

    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    """Log out the current admin user."""
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([IsAdminOrStaff])
def admin_me(request):
    """Get current authenticated admin user info."""
    user = request.user
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
    })


# =============================================================================
# Admin Property Views
# =============================================================================

class AdminPropertyViewSet(viewsets.ModelViewSet):
    """Admin CRUD for properties."""

    queryset = Property.objects.all()
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertyCreateUpdateSerializer

    def get_queryset(self):
        queryset = Property.objects.all()
        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = ['price', '-price', 'created_at', '-created_at', 'title', '-title']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        return queryset


class AdminPropertyImageViewSet(viewsets.ModelViewSet):
    """Admin CRUD for property images."""

    serializer_class = PropertyImageSerializer
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        property_id = self.kwargs.get('property_pk')
        return PropertyImage.objects.filter(property_id=property_id).order_by('sort_order')

    def perform_create(self, serializer):
        property_id = self.kwargs.get('property_pk')
        # Get the next sort order
        last_image = PropertyImage.objects.filter(
            property_id=property_id
        ).order_by('-sort_order').first()
        next_order = (last_image.sort_order + 1) if last_image else 0
        serializer.save(property_id=property_id, sort_order=next_order)

    @action(detail=False, methods=['post'])
    def reorder(self, request, property_pk=None):
        """
        Reorder images.
        Expects: { "order": [id1, id2, id3, ...] }
        """
        order = request.data.get('order', [])
        for index, image_id in enumerate(order):
            PropertyImage.objects.filter(
                id=image_id, property_id=property_pk
            ).update(sort_order=index)
        return Response({'message': 'Images reordered successfully'})


# =============================================================================
# Admin Message Views
# =============================================================================

class AdminMessageViewSet(viewsets.ModelViewSet):
    """Admin management of messages."""

    queryset = Message.objects.all()
    permission_classes = [IsAdminOrStaff]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return MessageUpdateSerializer
        return MessageListSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_read=is_read_bool)
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read."""
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'message': 'Marked as read'})

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """Mark a message as unread."""
        message = self.get_object()
        message.is_read = False
        message.save()
        return Response({'message': 'Marked as unread'})


# =============================================================================
# Public Chat Views
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def start_conversation(request):
    """
    Start a new conversation or get existing one.
    Creates initial message from visitor.
    """
    serializer = ConversationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # Get or create conversation
    conversation, created = Conversation.objects.get_or_create(
        session_id=data['session_id'],
        defaults={
            'visitor_name': data['visitor_name'],
            'visitor_email': data.get('visitor_email', ''),
            'visitor_phone': data.get('visitor_phone', ''),
        }
    )

    # Update visitor info if conversation exists
    if not created:
        conversation.visitor_name = data['visitor_name']
        if data.get('visitor_email'):
            conversation.visitor_email = data['visitor_email']
        if data.get('visitor_phone'):
            conversation.visitor_phone = data['visitor_phone']

    # Create the message
    ChatMessage.objects.create(
        conversation=conversation,
        content=data['message'],
        is_from_visitor=True
    )

    # Update conversation
    conversation.has_unread = True
    conversation.save()

    return Response(ConversationDetailSerializer(conversation).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_chat_message(request):
    """Send a message in an existing conversation (visitor)."""
    serializer = ChatMessageCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        conversation = Conversation.objects.get(session_id=data['session_id'])
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Create message
    message = ChatMessage.objects.create(
        conversation=conversation,
        content=data['content'],
        is_from_visitor=True
    )

    # Update conversation
    conversation.has_unread = True
    conversation.save()

    return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_conversation(request, session_id):
    """Get conversation by session ID (for visitor)."""
    try:
        conversation = Conversation.objects.get(session_id=session_id)
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Mark admin messages as read when visitor views
    conversation.messages.filter(is_from_visitor=False, is_read=False).update(is_read=True)

    return Response(ConversationDetailSerializer(conversation).data)


# =============================================================================
# Admin Chat Views
# =============================================================================

class AdminConversationViewSet(viewsets.ModelViewSet):
    """Admin management of conversations."""

    queryset = Conversation.objects.all()
    permission_classes = [IsAdminOrStaff]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationListSerializer

    def get_queryset(self):
        queryset = Conversation.objects.all()

        # Filter by has_unread
        has_unread = self.request.query_params.get('has_unread')
        if has_unread is not None:
            has_unread_bool = has_unread.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(has_unread=has_unread_bool)

        return queryset.order_by('-updated_at')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Mark visitor messages as read
        instance.messages.filter(is_from_visitor=True, is_read=False).update(is_read=True)
        instance.has_unread = False
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Send a reply message from admin."""
        conversation = self.get_object()
        serializer = AdminReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = ChatMessage.objects.create(
            conversation=conversation,
            content=serializer.validated_data['content'],
            is_from_visitor=False
        )

        conversation.save()  # Update updated_at

        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of conversations with unread messages."""
        count = Conversation.objects.filter(has_unread=True).count()
        return Response({'unread_count': count})
