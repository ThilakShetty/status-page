import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';
import { prisma } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import organizationRoutes from './routes/organizations';
import serviceRoutes from './routes/services';
import incidentRoutes from './routes/incidents';
import publicRoutes from './routes/public';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Allow frontend requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// CLERK AUTHENTICATION - COMMENTED OUT FOR TESTING
// Uncomment this when you're ready to use Clerk
// import { clerkMiddleware } from '@clerk/express';
// app.use(clerkMiddleware());

// FAKE AUTH FOR TESTING - REMOVE IN PRODUCTION!
app.use((req, res, next) => {
  req.auth = { userId: 'test_user_123' };
  next();
});

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/organizations', serviceRoutes); // For /:orgId/services routes
app.use('/api/organizations', incidentRoutes); // For /:orgId/incidents routes
app.use('/api', serviceRoutes); // For /api/services/:id routes
app.use('/api', incidentRoutes); // For /api/incidents/:id routes
app.use('/api/public', publicRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

// Create HTTP server (needed for Socket.IO)
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);
console.log('✅ Socket.IO initialized');

// Start server
httpServer.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV}
🌐 Frontend URL: ${process.env.FRONTEND_URL}
🔌 Socket.IO ready
⚠️  AUTH DISABLED (using fake auth for testing)
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});