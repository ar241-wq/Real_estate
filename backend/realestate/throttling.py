"""
Custom throttling classes for the Real Estate API.
"""

from rest_framework.throttling import AnonRateThrottle


class MessageCreateThrottle(AnonRateThrottle):
    """Throttle for message creation to prevent spam."""

    rate = '5/minute'
    scope = 'message_create'
