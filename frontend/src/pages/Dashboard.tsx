import { useState } from 'react';
import { useServices } from '../hooks/useServices';
import { getServiceStatusText } from '../lib/utils';
import type { Service } from '../types';  // Add 'type' here

// Hardcoded org ID for now (replace with context later)
const ORG_ID = 'cmlahot3g0000109tmyku278d';

export default function Dashboard() {
  const { services, loading, error, createService, updateService, deleteService } = useServices(ORG_ID);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'OPERATIONAL' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService(formData);
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', description: '', status: 'OPERATIONAL' });
    } catch (err) {
      alert('Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      status: service.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await deleteService(id);
    }
  };

  const handleStatusChange = async (service: Service, newStatus: string) => {
    await updateService(service.id, { status: newStatus as any });
  };

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Services Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#999' }}>No services yet. Create your first service!</p>
        </div>
      ) : (
        <div className="grid">
          {services.map((service) => (
            <div key={service.id} className="card">
              <div className="card-header">
                <h3>{service.name}</h3>
                <span className={`badge badge-${service.status.toLowerCase()}`}>
                  {getServiceStatusText(service.status)}
                </span>
              </div>
              
              <p style={{ color: '#666', marginBottom: '16px' }}>
                {service.description || 'No description'}
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#999' }}>Change Status:</label>
                <select
                  value={service.status}
                  onChange={(e) => handleStatusChange(service, e.target.value)}
                  style={{ marginBottom: 0 }}
                >
                  <option value="OPERATIONAL">Operational</option>
                  <option value="DEGRADED_PERFORMANCE">Degraded Performance</option>
                  <option value="PARTIAL_OUTAGE">Partial Outage</option>
                  <option value="MAJOR_OUTAGE">Major Outage</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => handleEdit(service)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(service.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Create Service'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Service Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., API Server"
              />

              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service"
                rows={3}
              />

              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="OPERATIONAL">Operational</option>
                <option value="DEGRADED_PERFORMANCE">Degraded Performance</option>
                <option value="PARTIAL_OUTAGE">Partial Outage</option>
                <option value="MAJOR_OUTAGE">Major Outage</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              </select>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}