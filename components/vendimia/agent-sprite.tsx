'use client';

import { motion } from 'framer-motion';
import type { Agent } from '@/lib/vendimia-types';
import { WorkerSprite, TaskLabel } from './sprites';

interface AgentSpriteProps {
  agent: Agent;
  onClick?: () => void;
  isSelected?: boolean;
}

export function AgentSprite({ agent, onClick, isSelected }: AgentSpriteProps) {
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ 
        left: `${agent.x}%`, 
        top: `${agent.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 20 : 10
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -3, 0]
      }}
      transition={{
        scale: { duration: 0.3 },
        y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      {/* Task Label - Using pixel art SVG icons */}
      <motion.div 
        className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TaskLabel task={agent.task} progress={agent.progress} />
        {/* Pixel arrow pointing down */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
          style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #4a3728'
          }}
        />
      </motion.div>

      {/* Agent Avatar - Pixel art SVG worker */}
      <motion.div 
        className="relative"
        animate={isSelected ? {
          filter: ['drop-shadow(0 0 4px #ffd700)', 'drop-shadow(0 0 8px #ffd700)', 'drop-shadow(0 0 4px #ffd700)']
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <WorkerSprite
          skinColor={agent.skinColor || '#e8c39e'}
          hairColor={agent.hairColor || '#5c3d2e'}
          shirtColor={agent.shirtColor || '#4a6fa5'}
          size={44}
          isWorking={agent.task === 'cosecha' || agent.task === 'poda' || agent.task === 'riego'}
        />
        
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full"
            style={{ backgroundColor: 'rgba(255, 215, 0, 0.6)' }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Name tooltip on hover */}
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span 
          className="text-sm px-2 py-0.5 whitespace-nowrap"
          style={{ 
            fontFamily: 'var(--font-vt323)',
            backgroundColor: '#2a1f18',
            color: '#f5f0e1',
            border: '1px solid #4a3728',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.3)'
          }}
        >
          {agent.name}
        </span>
      </div>
    </motion.div>
  );
}
