import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/public/status/:slug
 * Public status page - no authentication required
 * Returns organization info, services, and active incidents
 */
router.get(
  '/status/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        services: {
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        },
        incidents: {
          where: {
            status: {
              not: 'RESOLVED',
            },
          },
          include: {
            service: true,
            updates: {
              orderBy: { createdAt: 'desc' },
              take: 5, // Latest 5 updates
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ 
        error: 'Status page not found' 
      });
    }

    // Calculate overall status
    const hasOutage = organization.services.some(
      (s) => s.status === 'MAJOR_OUTAGE'
    );
    const hasDegradation = organization.services.some(
      (s) => s.status === 'PARTIAL_OUTAGE' || s.status === 'DEGRADED_PERFORMANCE'
    );
    const hasMaintenance = organization.services.some(
      (s) => s.status === 'UNDER_MAINTENANCE'
    );

    const overallStatus = hasOutage
      ? 'Major Outage'
      : hasDegradation
      ? 'Degraded Performance'
      : hasMaintenance
      ? 'Under Maintenance'
      : 'All Systems Operational';

    res.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      overallStatus,
      services: organization.services,
      activeIncidents: organization.incidents,
      lastUpdated: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/public/status/:slug/history
 * Get resolved incidents for status page history
 */
router.get(
  '/status/:slug/history',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { limit = '10' } = req.query;

    const organization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: organization.id,
        status: 'RESOLVED',
      },
      include: {
        service: true,
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { resolvedAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(incidents);
  })
);

export default router;