import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import MessageBubble from './MessageBubble';
import QueryInput from './QueryInput';
import PipelineVisualizer from '../AgentProgress/PipelineVisualizer';
import { motion } from 'framer-motion';

const ChatView: React.FC = () => {
  const { messages, isProcessing } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)' }}>
      {messages.length === 0 ? (
        <div className="flex-center" style={{ flex: 1, flexDirection: 'column', padding: '2rem' }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            style={{ textAlign: 'center', maxWidth: '600px' }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="text-gradient">Welcome to Avanam</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem' }}>
              Upload documents and ask intelligent questions. Our multi-agent RAG pipeline will research, analyze, and fact-check to give you the best answers.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
              {['Summarize the key findings in the latest report.', 'What are the main risks mentioned in the documents?', 'Compare the revenue figures across Q1 and Q2.', 'Explain the methodology used in the research paper.'].map((suggestion, i) => (
                <div key={i} className="glass-card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => {/* Handle click to input */}}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{suggestion}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isProcessing && (
            <div style={{ paddingBottom: '2rem' }}>
               <PipelineVisualizer />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        <QueryInput />
      </div>
    </div>
  );
};

export default ChatView;
