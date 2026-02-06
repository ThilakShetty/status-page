import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/organizations
 * Create a new organization
 * User becomes admin automatically
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, slug } = req.body;
    const userId = req.auth!.userId;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'Name and slug are required' 
      });
    }

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return res.status(409).json({ 
        error: 'Organization slug already exists' 
      });
    }

    // Create organization with admin member
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            clerkUserId: userId,
            email: req.user?.email || '',
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json(organization);
  })
);

/**
 * GET /api/organizations
 * Get all organizations user is a member of
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.userId;

    const memberships = await prisma.member.findMany({
      where: { clerkUserId: userId },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                services: true,
                incidents: true,
              },
            },
          },
        },
      },
    });

    const organizations = memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));

    res.json(organizations);
  })
);

/**
 * GET /api/organizations/:id
 * Get single organization details
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.auth!.userId;

    // Verify membership
    const member = await prisma.member.findUnique({
      where: {
        clerkUserId_organizationId: {
          clerkUserId: userId,
          organizationId: id,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: true,
        _count: {
          select: {
            services: true,
            incidents: true,
          },
        },
      },
    });

    res.json(organization);
  })
);

export default router;