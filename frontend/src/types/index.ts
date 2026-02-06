export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: ServiceStatus;
  order: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    incidents: number;
  };
}

export type ServiceStatus =
  | 'OPERATIONAL'
  | 'DEGRADED_PERFORMANCE'
  | 'PARTIAL_OUTAGE'
  | 'MAJOR_OUTAGE'
  | 'UNDER_MAINTENANCE';

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: Impact;
  serviceId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  service?: Service;
  updates?: IncidentUpdate[];
}

export type IncidentStatus =
  | 'INVESTIGATING'
  | 'IDENTIFIED'
  | 'MONITORING'
  | 'RESOLVED';

export type Impact = 'MINOR' | 'MAJOR' | 'CRITICAL';

export interface IncidentUpdate {
  id: string;
  message: string;
  status: IncidentStatus;
  incidentId: string;
  createdAt: string;
}

export interface PublicStatusResponse {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  overallStatus: string;
  services: Service[];
  activeIncidents: Incident[];
  lastUpdated: string;
}