"""
Views for the Real Estate API.
"""

from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, F
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from dateutil import parser as date_parser

from .models import Property, PropertyImage, Message, Conversation, ChatMessage, BuyerSearch, Notification
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
    BuyerSearchListSerializer,
    BuyerSearchDetailSerializer,
    BuyerSearchCreateUpdateSerializer,
    NotificationListSerializer,
    NotificationUpdateSerializer,
)
from .permissions import IsAdminOrStaff
from .throttling import MessageCreateThrottle
from .search_utils import build_location_filter, build_search_filter


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
        # Only show PUBLISHED properties to public
        queryset = Property.objects.filter(listing_status=Property.ListingStatus.PUBLISHED)
        params = self.request.query_params

        # Status filter (BUY, RENT, etc.)
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        # Search query (title or location with fuzzy matching)
        search_query = params.get('q')
        if search_query:
            queryset = queryset.filter(build_search_filter(search_query))

        # Location filter (with fuzzy matching)
        location = params.get('location')
        if location:
            queryset = queryset.filter(build_location_filter(location))

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

    def get_queryset(self):
        # Only show PUBLISHED properties to public
        return Property.objects.filter(listing_status=Property.ListingStatus.PUBLISHED)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views count
        Property.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


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
        params = self.request.query_params

        # Filter by listing_status
        listing_status = params.get('listing_status')
        if listing_status:
            queryset = queryset.filter(listing_status=listing_status.upper())

        # Search filter
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(location_text__icontains=search)
            )

        ordering = params.get('ordering', '-created_at')
        valid_orderings = ['price', '-price', 'created_at', '-created_at', 'title', '-title', 'updated_at', '-updated_at']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        return queryset

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a copy of the property as Draft."""
        original = self.get_object()

        # Create a new property with the same data
        new_property = Property.objects.create(
            title=f"{original.title} (Copy)",
            status=original.status,
            price=original.price,
            currency=original.currency,
            location_text=original.location_text,
            address=original.address,
            bedrooms=original.bedrooms,
            bathrooms=original.bathrooms,
            size_sqm=original.size_sqm,
            description=original.description,
            latitude=original.latitude,
            longitude=original.longitude,
            map_embed=original.map_embed,
            featured=False,
            listing_status=Property.ListingStatus.DRAFT,
            agent_name=original.agent_name,
            agent_phone=original.agent_phone,
            agent_email=original.agent_email,
        )

        # Copy images
        for image in original.images.all():
            PropertyImage.objects.create(
                property=new_property,
                image=image.image,
                alt_text=image.alt_text,
                sort_order=image.sort_order,
            )

        serializer = PropertyDetailSerializer(new_property, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle the featured status of a property."""
        property_obj = self.get_object()
        property_obj.featured = not property_obj.featured
        property_obj.save()
        return Response({
            'id': property_obj.id,
            'featured': property_obj.featured,
            'message': 'Featured' if property_obj.featured else 'Unfeatured'
        })

    @action(detail=True, methods=['post'])
    def mark_sold(self, request, pk=None):
        """Mark a property as SOLD."""
        property_obj = self.get_object()
        property_obj.listing_status = Property.ListingStatus.SOLD
        property_obj.save()
        return Response({
            'id': property_obj.id,
            'listing_status': property_obj.listing_status,
            'listing_status_display': property_obj.get_listing_status_display(),
            'message': 'Property marked as sold'
        })

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a property."""
        property_obj = self.get_object()
        property_obj.listing_status = Property.ListingStatus.ARCHIVED
        property_obj.save()
        return Response({
            'id': property_obj.id,
            'listing_status': property_obj.listing_status,
            'listing_status_display': property_obj.get_listing_status_display(),
            'message': 'Property archived'
        })

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a property."""
        property_obj = self.get_object()
        property_obj.listing_status = Property.ListingStatus.PUBLISHED
        property_obj.scheduled_publish_at = None
        property_obj.save()
        return Response({
            'id': property_obj.id,
            'listing_status': property_obj.listing_status,
            'listing_status_display': property_obj.get_listing_status_display(),
            'message': 'Property published'
        })

    @action(detail=True, methods=['post'])
    def schedule_publish(self, request, pk=None):
        """Schedule a property for future publishing."""
        property_obj = self.get_object()
        publish_at = request.data.get('publish_at')

        if not publish_at:
            return Response(
                {'error': 'publish_at is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            scheduled_time = date_parser.parse(publish_at)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid date format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        property_obj.scheduled_publish_at = scheduled_time
        property_obj.save()

        return Response({
            'id': property_obj.id,
            'scheduled_publish_at': property_obj.scheduled_publish_at,
            'message': f'Property scheduled for publishing at {scheduled_time}'
        })

    @action(detail=True, methods=['post'])
    def update_listing_status(self, request, pk=None):
        """Update the listing status of a property."""
        property_obj = self.get_object()
        new_status = request.data.get('listing_status')

        valid_statuses = [choice[0] for choice in Property.ListingStatus.choices]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        property_obj.listing_status = new_status
        if new_status == Property.ListingStatus.PUBLISHED:
            property_obj.scheduled_publish_at = None
        property_obj.save()

        return Response({
            'id': property_obj.id,
            'listing_status': property_obj.listing_status,
            'listing_status_display': property_obj.get_listing_status_display(),
            'message': f'Status updated to {property_obj.get_listing_status_display()}'
        })


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


# =============================================================================
# Admin Buyer Search Views
# =============================================================================

class AdminBuyerSearchViewSet(viewsets.ModelViewSet):
    """Admin management of buyer searches / saved preferences."""

    queryset = BuyerSearch.objects.all()
    permission_classes = [IsAdminOrStaff]

    def get_serializer_class(self):
        if self.action == 'list':
            return BuyerSearchListSerializer
        elif self.action == 'retrieve':
            return BuyerSearchDetailSerializer
        return BuyerSearchCreateUpdateSerializer

    def get_queryset(self):
        queryset = BuyerSearch.objects.all()
        params = self.request.query_params

        # Search by buyer name or contact
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(buyer_name__icontains=search) |
                Q(buyer_email__icontains=search) |
                Q(buyer_phone__icontains=search)
            )

        # Filter by status
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        # Filter by location
        location = params.get('location')
        if location:
            queryset = queryset.filter(
                Q(location_city__icontains=location) |
                Q(location_area__icontains=location)
            )

        # Ordering
        ordering = params.get('ordering', '-created_at')
        valid_orderings = ['created_at', '-created_at', 'buyer_name', '-buyer_name', 'updated_at', '-updated_at']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)

        return queryset

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a buyer search."""
        buyer_search = self.get_object()
        buyer_search.status = BuyerSearch.SearchStatus.PAUSED
        buyer_search.save()
        return Response({
            'id': buyer_search.id,
            'status': buyer_search.status,
            'status_display': buyer_search.get_status_display(),
            'message': 'Search paused'
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a buyer search."""
        buyer_search = self.get_object()
        buyer_search.status = BuyerSearch.SearchStatus.ACTIVE
        buyer_search.save()
        return Response({
            'id': buyer_search.id,
            'status': buyer_search.status,
            'status_display': buyer_search.get_status_display(),
            'message': 'Search activated'
        })

    @action(detail=True, methods=['post'])
    def fulfill(self, request, pk=None):
        """Mark a buyer search as fulfilled."""
        buyer_search = self.get_object()
        buyer_search.status = BuyerSearch.SearchStatus.FULFILLED
        buyer_search.save()
        return Response({
            'id': buyer_search.id,
            'status': buyer_search.status,
            'status_display': buyer_search.get_status_display(),
            'message': 'Search marked as fulfilled'
        })

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """Get matching properties for this buyer search."""
        buyer_search = self.get_object()
        queryset = Property.objects.filter(listing_status=Property.ListingStatus.PUBLISHED)

        # Apply filters based on buyer preferences
        if buyer_search.bedrooms_min:
            queryset = queryset.filter(bedrooms__gte=buyer_search.bedrooms_min)
        if buyer_search.bedrooms_max:
            queryset = queryset.filter(bedrooms__lte=buyer_search.bedrooms_max)
        if buyer_search.budget_min:
            queryset = queryset.filter(price__gte=buyer_search.budget_min)
        if buyer_search.budget_max:
            queryset = queryset.filter(price__lte=buyer_search.budget_max)
        if buyer_search.location_city:
            queryset = queryset.filter(location_text__icontains=buyer_search.location_city)

        serializer = PropertyListSerializer(queryset, many=True, context={'request': request})
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })


# =============================================================================
# Admin Notification Views
# =============================================================================

class AdminNotificationViewSet(viewsets.ModelViewSet):
    """Admin management of notifications."""

    queryset = Notification.objects.all()
    permission_classes = [IsAdminOrStaff]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return NotificationUpdateSerializer
        return NotificationListSerializer

    def get_queryset(self):
        queryset = Notification.objects.all()
        params = self.request.query_params

        # Filter by read status
        is_read = params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_read=is_read_bool)

        # Filter by notification type
        notification_type = params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type.upper())

        # Filter by priority
        priority = params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority.upper())

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read (excludes HIGH priority by default)."""
        include_high_priority = request.data.get('include_high_priority', False)
        queryset = Notification.objects.filter(is_read=False)

        if not include_high_priority:
            queryset = queryset.exclude(priority=Notification.Priority.HIGH)

        count = queryset.update(is_read=True)
        return Response({
            'message': f'{count} notifications marked as read',
            'count': count
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        total_unread = Notification.objects.filter(is_read=False).count()
        high_priority_count = Notification.objects.filter(
            is_read=False,
            priority=Notification.Priority.HIGH
        ).count()

        return Response({
            'unread_count': total_unread,
            'high_priority_count': high_priority_count
        })
