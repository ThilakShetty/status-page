import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO server
 * Called once during server startup
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Connection settings
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join organization room
    socket.on('join:organization', (organizationId: string) => {
      socket.join(`org:${organizationId}`);
      console.log(`🏢 Client ${socket.id} joined organization: ${organizationId}`);
    });

    // Leave organization room
    socket.on('leave:organization', (organizationId: string) => {
      socket.leave(`org:${organizationId}`);
      console.log(`🚪 Client ${socket.id} left organization: ${organizationId}`);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 * Used by controllers to emit events
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};