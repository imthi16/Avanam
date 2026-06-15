export interface AgentEvent {
  agent: 'retriever' | 'analyst' | 'critic' | 'formatter' | 'pipeline';
  status: 'waiting' | 'running' | 'complete' | 'error' | 'revision';
  step: string;
  progress: number;
  data: Record<string, any>;
  timestamp: string;
}

export interface Citation {
  index: number;
  source: string;
  content: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: number;
  duration?: number;
  revision_count?: number;
  agentEvents?: AgentEvent[];
  timestamp: Date;
}

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  upload_date: string;
  status: string;
}

export interface Chunk {
  index: number;
  content: string;
  metadata: Record<string, any>;
  char_count: number;
}

export interface PipelineStatus {
  retriever: AgentStatus;
  analyst: AgentStatus;
  critic: AgentStatus;
  formatter: AgentStatus;
}

export interface AgentStatus {
  status: 'waiting' | 'running' | 'complete' | 'error' | 'revision';
  progress: number;
  step: string;
  data: Record<string, any>;
  startTime?: number;
  endTime?: number;
}

export interface HealthInfo {
  status: string;
  version: string;
  faiss_vectors: number;
  documents_count: number;
  uptime: number;
}

export interface QueryStats {
  total_queries: number;
  avg_response_time: number;
  avg_confidence: number;
  documents_indexed: number;
}
