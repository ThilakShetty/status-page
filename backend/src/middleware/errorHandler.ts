import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Catches all errors thrown in route handlers
 * Returns consistent JSON error responses
 * 
 * Usage: app.use(errorHandler) - must be last middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', error);

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database error',
      message: error.message,
    });
  }

  // Prisma validation errors
  if (error.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid data provided',
    });
  }

  // Validation errors (from Zod or other validators)
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * Async handler wrapper
 * Catches errors in async route handlers and forwards to error middleware
 * 
 * Usage: router.get('/services', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};