/**
 * utils/socket.js - Socket.io initialization and helpers
 * Rooms pattern:
 *   - userId string  → personal notifications room
 *   - "post:<id>"    → live updates for a specific post
 */

const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins their personal room for notifications
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined personal room`);
      }
    });

    // User joins a post room for real-time likes/comments
    socket.on('join:post', (postId) => {
      if (postId) socket.join(`post:${postId}`);
    });

    socket.on('leave:post', (postId) => {
      if (postId) socket.leave(`post:${postId}`);
    });

    // Typing indicators for comments
    socket.on('typing:start', ({ postId, username }) => {
      socket.to(`post:${postId}`).emit('typing:start', { username });
    });

    socket.on('typing:stop', ({ postId }) => {
      socket.to(`post:${postId}`).emit('typing:stop');
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
