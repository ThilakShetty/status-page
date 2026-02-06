import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Service } from '../types';  // Add 'type' here

export const useServices = (organizationId: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/organizations/${organizationId}/services`);
      setServices(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchServices();
    }
  }, [organizationId]);

  const createService = async (data: Partial<Service>) => {
    const response = await api.post(`/organizations/${organizationId}/services`, data);
    setServices([...services, response.data]);
    return response.data;
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    const response = await api.patch(`/services/${id}`, data);
    setServices(services.map(s => s.id === id ? response.data : s));
    return response.data;
  };

  const deleteService = async (id: string) => {
    await api.delete(`/services/${id}`);
    setServices(services.filter(s => s.id !== id));
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};