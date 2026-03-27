'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/lib/vendimia-types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const getMessageColor = (type: ChatMessage['type']) => {
    switch (type) {
      case 'celebration': return '#fbbf24';
      case 'task': return '#a78bfa';
      case 'warning': return '#f87171';
      default: return '#9ca3af';
    }
  };

  const getMessageBullet = (type: ChatMessage['type']) => {
    switch (type) {
      case 'celebration': return '#fbbf24';
      case 'task': return '#a78bfa';
      case 'warning': return '#f87171';
      default: return '#60a5fa';
    }
  };

  return (
    <motion.div 
      className="absolute bottom-0 left-0 right-0 md:right-auto md:w-[420px] z-20"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div 
        className="overflow-hidden"
        style={{
          backgroundColor: 'rgba(35, 30, 25, 0.95)',
          borderTop: '3px solid #4a3728'
        }}
      >
        {/* Messages - always visible, collapsed version */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div 
                className="h-32 md:h-36 overflow-y-auto p-3 space-y-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#4a3728 #2a2520' }}
              >
                {messages.slice(-10).map((msg, index) => (
                  <motion.div
                    key={`chat-msg-${msg.id}-${index}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start gap-2"
                  >
                    {/* Colored bullet */}
                    <div 
                      className="w-2 h-2 mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: getMessageBullet(msg.type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <span 
                        className="text-base"
                        style={{ 
                          fontFamily: 'var(--font-vt323)',
                          color: getMessageColor(msg.type)
                        }}
                      >
                        [{msg.agentName}]:
                      </span>
                      <span 
                        className="text-base ml-1"
                        style={{ 
                          fontFamily: 'var(--font-vt323)',
                          color: '#e8e0d5'
                        }}
                      >
                        {msg.message}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2"
            >
              {messages.length > 0 && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 flex-shrink-0"
                    style={{ backgroundColor: getMessageBullet(messages[messages.length - 1].type) }}
                  />
                  <span 
                    className="text-sm truncate"
                    style={{ 
                      fontFamily: 'var(--font-vt323)',
                      color: '#9ca3af'
                    }}
                  >
                    [{messages[messages.length - 1].agentName}]: {messages[messages.length - 1].message}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <form 
          onSubmit={handleSubmit} 
          className="flex items-center gap-2 p-2"
          style={{ borderTop: '1px solid #3a3530' }}
        >
          <span 
            className="text-sm px-2"
            style={{ 
              fontFamily: 'var(--font-vt323)',
              color: '#6b6560'
            }}
          >
            Linteg...
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=""
            className="flex-1 px-3 py-1.5 text-base focus:outline-none"
            style={{ 
              fontFamily: 'var(--font-vt323)',
              fontSize: '16px',
              backgroundColor: '#f5f0e1',
              border: '2px solid #4a3728',
              color: '#2a2520'
            }}
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:opacity-80 transition-opacity"
            style={{ color: '#6b6560' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" />
              <rect x="9" y="1" width="6" height="6" />
              <rect x="1" y="9" width="6" height="6" />
              <rect x="9" y="9" width="6" height="6" />
            </svg>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
