import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * SIMPLIFIED VERSION FOR TESTING
 * Just attaches orgId without checking membership
 */
export const requireOrganizationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.params.orgId || req.query.orgId as string;

    if (!organizationId) {
      return res.status(400).json({ 
        error: 'Organization ID is required' 
      });
    }

    // Just attach the orgId without checking membership (FOR TESTING ONLY)
    req.organizationId = organizationId;
    
    console.log('✅ Organization access granted:', organizationId);

    next();
  } catch (error) {
    console.error('Error in organization middleware:', error);
    res.status(500).json({ error: 'Failed to verify organization access' });
  }
};

/**
 * When ready for production, replace with the full version that checks membership
 */
// import { Request, Response, NextFunction } from 'express';
// import { prisma } from '../config/database';

// export const requireOrganizationAccess = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const organizationId = req.params.orgId || req.query.orgId as string;

//     if (!organizationId) {
//       return res.status(400).json({ 
//         error: 'Organization ID is required' 
//       });
//     }

//     if (!req.auth?.userId) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     const member = await prisma.member.findUnique({
//       where: {
//         clerkUserId_organizationId: {
//           clerkUserId: req.auth.userId,
//           organizationId: organizationId,
//         },
//       },
//       include: {
//         organization: true,
//       },
//     });

//     if (!member) {
//       return res.status(403).json({ 
//         error: 'Access denied',
//         message: 'You are not a member of this organization'
//       });
//     }

//     req.member = member;
//     req.organizationId = organizationId;

//     next();
//   } catch (error) {
//     console.error('Error verifying organization access:', error);
//     res.status(500).json({ error: 'Failed to verify organization access' });
//   }
// };