import { useIncidents } from '../hooks/useIncidents';
import { useServices } from '../hooks/useServices';
import { formatDate } from '../lib/utils';
import { Incident } from '../types';

const ORG_ID = 'cmlahot3g0000109tmyku278d';

export default function IncidentsList() {
  const navigate = useNavigate();
  const { incidents, loading, error, createIncident } = useIncidents(ORG_ID);
  const { services } = useServices(ORG_ID);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    serviceId: '',
    impact: 'MINOR' as const,
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncident(formData);
      setShowModal(false);
      setFormData({ title: '', serviceId: '', impact: 'MINOR', message: '' });
    } catch (err) {
      alert('Failed to create incident');
    }
  };

  if (loading) return <div className="loading">Loading incidents...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Incidents</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Report Incident
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#999' }}>No incidents reported. All systems operational!</p>
        </div>
      ) : (
        incidents.map((incident) => (
          <div
            key={incident.id}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/incidents/${incident.id}`)}
          >
            <div className="card-header">
              <h3>{incident.title}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge badge-${incident.status.toLowerCase()}`}>
                  {incident.status}
                </span>
                <span className={`badge badge-${incident.impact.toLowerCase()}`}>
                  {incident.impact} Impact
                </span>
              </div>
            </div>

            <p style={{ color: '#666', marginBottom: '8px' }}>
              Service: {incident.service?.name || 'Unknown'}
            </p>

            <p style={{ fontSize: '14px', color: '#999' }}>
              Created: {formatDate(incident.createdAt)}
            </p>

            {incident.updates && incident.updates.length > 0 && (
              <p style={{ marginTop: '12px', fontSize: '14px', fontStyle: 'italic' }}>
                Latest: {incident.updates[0].message}
              </p>
            )}
          </div>
        ))
      )}

      {/* Create Incident Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Incident</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Incident Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., API Server experiencing high latency"
              />

              <label>Affected Service *</label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                required
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>

              <label>Impact Level</label>
              <select
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
              >
                <option value="MINOR">Minor</option>
                <option value="MAJOR">Major</option>
                <option value="CRITICAL">Critical</option>
              </select>

              <label>Initial Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe what's happening..."
                rows={3}
              />

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">
                  Create Incident
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