import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../services/api';
import DocumentUpload from './DocumentUpload';
import ChunkViewer from './ChunkViewer';
import { HiDocument, HiTrash, HiMagnifyingGlass } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentList: React.FC = () => {
  const { documents, setDocuments, removeDocument } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  useEffect(() => {
    api.getDocuments()
      .then(data => {
        setDocuments(data.documents);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [setDocuments]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document and its vectors?')) return;
    
    try {
      await api.deleteDocument(id);
      removeDocument(id);
      if (expandedDoc === id) setExpandedDoc(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDocs = documents.filter(d => d.filename.toLowerCase().includes(search.toLowerCase()));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <DocumentUpload />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Document Library</h2>
        
        <div className="input-group" style={{ position: 'relative', width: '300px' }}>
          <HiMagnifyingGlass style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Search documents..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>
          <div className="animate-pulse">Loading documents...</div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-card flex-center" style={{ padding: '4rem', flexDirection: 'column', textAlign: 'center' }}>
          <HiDocument size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No documents found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Upload some documents to start querying them.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredDocs.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card"
                style={{ overflow: 'hidden', cursor: 'pointer', border: expandedDoc === doc.id ? '1px solid var(--accent-cyan)' : undefined }}
                onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
              >
                <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)',
                    color: doc.file_type.includes('pdf') ? 'var(--error)' : 'var(--accent-cyan)'
                  }}>
                    <HiDocument size={24} />
                  </div>
                  
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.filename}>
                      {doc.filename}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{formatSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="badge badge-neutral">
                    {doc.chunk_count} Chunks
                  </div>
                  <button className="btn-icon" onClick={(e) => handleDelete(doc.id, e)} style={{ color: 'var(--error)' }}>
                    <HiTrash />
                  </button>
                </div>

                <AnimatePresence>
                  {expandedDoc === doc.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <ChunkViewer documentId={doc.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
