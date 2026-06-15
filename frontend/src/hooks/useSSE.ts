import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAppStore } from '../store/appStore';
import type { AgentEvent } from '../types';

export function useSSE() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAgentStatus, resetPipeline, addMessage, updateLastMessage, addPipelineEvent, setProcessing } = useAppStore();

  const startQuery = useCallback(async (query: string) => {
    setIsStreaming(true);
    setError(null);
    resetPipeline();
    setProcessing(true);

    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    });

    // Add empty assistant message to hold updates
    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      agentEvents: [],
      timestamp: new Date()
    });

    try {
      const response = await api.queryDocuments(query);
      if (!response.body) throw new Error('ReadableStream not supported in this browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || ''; // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;
            
            try {
              const event: AgentEvent = JSON.parse(dataStr);
              addPipelineEvent(event);
              
              if (event.agent !== 'pipeline') {
                updateAgentStatus(event.agent, {
                  status: event.status as any,
                  progress: event.progress,
                  step: event.step,
                  data: event.data
                });
              } else if (event.agent === 'pipeline' && event.status === 'complete') {
                // Final result
                if (event.data.final_response) {
                  updateLastMessage({
                    content: event.data.final_response,
                    citations: event.data.citations || [],
                    confidence: event.data.confidence_score,
                    duration: event.data.duration
                  });
                }
              } else if (event.status === 'error') {
                 updateLastMessage({
                  content: `Error: ${event.data.error || 'Unknown error occurred'}`,
                 });
                 setError(event.data.error);
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
      }
    } catch (e: any) {
      console.error('SSE Error:', e);
      setError(e.message || 'An error occurred during streaming');
      updateLastMessage({ content: `**Error:** ${e.message}` });
    } finally {
      setIsStreaming(false);
      setProcessing(false);
    }
  }, [addMessage, updateLastMessage, updateAgentStatus, resetPipeline, addPipelineEvent, setProcessing]);

  return { isStreaming, error, startQuery };
}
