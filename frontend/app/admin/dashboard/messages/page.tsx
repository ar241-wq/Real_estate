'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket, Conversation, ChatMessage } from '@/lib/socket';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:3001';

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  // Keep ref in sync with state for socket callbacks
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Fetch conversations from REST API
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/conversations`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      let convList = data.results || [];

      if (filter === 'unread') {
        convList = convList.filter((c: Conversation) => c.hasUnread);
      }

      setConversations(convList);
    } catch (err) {
      setError('Failed to load conversations. Make sure the chat service is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = connectSocket();

    const handleConnect = () => {
      console.log('Admin connected to chat service');
      setIsConnected(true);
      socket.emit('join-admin');
    };

    const handleDisconnect = () => {
      console.log('Admin disconnected from chat service');
      setIsConnected(false);
    };

    const handleNewMessage = (data: {
      conversationId: string;
      message: ChatMessage;
      conversation?: Conversation;
    }) => {
      // Update conversation list
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.sessionId === data.conversationId);

        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages: [...updated[existingIndex].messages, data.message],
            lastMessage: data.message,
            hasUnread: data.message.isFromVisitor,
            unreadCount: data.message.isFromVisitor
              ? (updated[existingIndex].unreadCount || 0) + 1
              : updated[existingIndex].unreadCount,
            updatedAt: data.message.createdAt,
          };
          // Sort by updatedAt
          return updated.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        } else if (data.conversation) {
          // Add new conversation
          return [data.conversation, ...prev];
        }
        return prev;
      });

      // Update selected conversation if it's the one receiving the message
      const currentSelected = selectedConversationRef.current;
      if (currentSelected && currentSelected.sessionId === data.conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message],
          lastMessage: data.message,
          updatedAt: data.message.createdAt,
        } : null);

        // Mark messages as read if viewing this conversation
        if (data.message.isFromVisitor) {
          fetch(`${CHAT_SERVICE_URL}/api/conversations/${data.conversationId}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isAdmin: true }),
          }).catch(console.error);
        }
      }
    };

    const handleVisitorTyping = (data: { sessionId: string }) => {
      setTypingUsers(prev => new Set(prev).add(data.sessionId));
    };

    const handleVisitorStoppedTyping = (data: { sessionId: string }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(data.sessionId);
        return next;
      });
    };

    const handleMessagesRead = (data: { conversationId: string }) => {
      // Update selected conversation messages as read
      const currentSelected = selectedConversationRef.current;
      if (currentSelected && currentSelected.sessionId === data.conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: prev.messages.map(m =>
            !m.isFromVisitor ? { ...m, isRead: true } : m
          ),
        } : null);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new-message', handleNewMessage);
    socket.on('visitor-typing', handleVisitorTyping);
    socket.on('visitor-stopped-typing', handleVisitorStoppedTyping);
    socket.on('messages-read', handleMessagesRead);

    // If already connected, emit join
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new-message', handleNewMessage);
      socket.off('visitor-typing', handleVisitorTyping);
      socket.off('visitor-stopped-typing', handleVisitorStoppedTyping);
      socket.off('messages-read', handleMessagesRead);
    };
  }, []);

  // Fetch conversations on mount and filter change
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/conversations/${conversation.sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      const fullConversation = await response.json();
      setSelectedConversation(fullConversation);

      // Mark as read
      await fetch(`${CHAT_SERVICE_URL}/api/conversations/${conversation.sessionId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: true }),
      });

      // Update the conversation in the list to mark as read
      setConversations(prev =>
        prev.map(c =>
          c.sessionId === conversation.sessionId ? { ...c, hasUnread: false, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    const socket = getSocket();

    try {
      // Use socket if connected, otherwise use REST API
      if (socket.connected) {
        socket.emit('admin-message', {
          sessionId: selectedConversation.sessionId,
          content: newMessage,
        });

        // Optimistically add message
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          content: newMessage,
          isFromVisitor: false,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        setSelectedConversation(prev =>
          prev ? {
            ...prev,
            messages: [...prev.messages, optimisticMessage],
          } : null
        );

        // Update last message in conversation list
        setConversations(prev =>
          prev.map(c =>
            c.sessionId === selectedConversation.sessionId
              ? {
                  ...c,
                  lastMessage: optimisticMessage,
                  updatedAt: optimisticMessage.createdAt,
                }
              : c
          )
        );
      } else {
        // Fallback to REST API
        const response = await fetch(
          `${CHAT_SERVICE_URL}/api/conversations/${selectedConversation.sessionId}/reply`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newMessage }),
          }
        );

        if (!response.ok) throw new Error('Failed to send message');
        const message = await response.json();

        setSelectedConversation(prev =>
          prev ? {
            ...prev,
            messages: [...prev.messages, message],
          } : null
        );

        setConversations(prev =>
          prev.map(c =>
            c.sessionId === selectedConversation.sessionId
              ? {
                  ...c,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                }
              : c
          )
        );
      }

      setNewMessage('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await fetch(`${CHAT_SERVICE_URL}/api/conversations/${sessionId}`, {
        method: 'DELETE',
      });
      setConversations(prev => prev.filter(c => c.sessionId !== sessionId));
      if (selectedConversation?.sessionId === sessionId) {
        setSelectedConversation(null);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group messages by date
  const groupedMessages = (selectedConversation?.messages || []).reduce(
    (groups, message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, ChatMessage[]>
  );

  // Filter conversations by search
  const filteredConversations = conversations.filter(
    (c) =>
      c.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.visitorEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.visitorPhone?.includes(searchQuery)
  );

  const unreadCount = conversations.filter((c) => c.hasUnread).length;

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-secondary-200 overflow-hidden">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-secondary-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-secondary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-secondary-900">Chats</h2>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
                    title={isConnected ? 'Connected' : 'Connecting...'} />
            </div>
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex mt-3 gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-green-100 text-green-700'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                filter === 'unread'
                  ? 'bg-green-100 text-green-700'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchConversations}>Try Again</Button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">
                No conversations
              </h3>
              <p className="text-secondary-500 text-sm">
                Chats from visitors will appear here
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.sessionId}
                onClick={() => handleSelectConversation(conversation)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-secondary-100 hover:bg-secondary-50 ${
                  selectedConversation?.sessionId === conversation.sessionId
                    ? 'bg-secondary-100'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {conversation.visitorName.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-900 truncate">
                      {conversation.visitorName}
                    </span>
                    <span className="text-xs text-secondary-500">
                      {conversation.lastMessage
                        ? formatTime(conversation.lastMessage.createdAt)
                        : formatTime(conversation.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-secondary-500 truncate">
                      {typingUsers.has(conversation.sessionId) ? (
                        <span className="text-green-600 italic">typing...</span>
                      ) : conversation.lastMessage ? (
                        <>
                          {!conversation.lastMessage.isFromVisitor && (
                            <span className="text-secondary-400">You: </span>
                          )}
                          {conversation.lastMessage.content}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                    {conversation.hasUnread && (
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2">
                        {conversation.unreadCount || '!'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-3 sm:px-4 py-3 border-b border-secondary-200 flex items-center justify-between bg-secondary-50">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-1 -ml-1 text-secondary-600 hover:text-secondary-900"
                  aria-label="Back to conversations"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConversation.visitorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-secondary-900 truncate">
                    {selectedConversation.visitorName}
                  </h3>
                  <p className="text-xs text-secondary-500 truncate">
                    {typingUsers.has(selectedConversation.sessionId) ? (
                      <span className="text-green-600">typing...</span>
                    ) : (
                      selectedConversation.visitorEmail || selectedConversation.visitorPhone || 'Online'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirm(selectedConversation.sessionId)}
                  className="p-2 text-secondary-500 hover:text-red-600 hover:bg-secondary-100 rounded-lg transition-colors"
                  title="Delete conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5]"
              style={{
                backgroundImage:
                  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3Oeli6teleVeli8teleieOeli6teleieGeli6teleVeli6teleOeli8eleVeli6neli8wAAADmSURBVDjLtZJHEsMgEAQBEUQOIuf/H5Uy4mCDbVkuq+7a6QEGpgTqwnQ7e8XP9XqAYSH3j+F+XzyqZV1wdhEeiojzs63gfh4Y9Z+JzxkX+N+N/InI/ETIHi7ETJ8C5+J+I+Tn4j4zcjsSz/9j5G8kXj8jz79G/vdCOWlC+lXItqFP/7qmPb8auEWM3OGDzexAMJ8dCKaD+pHg5y8yd+b3y2AvL/d3BvcjcfslvBzl7n0uyNt7RG7v0JDgHjLyhLv5PJfke52XO1D8CwoiQKZqO+AAAAAASUVORK5CYII=")',
              }}
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date}>
                      {/* Date divider */}
                      <div className="flex justify-center my-4">
                        <span className="bg-white/90 text-secondary-600 text-xs px-3 py-1 rounded-lg shadow-sm">
                          {date}
                        </span>
                      </div>

                      {dateMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex mb-2 ${
                            message.isFromVisitor ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                              message.isFromVisitor
                                ? 'bg-white rounded-bl-none'
                                : 'bg-green-100 rounded-br-none'
                            }`}
                          >
                            <p className="text-sm text-secondary-800 whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-secondary-500">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {!message.isFromVisitor && (
                                <svg
                                  className={`w-4 h-4 ${message.isRead ? 'text-blue-500' : 'text-secondary-400'}`}
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-secondary-200 bg-secondary-50">
              <form onSubmit={handleSendReply} className="flex items-end gap-3">
                <div className="flex-1 bg-white rounded-2xl border border-secondary-200 px-4 py-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isSending ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center bg-secondary-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-secondary-900 mb-2">
                RealEstate Chat
              </h3>
              <p className="text-secondary-500">
                Select a conversation to start messaging
              </p>
              <p className="text-xs text-secondary-400 mt-2">
                {isConnected ? 'Connected to chat service' : 'Connecting to chat service...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Conversation"
      >
        <div className="p-6">
          <p className="text-secondary-600 mb-6">
            Are you sure you want to delete this conversation? All messages will be
            permanently deleted.
          </p>
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
