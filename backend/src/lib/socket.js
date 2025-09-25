import { Server } from 'socket.io';

let ioInstance = null;
const userIdToSocketIds = new Map();

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
        const setIds = userIdToSocketIds.get(userId) || new Set();
        setIds.add(socket.id);
        userIdToSocketIds.set(userId, setIds);
        ioInstance.emit('presence:update', { userId, online: true });
      }
    });

    socket.on('typing', ({ fromUserId, toUserId }) => {
      if (toUserId) ioInstance.to(toUserId).emit('typing', { fromUserId });
    });

    socket.on('stopTyping', ({ fromUserId, toUserId }) => {
      if (toUserId) ioInstance.to(toUserId).emit('stopTyping', { fromUserId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      // find and update presence
      for (const [userId, ids] of userIdToSocketIds.entries()) {
        if (ids.has(socket.id)) {
          ids.delete(socket.id);
          if (ids.size === 0) {
            userIdToSocketIds.delete(userId);
            ioInstance.emit('presence:update', { userId, online: false, lastSeen: Date.now() });
          } else {
            userIdToSocketIds.set(userId, ids);
          }
          break;
        }
      }
    });

    // WebRTC signaling: offer/answer/ice/end
    socket.on('webrtc:offer', ({ toUserId, fromUserId, offer }) => {
      if (toUserId) ioInstance.to(toUserId).emit('webrtc:offer', { fromUserId, offer });
    });
    socket.on('webrtc:answer', ({ toUserId, fromUserId, answer }) => {
      if (toUserId) ioInstance.to(toUserId).emit('webrtc:answer', { fromUserId, answer });
    });
    socket.on('webrtc:ice', ({ toUserId, fromUserId, candidate }) => {
      if (toUserId) ioInstance.to(toUserId).emit('webrtc:ice', { fromUserId, candidate });
    });
    socket.on('webrtc:end', ({ toUserId, fromUserId, reason }) => {
      if (toUserId) ioInstance.to(toUserId).emit('webrtc:end', { fromUserId, reason });
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
}


