'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:3001';

interface ChatMessage {
  id: string;
  content: string;
  isFromVisitor: boolean;
  isRead: boolean;
  createdAt: string;
}

// Generate or get session ID from localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}

export default function FloatingMessageWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConversation, setHasConversation] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasNewAdminMessage, setHasNewAdminMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(CHAT_SERVICE_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const sessionId = getSessionId();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-visitor', sessionId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle incoming messages from admin
    socket.on('new-message', (data: { conversationId: string; message: ChatMessage }) => {
      if (data.conversationId === sessionId) {
        setMessages((prev) => [...prev, data.message]);
        if (!isOpen) {
          setHasNewAdminMessage(true);
        }
      }
    });

    // Handle message sent confirmation
    socket.on('message-sent', (data: { message: ChatMessage }) => {
      setMessages((prev) => [...prev, data.message]);
      setIsSending(false);
    });

    // Handle read receipts
    socket.on('messages-read', () => {
      setMessages((prev) =>
        prev.map((msg) => (msg.isFromVisitor ? { ...msg, isRead: true } : msg))
      );
    });

    // Handle typing indicators
    socket.on('admin-typing', () => {
      setIsAdminTyping(true);
    });

    socket.on('admin-stopped-typing', () => {
      setIsAdminTyping(false);
    });

    // Load existing conversation
    loadConversation(sessionId);

    return () => {
      socket.disconnect();
    };
  }, []);

  // Load existing conversation from REST API
  const loadConversation = async (sessionId: string) => {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/conversations/${sessionId}`);
      if (response.ok) {
        const conversation = await response.json();
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages);
          setHasConversation(true);
        }
      }
    } catch {
      // No existing conversation
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAdminTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewAdminMessage(false);

      // Mark messages as read
      const sessionId = getSessionId();
      fetch(`${CHAT_SERVICE_URL}/api/conversations/${sessionId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: false }),
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    const sessionId = getSessionId();
    const socket = socketRef.current;

    // Stop typing indicator
    if (socket) {
      socket.emit('typing-stop', { sessionId, isAdmin: false });
    }

    if (!hasConversation) {
      // First message - start conversation via REST API
      try {
        const response = await fetch(`${CHAT_SERVICE_URL}/api/conversations/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            visitorName: 'Visitor',
            message: messageText,
          }),
        });

        if (response.ok) {
          const conversation = await response.json();
          setMessages(conversation.messages);
          setHasConversation(true);
        }
      } catch (err) {
        console.error('Failed to start conversation:', err);
        setNewMessage(messageText);
      } finally {
        setIsSending(false);
      }
    } else {
      // Existing conversation - send via WebSocket
      if (socket?.connected) {
        socket.emit('visitor-message', {
          sessionId,
          content: messageText,
          visitorName: 'Visitor',
        });
      } else {
        // Fallback to REST API
        try {
          const response = await fetch(
            `${CHAT_SERVICE_URL}/api/conversations/${sessionId}/messages`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: messageText }),
            }
          );

          if (response.ok) {
            const message = await response.json();
            setMessages((prev) => [...prev, message]);
          }
        } catch (err) {
          console.error('Failed to send message:', err);
          setNewMessage(messageText);
        } finally {
          setIsSending(false);
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    const socket = socketRef.current;
    const sessionId = getSessionId();

    if (socket?.connected && hasConversation) {
      socket.emit('typing-start', { sessionId, isAdmin: false });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', { sessionId, isAdmin: false });
      }, 2000);
    }
  };

  const formatTime = (dateString: string) => {
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
      month: 'short',
      day: 'numeric',
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 relative ${
          isOpen ? 'bg-secondary-600' : 'bg-green-500 hover:bg-green-600'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {hasNewAdminMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            1
          </span>
        )}
        {isOpen ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-16 sm:right-0 w-full sm:w-96 bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[450px]">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 text-white flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="sm:hidden p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">RealEstate</h3>
              <p className="text-green-100 text-xs flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-yellow-400'}`} />
                {isConnected ? 'Online' : 'Connecting...'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hidden sm:block p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-3"
            style={{
              backgroundColor: '#e5ddd5',
              backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4uJiYmNjY19fX2Li4t/f3+Dg4OBgYF7e3tzc3N1dXV5eXl3d3eDg4N9fX17e3t1dXVxMQVVAAAAGnRSTlMAgMDAwIDAwMCAwMDAgIDAwIDAwMCAwMDAwMC8sHMsAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAS0lEQVRIie3Nuw2AMAwF0GdIQkIC/ve/KxUNEhIFoua2R7LNAAAAAAAAAAAAAN5R1Z/6VF36zcqq6u7urlt6V13lmv0+y6v+AAAAHlwJaVQdRdwAAAAASUVORK5CYII=")'
            }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center bg-white/90 rounded-lg px-4 py-3 shadow-sm">
                  <p className="text-secondary-600 text-sm">
                    Hi! How can we help you today?
                  </p>
                </div>
              </div>
            ) : (
              <>
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date divider */}
                    <div className="flex justify-center my-3">
                      <span className="bg-white/80 text-secondary-500 text-xs px-3 py-1 rounded-lg shadow-sm">
                        {date}
                      </span>
                    </div>

                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex mb-1.5 ${message.isFromVisitor ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm ${
                            message.isFromVisitor
                              ? 'bg-[#dcf8c6] rounded-tr-none'
                              : 'bg-white rounded-tl-none'
                          }`}
                        >
                          <p className="text-[15px] text-secondary-800 whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 -mb-0.5">
                            <span className="text-[11px] text-secondary-400">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.isFromVisitor && (
                              <svg
                                className={`w-4 h-4 ${message.isRead ? 'text-blue-500' : 'text-secondary-300'}`}
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

                {/* Typing indicator */}
                {isAdminTyping && (
                  <div className="flex justify-start mb-1.5">
                    <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-[#f0f0f0] px-2 py-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={handleInputChange}
                  className="w-full text-[15px] focus:outline-none"
                  disabled={isSending}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isSending ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
