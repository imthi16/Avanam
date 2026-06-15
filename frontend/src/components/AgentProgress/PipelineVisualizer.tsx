import React from 'react';
import { useAppStore } from '../../store/appStore';
import AgentCard from './AgentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowPath } from 'react-icons/hi2';

const PipelineVisualizer: React.FC = () => {
  const { pipelineStatus } = useAppStore();

  const agents = [
    { id: 'retriever', name: 'Retriever', icon: '🔍' },
    { id: 'analyst', name: 'Analyst', icon: '📊' },
    { id: 'critic', name: 'Critic', icon: '🧪' },
    { id: 'formatter', name: 'Formatter', icon: '📝' }
  ] as const;

  const isRevising = pipelineStatus.critic.status === 'revision';

  return (
    <div className="glass-card" style={{ padding: '1.5rem', margin: '1rem 0' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="animate-pulse" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
        Agent Pipeline Running
      </h3>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        {/* Connection Lines Background */}
        <div style={{ position: 'absolute', top: '32px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 0 }} />

        {/* Revision Loop Indicator */}
        <AnimatePresence>
          {isRevising && (
            <motion.div
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '-40px', left: '35%', right: '35%', height: '40px', zIndex: 1, display: 'flex', justifyContent: 'center' }}
            >
              <svg width="100%" height="40px" style={{ overflow: 'visible' }}>
                <motion.path
                  d="M 100% 40 Q 50% -20 0 40"
                  fill="transparent"
                  stroke="var(--warning)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </svg>
              <div className="badge badge-warning" style={{ position: 'absolute', top: '-10px', background: 'var(--bg-secondary)', border: '1px solid var(--warning)' }}>
                <HiArrowPath style={{ marginRight: '4px' }} /> Revision Loop
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Cards */}
        {agents.map((agent) => (
          <div key={agent.id} style={{ zIndex: 2, flex: 1, display: 'flex', justifyContent: 'center' }}>
            <AgentCard
              name={agent.name}
              icon={agent.icon}
              status={pipelineStatus[agent.id]}
              isActive={pipelineStatus[agent.id].status === 'running'}
            />
          </div>
        ))}

      </div>
    </div>
  );
};

export default PipelineVisualizer;
