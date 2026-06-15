import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { HiArrowUpTray, HiDocumentText } from 'react-icons/hi2';
import { api } from '../../services/api';
import { useAppStore } from '../../store/appStore';

const DocumentUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{file: string, status: string}>({ file: '', status: '' });
  const { addDocument } = useAppStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        setUploading(true);
        setProgress({ file: file.name, status: 'Uploading & Indexing...' });
        const doc = await api.uploadDocument(file);
        addDocument(doc);
      } catch (e) {
        console.error('Upload failed', e);
        // show error toast ideally
      } finally {
        setUploading(false);
        setProgress({ file: '', status: '' });
      }
    }
  }, [addDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    }
  });

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div 
        {...getRootProps()} 
        className={`glass-card flex-center ${isDragActive ? 'active-drop' : ''}`}
        style={{ 
          padding: '3rem', 
          borderStyle: 'dashed', 
          borderWidth: '2px',
          borderColor: isDragActive ? 'var(--accent-cyan)' : 'var(--border)',
          background: isDragActive ? 'rgba(0, 210, 255, 0.05)' : 'var(--glass)',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <input {...getInputProps()} />
        <HiArrowUpTray size={48} color={isDragActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          {isDragActive ? 'Drop files here' : 'Drag & drop documents here'}
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>Supports PDF, DOCX, TXT, MD</p>
        
        <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Browse Files
        </button>
      </div>

      {uploading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <div className="animate-pulse" style={{ background: 'var(--accent-cyan)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <HiDocumentText color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 500 }}>{progress.file}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{progress.status}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
               <motion.div 
                 initial={{ width: '0%' }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 2, repeat: Infinity }}
                 style={{ height: '100%', background: 'var(--gradient-accent)' }}
               />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentUpload;
