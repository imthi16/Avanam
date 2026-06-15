import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ChatView from './components/Chat/ChatView';
import DocumentList from './components/Documents/DocumentList';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import { useAppStore } from './store/appStore';
import { api } from './services/api';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();
  
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: sidebarCollapsed ? '64px' : '240px',
        transition: 'margin-left 0.3s ease'
      }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const { setHealth } = useAppStore();

  useEffect(() => {
    // Initial health check
    api.getHealth()
      .then(setHealth)
      .catch(console.error);
  }, [setHealth]);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<ChatView />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/dashboard" element={<AnalyticsDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
