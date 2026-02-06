import { ServiceStatus, IncidentStatus, Impact } from '../types';

export function formatDate(date: string): string {
  return new Date(date).toLocaleString();
}

export function getServiceStatusColor(status: ServiceStatus): string {
  const colors = {
    OPERATIONAL: 'operational',
    DEGRADED_PERFORMANCE: 'degraded',
    PARTIAL_OUTAGE: 'outage',
    MAJOR_OUTAGE: 'outage',
    UNDER_MAINTENANCE: 'maintenance',
  };
  return colors[status] || 'operational';
}

export function getServiceStatusText(status: ServiceStatus): string {
  const text = {
    OPERATIONAL: 'Operational',
    DEGRADED_PERFORMANCE: 'Degraded Performance',
    PARTIAL_OUTAGE: 'Partial Outage',
    MAJOR_OUTAGE: 'Major Outage',
    UNDER_MAINTENANCE: 'Under Maintenance',
  };
  return text[status] || status;
}

export function getIncidentStatusColor(status: IncidentStatus): string {
  const colors = {
    INVESTIGATING: 'investigating',
    IDENTIFIED: 'identified',
    MONITORING: 'monitoring',
    RESOLVED: 'resolved',
  };
  return colors[status] || 'investigating';
}

export function getImpactColor(impact: Impact): string {
  const colors = {
    MINOR: 'minor',
    MAJOR: 'major',
    CRITICAL: 'critical',
  };
  return colors[impact] || 'minor';
}