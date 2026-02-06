import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { broadcastToOrganization, WebSocketEvent } from '../services/websocket';

/**
 * Create a new service
 * POST /api/organizations/:orgId/services
 */
export const createService = async (req: Request, res: Response) => {
  const { name, description, status = 'OPERATIONAL', order = 0 } = req.body;
  const organizationId = req.organizationId!;

  // Validation
  if (!name) {
    return res.status(400).json({ error: 'Service name is required' });
  }

  // Validate status
  const validStatuses = ['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }

  // Create service
  const service = await prisma.service.create({
    data: {
      name,
      description,
      status,
      order,
      organizationId,
    },
  });

  // Broadcast to organization
  broadcastToOrganization(
    organizationId,
    WebSocketEvent.SERVICE_CREATED,
    { service }
  );

  res.status(201).json(service);
};

/**
 * Get all services for organization
 * GET /api/organizations/:orgId/services
 */
export const getServices = async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;

  const services = await prisma.service.findMany({
    where: { organizationId },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: { 
          incidents: {
            where: {
              status: { not: 'RESOLVED' }
            }
          }
        },
      },
    },
  });

  res.json(services);
};

/**
 * Get single service
 * GET /api/services/:id
 */
export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.auth!.userId;

  // Verify service exists and user has access
  const service = await prisma.service.findUnique({
    where: { id },
    include: { 
      organization: { 
        include: { members: true } 
      },
      incidents: {
        where: {
          status: { not: 'RESOLVED' }
        },
        include: {
          updates: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          }
        }
      }
    },
  });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Check membership
  const isMember = service.organization.members.some(
    (m) => m.clerkUserId === userId
  );

  if (!isMember) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(service);
};

/**
 * Update service (full update)
 * PUT /api/services/:id
 */
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status, order } = req.body;
  const userId = req.auth!.userId;

  // Validation
  if (!name) {
    return res.status(400).json({ error: 'Service name is required' });
  }

  // Validate status if provided
  const validStatuses = ['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }

  // Verify service exists and user has access
  const service = await prisma.service.findUnique({
    where: { id },
    include: { organization: { include: { members: true } } },
  });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const isMember = service.organization.members.some(
    (m) => m.clerkUserId === userId
  );

  if (!isMember) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Update service
  const updated = await prisma.service.update({
    where: { id },
    data: {
      name,
      description: description || null,
      status: status || service.status,
      order: order !== undefined ? order : service.order,
    },
  });

  // Broadcast update
  broadcastToOrganization(
    service.organizationId,
    WebSocketEvent.SERVICE_UPDATED,
    { service: updated }
  );

  res.json(updated);
};

/**
 * Partial update service
 * PATCH /api/services/:id
 */
export const patchService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status, order } = req.body;
  const userId = req.auth!.userId;

  // Validate status if provided
  const validStatuses = ['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }

  // Verify service exists and user has access
  const service = await prisma.service.findUnique({
    where: { id },
    include: { organization: { include: { members: true } } },
  });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const isMember = service.organization.members.some(
    (m) => m.clerkUserId === userId
  );

  if (!isMember) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Build update data (only include provided fields)
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (order !== undefined) updateData.order = order;

  // Update service
  const updated = await prisma.service.update({
    where: { id },
    data: updateData,
  });

  // Broadcast update
  broadcastToOrganization(
    service.organizationId,
    WebSocketEvent.SERVICE_UPDATED,
    { service: updated }
  );

  res.json(updated);
};

/**
 * Update service status only
 * PATCH /api/services/:id/status
 */
export const updateServiceStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.auth!.userId;

  // Validation
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses = ['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }

  // Verify service exists and user has access
  const service = await prisma.service.findUnique({
    where: { id },
    include: { organization: { include: { members: true } } },
  });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const isMember = service.organization.members.some(
    (m) => m.clerkUserId === userId
  );

  if (!isMember) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Update status
  const updated = await prisma.service.update({
    where: { id },
    data: { status },
  });

  // Broadcast status change
  broadcastToOrganization(
    service.organizationId,
    WebSocketEvent.SERVICE_UPDATED,
    { 
      service: updated,
      statusChanged: true,
      previousStatus: service.status,
      newStatus: status
    }
  );

  res.json(updated);
};

/**
 * Delete service
 * DELETE /api/services/:id
 */
export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.auth!.userId;

  // Verify service exists and user has access
  const service = await prisma.service.findUnique({
    where: { id },
    include: { 
      organization: { include: { members: true } },
      _count: { select: { incidents: true } }
    },
  });

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const isMember = service.organization.members.some(
    (m) => m.clerkUserId === userId
  );

  if (!isMember) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Optional: Prevent deletion if service has incidents
  // if (service._count.incidents > 0) {
  //   return res.status(400).json({ 
  //     error: 'Cannot delete service with existing incidents',
  //     incidentCount: service._count.incidents
  //   });
  // }

  // Delete service (cascade will delete related incidents)
  await prisma.service.delete({ where: { id } });

  // Broadcast deletion
  broadcastToOrganization(
    service.organizationId,
    WebSocketEvent.SERVICE_DELETED,
    { serviceId: id, serviceName: service.name }
  );

  res.status(204).send();
};