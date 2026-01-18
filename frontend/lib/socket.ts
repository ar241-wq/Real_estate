import { io, Socket } from 'socket.io-client';

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(CHAT_SERVICE_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export interface ChatMessage {
  id: string;
  content: string;
  isFromVisitor: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  messages: ChatMessage[];
  hasUnread: boolean;
  isActive: boolean;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}
