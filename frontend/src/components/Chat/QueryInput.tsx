import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { HiPaperAirplane } from 'react-icons/hi2';
import { useAppStore } from '../../store/appStore';
import { useSSE } from '../../hooks/useSSE';

const QueryInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { isProcessing } = useAppStore();
  const { startQuery } = useSSE();

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;
    
    setInput('');
    startQuery(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
      <textarea
        className="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your documents... (Press Enter to send)"
        disabled={isProcessing}
        rows={Math.min(4, input.split('\n').length || 1)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          resize: 'none',
          padding: '0.5rem',
          maxHeight: '120px',
        }}
      />
      <button
        className="btn btn-primary"
        onClick={handleSend}
        disabled={!input.trim() || isProcessing}
        style={{ height: '44px', width: '44px', padding: 0, borderRadius: '50%' }}
      >
        <HiPaperAirplane style={{ transform: 'rotate(-45deg)', marginLeft: '2px', marginBottom: '2px' }} />
      </button>
    </div>
  );
};

export default QueryInput;
