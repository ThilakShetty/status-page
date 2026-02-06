import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import type { PublicStatusResponse } from '../types';  // Add 'type' here
import { getServiceStatusText, formatDate } from '../lib/utils';

export default function PublicStatus() {
    const { slug } = useParams<{ slug: string }>();  // Add type here
  const [data, setData] = useState<PublicStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      console.error('No slug provided');
      setLoading(false);
      return;
    }
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/public/status/${slug}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading status...</div>;
  if (!data) return <div className="error">Status page not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{data.organization.name}</h1>
        <p style={{ fontSize: '20px', color: data.overallStatus.includes('Operational') ? '#2e7d32' : '#f57c00' }}>
          {data.overallStatus}
        </p>
        <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
          Last updated: {formatDate(data.lastUpdated)}
        </p>
      </div>

      <h2 style={{ marginBottom: '16px' }}>Services</h2>
      {data.services.map((service) => (
        <div key={service.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '4px' }}>{service.name}</h3>
              {service.description && (
                <p style={{ fontSize: '14px', color: '#666' }}>{service.description}</p>
              )}
            </div>
            <span className={`badge badge-${service.status.toLowerCase()}`}>
              {getServiceStatusText(service.status)}
            </span>
          </div>
        </div>
      ))}

      {data.activeIncidents.length > 0 && (
        <>
          <h2 style={{ marginTop: '48px', marginBottom: '16px' }}>Active Incidents</h2>
          {data.activeIncidents.map((incident) => (
            <div key={incident.id} className="card">
              <div className="card-header">
                <h3>{incident.title}</h3>
                <span className={`badge badge-${incident.status.toLowerCase()}`}>
                  {incident.status}
                </span>
              </div>
              
              <p style={{ fontSize: '14px', color: '#999', marginBottom: '12px' }}>
                {formatDate(incident.createdAt)}
              </p>

              {incident.updates && incident.updates.length > 0 && (
                <div style={{ borderLeft: '3px solid #e5e5e5', paddingLeft: '16px', marginTop: '16px' }}>
                  {incident.updates.slice(0, 3).map((update) => (
                    <div key={update.id} style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#999' }}>{formatDate(update.createdAt)}</p>
                      <p style={{ fontSize: '14px' }}>{update.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}