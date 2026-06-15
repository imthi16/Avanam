import React, { useState } from 'react';
import type { AgentStatus } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiChevronUp, HiCheck, HiXMark } from 'react-icons/hi2';

interface Props {
  name: string;
  icon: string;
  status: AgentStatus;
  isActive: boolean;
}

const AgentCard: React.FC<Props> = ({ name, icon, status, isActive }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status.status) {
      case 'waiting': return 'var(--text-muted)';
      case 'running': return 'var(--accent-cyan)';
      case 'complete': return 'var(--success)';
      case 'revision': return 'var(--warning)';
      case 'error': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusIcon = () => {
    if (status.status === 'complete') return <HiCheck size={14} />;
    if (status.status === 'error') return <HiXMark size={14} />;
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '200px' }}>
      {/* Icon Circle */}
      <motion.div
        animate={{ 
          scale: isActive ? 1.1 : 1,
          boxShadow: isActive ? `0 0 20px ${getStatusColor()}40` : 'none',
          borderColor: getStatusColor()
        }}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--bg-surface)',
          border: `2px solid ${getStatusColor()}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '1rem',
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {icon}
        {getStatusIcon() && (
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            background: getStatusColor(),
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getStatusIcon()}
          </div>
        )}
      </motion.div>

      {/* Title */}
      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {name}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '80%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${status.progress}%` }}
          style={{ height: '100%', background: getStatusColor() }}
        />
      </div>

      {/* Step Text */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', minHeight: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {status.step || (status.status === 'waiting' ? 'Waiting' : '')}
      </div>

      {/* Details Toggle */}
      {Object.keys(status.data || {}).length > 0 && (
        <button className="btn-icon" style={{ padding: '0.25rem', marginTop: '0.5rem' }} onClick={() => setExpanded(!expanded)}>
          {expanded ? <HiChevronUp /> : <HiChevronDown />}
        </button>
      )}

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && Object.keys(status.data || {}).length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ width: '100%', overflow: 'hidden', marginTop: '0.5rem' }}
          >
            <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', border: '1px solid var(--border)', textAlign: 'left' }}>
              {Object.entries(status.data).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{key.replace(/_/g, ' ')}:</span>{' '}
                  <span style={{ color: 'var(--accent-cyan)' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentCard;
