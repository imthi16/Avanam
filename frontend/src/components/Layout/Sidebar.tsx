import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiChatBubbleLeftRight, HiDocumentText, HiChartBar, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useAppStore } from '../../store/appStore';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, health } = useAppStore();

  const navItems = [
    { path: '/', icon: <HiChatBubbleLeftRight size={24} />, label: 'Chat' },
    { path: '/documents', icon: <HiDocumentText size={24} />, label: 'Documents' },
    { path: '/dashboard', icon: <HiChartBar size={24} />, label: 'Dashboard' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      <div style={{ padding: '1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', height: '72px' }}>
        <div style={{ fontSize: '1.5rem' }}>🏛️</div>
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.05em' }} className="text-gradient">
            AVANAM
          </motion.div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              textDecoration: 'none',
              marginBottom: '0.5rem',
              transition: 'all 0.2s',
            })}
          >
            <div style={{ display: 'flex', justifyContent: 'center', width: '32px' }}>
              {item.icon}
            </div>
            {!sidebarCollapsed && (
              <span style={{ marginLeft: '0.75rem', fontWeight: 500 }}>{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: health?.status === 'healthy' ? 'var(--success)' : 'var(--error)', boxShadow: `0 0 8px ${health?.status === 'healthy' ? 'var(--success)' : 'var(--error)'}` }} />
            {health?.status === 'healthy' ? 'Connected' : 'Disconnected'}
          </div>
        )}
        <button onClick={toggleSidebar} className="btn-icon" style={{ padding: '0.25rem' }}>
          {sidebarCollapsed ? <HiChevronRight size={20} /> : <HiChevronLeft size={20} />}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
