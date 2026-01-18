const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions,
});

// In-memory storage (in production, use Redis or a database)
const conversations = new Map();
const adminSockets = new Set();

// Helper to get or create conversation
function getOrCreateConversation(sessionId, visitorName = 'Visitor') {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      id: uuidv4(),
      sessionId,
      visitorName,
      visitorEmail: '',
      visitorPhone: '',
      messages: [],
      hasUnread: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return conversations.get(sessionId);
}

// REST API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

// Get all conversations (admin)
app.get('/api/conversations', (req, res) => {
  const convList = Array.from(conversations.values())
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((conv) => ({
      ...conv,
      lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
      unreadCount: conv.messages.filter((m) => m.isFromVisitor && !m.isRead).length,
    }));

  res.json({ results: convList });
});

// Get single conversation
app.get('/api/conversations/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversation = conversations.get(sessionId);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json(conversation);
});

// Start conversation
app.post('/api/conversations/start', (req, res) => {
  const { sessionId, visitorName, visitorEmail, visitorPhone, message } = req.body;

  const conversation = getOrCreateConversation(sessionId, visitorName || 'Visitor');

  if (visitorName) conversation.visitorName = visitorName;
  if (visitorEmail) conversation.visitorEmail = visitorEmail;
  if (visitorPhone) conversation.visitorPhone = visitorPhone;

  // Add the message
  const newMessage = {
    id: uuidv4(),
    content: message,
    isFromVisitor: true,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(newMessage);
  conversation.hasUnread = true;
  conversation.updatedAt = new Date().toISOString();

  // Notify admin clients
  io.to('admin-room').emit('new-message', {
    conversationId: conversation.sessionId,
    message: newMessage,
    conversation: {
      ...conversation,
      lastMessage: newMessage,
      unreadCount: conversation.messages.filter((m) => m.isFromVisitor && !m.isRead).length,
    },
  });

  res.json(conversation);
});

// Send message (visitor)
app.post('/api/conversations/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;

  const conversation = conversations.get(sessionId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const newMessage = {
    id: uuidv4(),
    content,
    isFromVisitor: true,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(newMessage);
  conversation.hasUnread = true;
  conversation.updatedAt = new Date().toISOString();

  // Notify admin clients
  io.to('admin-room').emit('new-message', {
    conversationId: sessionId,
    message: newMessage,
    conversation: {
      ...conversation,
      lastMessage: newMessage,
      unreadCount: conversation.messages.filter((m) => m.isFromVisitor && !m.isRead).length,
    },
  });

  res.json(newMessage);
});

// Admin reply
app.post('/api/conversations/:sessionId/reply', (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;

  const conversation = conversations.get(sessionId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const newMessage = {
    id: uuidv4(),
    content,
    isFromVisitor: false,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date().toISOString();

  // Notify visitor
  io.to(`visitor-${sessionId}`).emit('new-message', {
    conversationId: sessionId,
    message: newMessage,
  });

  res.json(newMessage);
});

// Mark messages as read
app.post('/api/conversations/:sessionId/read', (req, res) => {
  const { sessionId } = req.params;
  const { isAdmin } = req.body;

  const conversation = conversations.get(sessionId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conversation.messages.forEach((msg) => {
    if (isAdmin && msg.isFromVisitor) {
      msg.isRead = true;
    } else if (!isAdmin && !msg.isFromVisitor) {
      msg.isRead = true;
    }
  });

  if (isAdmin) {
    conversation.hasUnread = false;
  }

  // Notify about read status
  if (isAdmin) {
    io.to(`visitor-${sessionId}`).emit('messages-read', { conversationId: sessionId });
  } else {
    io.to('admin-room').emit('messages-read', { conversationId: sessionId });
  }

  res.json({ success: true });
});

// Delete conversation
app.delete('/api/conversations/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  conversations.delete(sessionId);
  res.json({ success: true });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Visitor joins their room
  socket.on('join-visitor', (sessionId) => {
    socket.join(`visitor-${sessionId}`);
    console.log(`Visitor joined room: visitor-${sessionId}`);
  });

  // Admin joins admin room
  socket.on('join-admin', () => {
    socket.join('admin-room');
    adminSockets.add(socket.id);
    console.log('Admin joined admin-room');
  });

  // Visitor sends message
  socket.on('visitor-message', (data) => {
    const { sessionId, content, visitorName } = data;

    const conversation = getOrCreateConversation(sessionId, visitorName);

    const newMessage = {
      id: uuidv4(),
      content,
      isFromVisitor: true,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    conversation.messages.push(newMessage);
    conversation.hasUnread = true;
    conversation.updatedAt = new Date().toISOString();

    // Send back to visitor
    socket.emit('message-sent', { message: newMessage });

    // Notify admins
    io.to('admin-room').emit('new-message', {
      conversationId: sessionId,
      message: newMessage,
      conversation: {
        ...conversation,
        lastMessage: newMessage,
        unreadCount: conversation.messages.filter((m) => m.isFromVisitor && !m.isRead).length,
      },
    });
  });

  // Admin sends message
  socket.on('admin-message', (data) => {
    const { sessionId, content } = data;

    const conversation = conversations.get(sessionId);
    if (!conversation) return;

    const newMessage = {
      id: uuidv4(),
      content,
      isFromVisitor: false,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();

    // Send back to admin
    socket.emit('message-sent', { message: newMessage });

    // Notify visitor
    io.to(`visitor-${sessionId}`).emit('new-message', {
      conversationId: sessionId,
      message: newMessage,
    });
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    const { sessionId, isAdmin } = data;
    if (isAdmin) {
      io.to(`visitor-${sessionId}`).emit('admin-typing', { sessionId });
    } else {
      io.to('admin-room').emit('visitor-typing', { sessionId });
    }
  });

  socket.on('typing-stop', (data) => {
    const { sessionId, isAdmin } = data;
    if (isAdmin) {
      io.to(`visitor-${sessionId}`).emit('admin-stopped-typing', { sessionId });
    } else {
      io.to('admin-room').emit('visitor-stopped-typing', { sessionId });
    }
  });

  socket.on('disconnect', () => {
    adminSockets.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Chat microservice running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
