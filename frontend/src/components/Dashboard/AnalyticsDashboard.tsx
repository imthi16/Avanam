import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { QueryStats } from '../../types';
import { HiChartBar, HiClock, HiDocumentCheck, HiSparkles } from 'react-icons/hi2';

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<QueryStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getQueryHistory()
    ]).then(([statsData, historyData]) => {
      setStats(statsData);
      setHistory(historyData);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100%' }}>
        <div className="animate-pulse text-gradient" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Analytics...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Queries', value: stats?.total_queries || 0, icon: <HiChartBar size={24} />, color: 'var(--accent-cyan)' },
    { title: 'Avg Response Time', value: `${(stats?.avg_response_time || 0).toFixed(2)}s`, icon: <HiClock size={24} />, color: 'var(--warning)' },
    { title: 'Avg Confidence', value: `${Math.round((stats?.avg_confidence || 0) * 100)}%`, icon: <HiSparkles size={24} />, color: 'var(--success)' },
    { title: 'Documents Indexed', value: stats?.documents_indexed || 0, icon: <HiDocumentCheck size={24} />, color: 'var(--accent-violet)' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '2rem' }} className="text-gradient">Performance Analytics</h2>
      
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              background: `${stat.color}20`, 
              color: stat.color,
              width: '48px', height: '48px', 
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{stat.title}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Query History Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Queries</h3>
        </div>
        
        {history.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No queries have been made yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Query</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confidence</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Revisions</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: i === history.length - 1 ? 'none' : '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} className="hover:bg-white/5">
                    <td style={{ padding: '1rem 1.5rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.query}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div className={`badge ${row.confidence_score > 0.8 ? 'badge-success' : row.confidence_score > 0.5 ? 'badge-warning' : 'badge-error'}`}>
                        {Math.round(row.confidence_score * 100)}%
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {row.revision_count > 0 ? (
                        <div className="badge badge-warning">{row.revision_count}</div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
