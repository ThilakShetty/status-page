import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Incident } from '../types';  // Add 'type' here
import { formatDate } from '../lib/utils';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('INVESTIGATING');

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      const response = await api.get(`/incidents/${id}`);
      setIncident(response.data);
      setUpdateStatus(response.data.status);
    } catch (err) {
      alert('Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/incidents/${id}/updates`, {
        message: updateMessage,
        status: updateStatus,
      });
      setUpdateMessage('');
      fetchIncident(); // Refresh to see new update
    } catch (err) {
      alert('Failed to add update');
    }
  };

  const handleResolve = async () => {
    try {
      await api.patch(`/incidents/${id}`, { status: 'RESOLVED' });
      fetchIncident();
    } catch (err) {
      alert('Failed to resolve incident');
    }
  };

  if (loading) return <div className="loading">Loading incident...</div>;
  if (!incident) return <div className="error">Incident not found</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/incidents')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Incidents
      </button>

      <div className="card">
        <div className="card-header">
          <h1>{incident.title}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className={`badge badge-${incident.status.toLowerCase()}`}>
              {incident.status}
            </span>
            <span className={`badge badge-${incident.impact.toLowerCase()}`}>
              {incident.impact} Impact
            </span>
          </div>
        </div>

        <p style={{ color: '#666', marginBottom: '16px' }}>
          Service: {incident.service?.name || 'Unknown'}
        </p>

        <p style={{ fontSize: '14px', color: '#999' }}>
          Created: {formatDate(incident.createdAt)}
        </p>

        {incident.resolvedAt && (
          <p style={{ fontSize: '14px', color: '#2e7d32' }}>
            Resolved: {formatDate(incident.resolvedAt)}
          </p>
        )}

        {incident.status !== 'RESOLVED' && (
          <button className="btn btn-primary" onClick={handleResolve} style={{ marginTop: '16px' }}>
            Mark as Resolved
          </button>
        )}
      </div>

      {/* Timeline */}
      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Timeline</h2>
      
      {incident.updates && incident.updates.length > 0 ? (
        <div>
          {incident.updates.map((update, index) => (
            <div key={update.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <span className={`badge badge-${update.status.toLowerCase()}`}>
                  {update.status}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {formatDate(update.createdAt)}
                </span>
              </div>
              <p>{update.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p style={{ color: '#999' }}>No updates yet</p>
        </div>
      )}

      {/* Add Update Form */}
      {incident.status !== 'RESOLVED' && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add Update</h3>
          <form onSubmit={handleAddUpdate}>
            <label>Status</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
            >
              <option value="INVESTIGATING">Investigating</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <label>Message *</label>
            <textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              required
              placeholder="Provide an update on the incident..."
              rows={3}
            />

            <button type="submit" className="btn btn-primary">
              Post Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
}