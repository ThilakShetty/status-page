import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireOrganizationAccess } from '../middleware/tenant';
import { asyncHandler } from '../middleware/errorHandler';
import { broadcastToOrganization, WebSocketEvent } from '../services/websocket';

const router = Router();

/**
 * GET /api/organizations/:orgId/incidents
 * List all incidents in organization
 */
router.get(
  '/:orgId/incidents',
  authenticate,
  requireOrganizationAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: req.organizationId!,
        ...(status && { status: status as any }),
      },
      include: {
        service: true,
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(incidents);
  })
);

/**
 * GET /api/incidents/:id
 * Get single incident with full details
 */
router.get(
  '/incidents/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.auth!.userId;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        service: true,
        organization: { include: { members: true } },
        updates: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Verify access
    const isMember = incident.organization.members.some(
      (m) => m.clerkUserId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(incident);
  })
);

/**
 * POST /api/organizations/:orgId/incidents
 * Create a new incident
 */
router.post(
  '/:orgId/incidents',
  authenticate,
  requireOrganizationAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, serviceId, impact = 'MINOR', status = 'INVESTIGATING', message } = req.body;

    if (!title || !serviceId) {
      return res.status(400).json({ 
        error: 'Title and serviceId are required' 
      });
    }

    // Verify service belongs to organization
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: req.organizationId!,
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create incident with initial update
    const incident = await prisma.incident.create({
      data: {
        title,
        status,
        impact,
        organizationId: req.organizationId!,
        serviceId,
        updates: message
          ? {
              create: {
                message,
                status,
              },
            }
          : undefined,
      },
      include: {
        service: true,
        updates: true,
      },
    });

    // Update service status based on impact
    const newServiceStatus =
      impact === 'CRITICAL'
        ? 'MAJOR_OUTAGE'
        : impact === 'MAJOR'
        ? 'PARTIAL_OUTAGE'
        : 'DEGRADED_PERFORMANCE';

    await prisma.service.update({
      where: { id: serviceId },
      data: { status: newServiceStatus },
    });

    // Broadcast
    broadcastToOrganization(
      req.organizationId!,
      WebSocketEvent.INCIDENT_CREATED,
      { incident }
    );

    res.status(201).json(incident);
  })
);

/**
 * PATCH /api/incidents/:id
 * Update incident status
 */
router.patch(
  '/incidents/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, title, impact } = req.body;
    const userId = req.auth!.userId;

    // Verify access
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { organization: { include: { members: true } } },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const isMember = incident.organization.members.some(
      (m) => m.clerkUserId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update incident
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(impact && { impact }),
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
      include: {
        service: true,
        updates: true,
      },
    });

    // If resolved, reset service status to operational
    if (status === 'RESOLVED') {
      await prisma.service.update({
        where: { id: incident.serviceId },
        data: { status: 'OPERATIONAL' },
      });

      broadcastToOrganization(
        incident.organizationId,
        WebSocketEvent.INCIDENT_RESOLVED,
        { incident: updated }
      );
    } else {
      broadcastToOrganization(
        incident.organizationId,
        WebSocketEvent.INCIDENT_UPDATED,
        { incident: updated }
      );
    }

    res.json(updated);
  })
);

/**
 * POST /api/incidents/:id/updates
 * Add update to incident
 */
router.post(
  '/incidents/:id/updates',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { message, status } = req.body;
    const userId = req.auth!.userId;

    if (!message || !status) {
      return res.status(400).json({ 
        error: 'Message and status are required' 
      });
    }

    // Verify access
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { organization: { include: { members: true } } },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const isMember = incident.organization.members.some(
      (m) => m.clerkUserId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create update and update incident status
    const update = await prisma.incidentUpdate.create({
      data: {
        message,
        status,
        incidentId: id,
      },
    });

    await prisma.incident.update({
      where: { id },
      data: { status },
    });

    // Broadcast
    broadcastToOrganization(
      incident.organizationId,
      WebSocketEvent.INCIDENT_UPDATED,
      { incidentId: id, update }
    );

    res.status(201).json(update);
  })
);

export default router;