"""
Models for the Real Estate application.
"""

from django.db import models
from django.utils.text import slugify
from PIL import Image as PILImage


class Property(models.Model):
    """Property listing model."""

    class Status(models.TextChoices):
        BUY = 'BUY', 'For Sale'
        RENT = 'RENT', 'For Rent'
        COMMERCIAL = 'COMMERCIAL', 'Commercial'
        DEVELOPMENT = 'DEVELOPMENT', 'New Development'

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.BUY
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    location_text = models.CharField(max_length=255, help_text='City/Area')
    address = models.CharField(max_length=500, blank=True)
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    size_sqm = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    featured = models.BooleanField(default=False)

    # Agent information
    agent_name = models.CharField(max_length=255, blank=True)
    agent_phone = models.CharField(max_length=50, blank=True)
    agent_email = models.EmailField(blank=True)
    agent_photo = models.ImageField(
        upload_to='agents/', blank=True, null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        """Generate a unique slug from title."""
        base_slug = slugify(self.title)
        slug = base_slug
        counter = 1
        while Property.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        return slug

    @property
    def cover_image(self):
        """Get the first image by sort_order."""
        first_image = self.images.order_by('sort_order').first()
        return first_image.image.url if first_image else None


class PropertyImage(models.Model):
    """Image associated with a property."""

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='properties/')
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f'{self.property.title} - Image {self.sort_order}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Extract image dimensions
        if self.image and (not self.width or not self.height):
            try:
                with PILImage.open(self.image.path) as img:
                    self.width = img.width
                    self.height = img.height
                    super().save(update_fields=['width', 'height'])
            except Exception:
                pass


class Message(models.Model):
    """Contact message from website visitors."""

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Message from {self.name} - {self.created_at.strftime("%Y-%m-%d")}'


class Conversation(models.Model):
    """Chat conversation with a visitor."""

    session_id = models.CharField(max_length=100, unique=True, db_index=True)
    visitor_name = models.CharField(max_length=255)
    visitor_email = models.EmailField(blank=True)
    visitor_phone = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    has_unread = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'Chat with {self.visitor_name} - {self.session_id[:8]}'

    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()

    @property
    def unread_count(self):
        return self.messages.filter(is_from_visitor=True, is_read=False).count()


class ChatMessage(models.Model):
    """Individual message in a conversation."""

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField()
    is_from_visitor = models.BooleanField(default=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        sender = 'Visitor' if self.is_from_visitor else 'Admin'
        return f'{sender}: {self.content[:50]}'
