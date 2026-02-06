import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireOrganizationAccess } from '../middleware/tenant';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  patchService,
  updateServiceStatus,
  deleteService,
} from '../controllers/serviceController';

const router = Router();

// ============================================================================
// ORGANIZATION-SCOPED ROUTES
// Routes that require organization context
// ============================================================================

/**
 * POST /api/organizations/:orgId/services
 * Create a new service
 */
router.post(
  '/:orgId/services',
  authenticate,
  requireOrganizationAccess,
  asyncHandler(createService)
);

/**
 * GET /api/organizations/:orgId/services
 * List all services in organization
 */
router.get(
  '/:orgId/services',
  authenticate,
  requireOrganizationAccess,
  asyncHandler(getServices)
);

// ============================================================================
// SERVICE-SPECIFIC ROUTES
// Routes that operate on individual services
// ============================================================================

/**
 * GET /api/services/:id
 * Get single service with details
 */
router.get(
  '/services/:id',
  authenticate,
  asyncHandler(getServiceById)
);

/**
 * PUT /api/services/:id
 * Full update of service (all fields required)
 */
router.put(
  '/services/:id',
  authenticate,
  asyncHandler(updateService)
);

/**
 * PATCH /api/services/:id
 * Partial update of service (only provided fields updated)
 */
router.patch(
  '/services/:id',
  authenticate,
  asyncHandler(patchService)
);

/**
 * PATCH /api/services/:id/status
 * Update only the service status
 */
router.patch(
  '/services/:id/status',
  authenticate,
  asyncHandler(updateServiceStatus)
);

/**
 * DELETE /api/services/:id
 * Delete a service
 */
router.delete(
  '/services/:id',
  authenticate,
  asyncHandler(deleteService)
);

export default router;