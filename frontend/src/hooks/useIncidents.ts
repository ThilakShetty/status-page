import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Incident } from '../types';  // Add 'type' here

export const useIncidents = (organizationId: string) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/organizations/${organizationId}/incidents`);
      setIncidents(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchIncidents();
    }
  }, [organizationId]);

  const createIncident = async (data: Partial<Incident> & { message?: string }) => {
    const response = await api.post(`/organizations/${organizationId}/incidents`, data);
    setIncidents([response.data, ...incidents]);
    return response.data;
  };

  const updateIncident = async (id: string, data: Partial<Incident>) => {
    const response = await api.patch(`/incidents/${id}`, data);
    setIncidents(incidents.map(i => i.id === id ? response.data : i));
    return response.data;
  };

  const addUpdate = async (incidentId: string, message: string, status: string) => {
    const response = await api.post(`/incidents/${incidentId}/updates`, { message, status });
    // Refresh incidents to get the new update
    fetchIncidents();
    return response.data;
  };

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    addUpdate,
  };
};