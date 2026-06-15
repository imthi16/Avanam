import React, { useEffect, useState } from 'react';
import type { Chunk } from '../../types';

interface Props {
  documentId: string;
}

const ChunkViewer: React.FC<Props> = ({ documentId }) => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would fetch actual chunks here if the endpoint returned them.
    // Since our MVP endpoint returns an empty array, we'll simulate a couple chunks for demo purposes
    // in the real app this would be: api.getChunks(documentId).then(...)
    
    setTimeout(() => {
      setChunks([
        { index: 0, content: "This is a simulated chunk of text from the document. In a full implementation, this would show the exact text extracted from the file, embedded, and stored in FAISS.", metadata: { source: "Simulated" }, char_count: 165 },
        { index: 1, content: "Another simulated chunk. This helps visualize how the document was split into overlapping segments to preserve context for the RAG pipeline.", metadata: { source: "Simulated" }, char_count: 140 }
      ]);
      setLoading(false);
    }, 500);
  }, [documentId]);

  if (loading) {
    return <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading chunks...</div>;
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Document Chunks</h5>
      
      {chunks.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No chunks available.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {chunks.map((chunk, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                <span className="badge badge-neutral">Chunk {chunk.index}</span>
                <span style={{ color: 'var(--text-muted)' }}>{chunk.char_count} chars</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, opacity: 0.9 }}>
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChunkViewer;
