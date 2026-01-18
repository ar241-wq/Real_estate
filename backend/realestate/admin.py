"""
Django admin configuration for Real Estate models.
This is minimal - main admin UI is in the frontend.
"""

from django.contrib import admin
from .models import Property, PropertyImage, Message


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'price', 'location_text', 'featured', 'created_at']
    list_filter = ['status', 'featured', 'created_at']
    search_fields = ['title', 'location_text', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PropertyImageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'message']
