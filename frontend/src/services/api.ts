import type { Document, Chunk, HealthInfo, QueryStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  getDocuments: async (): Promise<{documents: Document[], total: number}> => {
    const res = await fetch(`${API_URL}/api/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  getDocument: async (id: string): Promise<Document> => {
    const res = await fetch(`${API_URL}/api/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  getChunks: async (id: string): Promise<Chunk[]> => {
    const res = await fetch(`${API_URL}/api/documents/${id}/chunks`);
    if (!res.ok) throw new Error('Failed to fetch chunks');
    return res.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  queryDocuments: async (query: string): Promise<Response> => {
    return fetch(`${API_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
  },

  getQueryHistory: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/api/query/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  getHealth: async (): Promise<HealthInfo> => {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  getStats: async (): Promise<QueryStats> => {
    const res = await fetch(`${API_URL}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
