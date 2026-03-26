'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '@/lib/vendimia-types';
import { taskLabels } from '@/lib/vendimia-data';
import { AvatarPortrait, ProgressBar, GrapeIcon, WateringCanIcon, PruningIcon, BarrelIcon, BottleIcon, WineGlassIcon } from './sprites';

interface AgentsSidebarProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
}

// Task icon component
function TaskIconSmall({ task }: { task: string }) {
  const iconMap: Record<string, React.FC<{ size?: number }>> = {
    cosecha: GrapeIcon,
    riego: WateringCanIcon,
    poda: PruningIcon,
    fermentacion: BarrelIcon,
    embotellado: BottleIcon,
    cata: WineGlassIcon,
  };
  const Icon = iconMap[task] || GrapeIcon;
  return <Icon size={14} />;
}

export function AgentsSidebar({ agents, selectedAgent, onAgentSelect }: AgentsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showSidebar = isOpen || !isMobile;

  return (
    <>
      {/* Toggle Button for mobile */}
      <motion.button
        className="absolute top-4 right-4 z-30 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        style={{
          backgroundColor: '#3d3530',
          border: '2px solid #4a3728',
          padding: '8px 12px',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
        }}
      >
        <span 
          style={{ 
            fontFamily: 'var(--font-vt323)',
            color: '#f5f0e1',
            fontSize: '14px'
          }}
        >
          Avatar
        </span>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            className="absolute top-4 right-4 z-20 md:top-4 md:right-4"
            initial={{ x: isMobile ? 100 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div 
              className="w-48 overflow-hidden"
              style={{
                backgroundColor: '#3d3530',
                border: '3px solid #4a3728',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.3)'
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between px-3 py-2"
                style={{ 
                  backgroundColor: '#4a3728',
                  borderBottom: '2px solid #2a1f18'
                }}
              >
                <span 
                  style={{ 
                    fontFamily: 'var(--font-vt323)',
                    color: '#f5f0e1',
                    fontSize: '16px',
                    letterSpacing: '1px'
                  }}
                >
                  Avatar
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden hover:opacity-80"
                  style={{ color: '#f5f0e1' }}
                >
                  x
                </button>
              </div>

              {/* Agents List */}
              <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                {agents.map((agent, index) => {
                  const taskInfo = taskLabels[agent.task];
                  const isSelected = selectedAgent?.id === agent.id;
                  
                  return (
                    <motion.button
                      key={agent.id}
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * index }}
                      onClick={() => {
                        onAgentSelect(agent);
                        if (isMobile) setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? '#5a4a3a' : 'transparent',
                        borderLeft: isSelected ? '3px solid #8b5cf6' : '3px solid transparent'
                      }}
                    >
                      {/* Avatar portrait SVG */}
                      <AvatarPortrait 
                        skinColor={agent.skinColor || '#e8c39e'}
                        hairColor={agent.hairColor || '#5c3d2e'}
                        shirtColor={agent.shirtColor || '#4a6fa5'}
                        size={32}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="truncate"
                          style={{ 
                            fontFamily: 'var(--font-vt323)',
                            color: '#f5f0e1',
                            fontSize: '14px'
                          }}
                        >
                          {agent.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <TaskIconSmall task={agent.task} />
                        </div>
                      </div>

                      {/* Progress bar mini using SVG */}
                      <ProgressBar 
                        progress={agent.progress} 
                        color={agent.color}
                        width={48}
                        height={6}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <motion.div
          className="fixed inset-0 z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
