

import { Request, Response, NextFunction } from 'express';

/**
 * FAKE AUTH MIDDLEWARE FOR TESTING
 * This bypasses Clerk authentication
 * 
 * ⚠️ REMOVE THIS IN PRODUCTION!
 * Replace with real Clerk auth when ready
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Fake auth already set in server.ts
  // Just continue to next middleware
  next();
};

// import { requireAuth } from '@clerk/express';
// import { Request, Response, NextFunction } from 'express';

// /**
//  * Clerk authentication middleware
//  * Verifies JWT token and attaches user info to request
//  * 
//  * Usage: router.get('/services', authenticate, handler)
//  */
// export const authenticate = requireAuth();

/**
 * Optional: Get current user details from Clerk
 * Only use this if you need full user profile data
 * Must be used after authenticate middleware
 * 
 * Usage: router.get('/profile', authenticate, getCurrentUser, handler)
 */
// export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     if (!req.auth?.userId) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     // Uncomment when you need user details from Clerk
//     // import { clerkClient } from '@clerk/express';
//     // const user = await clerkClient.users.getUser(req.auth.userId);
//     
//     // req.user = {
//     //   id: user.id,
//     //   email: user.emailAddresses[0]?.emailAddress || '',
//     //   firstName: user.firstName || '',
//     //   lastName: user.lastName || '',
//     // };

//     next();
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(401).json({ error: 'Invalid authentication token' });
//   }
// };