import { getIO } from '../config/socket';

/**
 * WebSocket event types
 */
export enum WebSocketEvent {
  SERVICE_CREATED = 'service:created',
  SERVICE_UPDATED = 'service:updated',
  SERVICE_DELETED = 'service:deleted',
  INCIDENT_CREATED = 'incident:created',
  INCIDENT_UPDATED = 'incident:updated',
  INCIDENT_RESOLVED = 'incident:resolved',
}

/**
 * Broadcast event to all clients in an organization room
 */
export const broadcastToOrganization = (
  organizationId: string,
  event: WebSocketEvent,
  data: any
) => {
  try {
    const io = getIO();
    io.to(`org:${organizationId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`📡 Broadcast ${event} to org:${organizationId}`);
  } catch (error) {
    console.error('WebSocket broadcast error:', error);
  }
};

/**
 * Broadcast event to all connected clients (for public status pages)
 */
export const broadcastGlobal = (event: WebSocketEvent, data: any) => {
  try {
    const io = getIO();
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`📡 Global broadcast ${event}`);
  } catch (error) {
    console.error('WebSocket broadcast error:', error);
  }
};