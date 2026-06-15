import { create } from 'zustand';
import type { Message, Document, HealthInfo, QueryStats, PipelineStatus, AgentStatus, AgentEvent } from '../types';

const defaultAgentStatus: AgentStatus = {
  status: 'waiting',
  progress: 0,
  step: '',
  data: {}
};

interface AppState {
  messages: Message[];
  isProcessing: boolean;
  addMessage: (msg: Message) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  setProcessing: (v: boolean) => void;
  
  pipelineStatus: PipelineStatus;
  updateAgentStatus: (agent: string, status: Partial<AgentStatus>) => void;
  addPipelineEvent: (event: AgentEvent) => void;
  resetPipeline: () => void;
  
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  
  health: HealthInfo | null;
  stats: QueryStats | null;
  setHealth: (h: HealthInfo) => void;
  setStats: (s: QueryStats) => void;
  
  currentPage: 'chat' | 'documents' | 'dashboard';
  setCurrentPage: (page: 'chat' | 'documents' | 'dashboard') => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  messages: [],
  isProcessing: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateLastMessage: (updates) => set((state) => {
    if (state.messages.length === 0) return state;
    const newMessages = [...state.messages];
    newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], ...updates };
    return { messages: newMessages };
  }),
  setProcessing: (v) => set({ isProcessing: v }),
  
  pipelineStatus: {
    retriever: { ...defaultAgentStatus },
    analyst: { ...defaultAgentStatus },
    critic: { ...defaultAgentStatus },
    formatter: { ...defaultAgentStatus }
  },
  updateAgentStatus: (agent, status) => set((state) => ({
    pipelineStatus: {
      ...state.pipelineStatus,
      [agent]: { ...(state.pipelineStatus as any)[agent], ...status }
    }
  })),
  addPipelineEvent: (event) => set((state) => {
    if (state.messages.length === 0) return state;
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg.role !== 'assistant') return state;
    
    const events = lastMsg.agentEvents || [];
    return {
      messages: [
        ...state.messages.slice(0, -1),
        { ...lastMsg, agentEvents: [...events, event] }
      ]
    };
  }),
  resetPipeline: () => set({
    pipelineStatus: {
      retriever: { ...defaultAgentStatus },
      analyst: { ...defaultAgentStatus },
      critic: { ...defaultAgentStatus },
      formatter: { ...defaultAgentStatus }
    }
  }),
  
  documents: [],
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  removeDocument: (id) => set((state) => ({ documents: state.documents.filter(d => d.id !== id) })),
  
  health: null,
  stats: null,
  setHealth: (h) => set({ health: h }),
  setStats: (s) => set({ stats: s }),
  
  currentPage: 'chat',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}));
