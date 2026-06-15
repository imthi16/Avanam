import React, { useState } from 'react';
import type { Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { HiDocumentCheck } from 'react-icons/hi2';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7, fontSize: '0.85rem', marginLeft: isUser ? 0 : '1rem', marginRight: isUser ? '1rem' : 0 }}>
        <span>{isUser ? 'You' : 'Avanam'}</span>
        <span>•</span>
        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div
        className={isUser ? '' : 'glass-card'}
        style={{
          maxWidth: '85%',
          padding: isUser ? '1rem 1.25rem' : '1.5rem',
          background: isUser ? 'var(--gradient-primary)' : undefined,
          borderRadius: isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
          color: 'white',
        }}
      >
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : (
          <div className="markdown-body">
            {message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              <div style={{ opacity: 0.5, fontStyle: 'italic' }}>Thinking...</div>
            )}
          </div>
        )}

        {!isUser && message.citations && message.citations.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HiDocumentCheck /> Sources
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {message.citations.map((c) => (
                <div key={c.index} className="badge badge-neutral" style={{ cursor: 'help' }} title={c.content}>
                  [{c.index}] {c.source}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isUser && message.content && (
        <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem', marginTop: '0.25rem' }}>
          {message.confidence !== undefined && (
            <div className={`badge ${message.confidence > 0.8 ? 'badge-success' : message.confidence > 0.5 ? 'badge-warning' : 'badge-error'}`}>
              Confidence: {Math.round(message.confidence * 100)}%
            </div>
          )}
          {message.duration && (
            <div className="badge badge-neutral">
              {message.duration.toFixed(1)}s
            </div>
          )}
          {message.revision_count ? (
            <div className="badge badge-warning">
              {message.revision_count} Revisions
            </div>
          ) : null}
          <button onClick={handleCopy} className="btn-icon" style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
