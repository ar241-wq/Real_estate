"""
Django signals for automatic notification creation.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Message, Conversation, ChatMessage, Notification


@receiver(post_save, sender=Message)
def create_lead_notification(sender, instance, created, **kwargs):
    """Create a NEW_LEAD notification when a contact message is submitted."""
    if created:
        Notification.objects.create(
            notification_type=Notification.NotificationType.NEW_LEAD,
            priority=Notification.Priority.NORMAL,
            title=f'New lead from {instance.name}',
            message=instance.message[:200] + ('...' if len(instance.message) > 200 else ''),
            contact_message=instance,
            action_url='/admin/dashboard/messages'
        )


@receiver(post_save, sender=Conversation)
def create_conversation_notification(sender, instance, created, **kwargs):
    """Create a NEW_CHAT notification when a new conversation starts."""
    if created:
        Notification.objects.create(
            notification_type=Notification.NotificationType.NEW_CHAT,
            priority=Notification.Priority.NORMAL,
            title=f'New chat from {instance.visitor_name}',
            message=f'{instance.visitor_name} started a conversation',
            conversation=instance,
            action_url=f'/admin/dashboard/chats/{instance.id}'
        )


@receiver(post_save, sender=ChatMessage)
def create_chat_message_notification(sender, instance, created, **kwargs):
    """Create a NEW_CHAT notification for visitor messages (not the first one)."""
    if created and instance.is_from_visitor:
        # Check if this is not the first message in the conversation
        message_count = instance.conversation.messages.filter(is_from_visitor=True).count()
        if message_count > 1:
            Notification.objects.create(
                notification_type=Notification.NotificationType.NEW_CHAT,
                priority=Notification.Priority.NORMAL,
                title=f'New message from {instance.conversation.visitor_name}',
                message=instance.content[:200] + ('...' if len(instance.content) > 200 else ''),
                conversation=instance.conversation,
                action_url=f'/admin/dashboard/chats/{instance.conversation.id}'
            )
