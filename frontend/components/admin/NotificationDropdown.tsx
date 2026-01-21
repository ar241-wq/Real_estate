'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api';
import { Notification, NotificationType } from '@/lib/types';

interface NotificationDropdownProps {
  onClose: () => void;
  onCountChange: () => void;
}

function getNotificationIcon(type: NotificationType): React.ReactNode {
  switch (type) {
    case 'NEW_CHAT':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'NEW_LEAD':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'PROPERTY_INQUIRY':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'AGENT_RESPONSE_DELAY':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
  }
}

export default function NotificationDropdown({
  onClose,
  onCountChange,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const filters = activeTab === 'unread' ? { is_read: false } : {};
        const data = await getNotifications(filters);
        if (!isCancelled && data) {
          setNotifications(data.results || []);
        }
      } catch {
        // Silently fail
        if (!isCancelled) {
          setNotifications([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isCancelled = true;
    };
  }, [activeTab]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        onCountChange();
      }

      if (notification.action_url) {
        router.push(notification.action_url);
        onClose();
      }
    } catch {
      // Silently fail - still navigate if action_url exists
      if (notification.action_url) {
        router.push(notification.action_url);
        onClose();
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(false);
      setNotifications((prev) =>
        prev.map((n) =>
          n.priority !== 'HIGH' ? { ...n, is_read: true } : n
        )
      );
      onCountChange();
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-secondary-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200 bg-secondary-50">
        <h3 className="font-semibold text-secondary-900">Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Mark all read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'unread'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-secondary-500">
            <svg
              className="w-12 h-12 mb-2 text-secondary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left px-4 py-3 hover:bg-secondary-50 transition-colors border-b border-secondary-100 last:border-b-0 ${
                  !notification.is_read ? 'bg-primary-50' : 'bg-white'
                } ${
                  notification.priority === 'HIGH' && !notification.is_read
                    ? 'border-l-4 border-l-red-500'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-full ${
                      notification.priority === 'HIGH' && !notification.is_read
                        ? 'bg-red-100 text-red-600'
                        : 'bg-secondary-100 text-secondary-600'
                    }`}
                  >
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          !notification.is_read
                            ? 'font-semibold text-secondary-900'
                            : 'text-secondary-700'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span
                          className={`flex-shrink-0 ml-2 w-2 h-2 rounded-full ${
                            notification.priority === 'HIGH'
                              ? 'bg-red-500'
                              : 'bg-primary-500'
                          }`}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-secondary-500 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-secondary-400">
                      {notification.time_ago}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-secondary-200 bg-secondary-50">
        <button
          onClick={() => {
            router.push('/admin/dashboard/notifications');
            onClose();
          }}
          className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
