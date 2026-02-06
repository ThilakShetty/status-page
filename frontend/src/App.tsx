import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IncidentsList from './pages/IncidentsList';
import IncidentDetail from './pages/IncidentDetail';
import PublicStatus from './pages/PublicStatus';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        padding: '16px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>
            Dashboard
          </Link>
          <Link to="/incidents" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>
            Incidents
          </Link>
          <a href="/status/acme-corp" target="_blank" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>
            Public Status →
          </a>
        </div>
      </nav>
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/status/:slug" element={<PublicStatus />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/incidents" element={<Layout><IncidentsList /></Layout>} />
        <Route path="/incidents/:id" element={<Layout><IncidentDetail /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;