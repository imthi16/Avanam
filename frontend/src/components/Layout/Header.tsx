import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

const Header: React.FC = () => {
  const location = useLocation();
  const { health } = useAppStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Chat Arena';
      case '/documents': return 'Document Library';
      case '/dashboard': return 'Analytics Dashboard';
      default: return 'Avanam';
    }
  };

  return (
    <header style={{
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{getPageTitle()}</h1>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="badge badge-neutral">
          📄 {health?.documents_count || 0} Docs
        </div>
        <div className="badge badge-neutral">
          🔢 {health?.faiss_vectors || 0} Vectors
        </div>
      </div>
    </header>
  );
};

export default Header;
