'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Agent } from '@/lib/vendimia-types';
import { AgentSprite } from './agent-sprite';

interface GameWorldProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentClick: (agent: Agent) => void;
  currentScene?: string;
}

// Scene backgrounds
const sceneBackgrounds: Record<string, string> = {
  'plaza-central': '/scenes/plaza-central.jpg',
};

export function GameWorld({ agents, selectedAgent, onAgentClick, currentScene = 'plaza-central' }: GameWorldProps) {
  const backgroundImage = sceneBackgrounds[currentScene];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Scene Background Image */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={`Escena: ${currentScene}`}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: '#c9b896' }}
        />
      )}

      {/* Agents - positioned on top of the scene */}
      {agents.map((agent) => (
        <AgentSprite
          key={agent.id}
          agent={agent}
          isSelected={selectedAgent?.id === agent.id}
          onClick={() => onAgentClick(agent)}
        />
      ))}

      {/* Scene Label */}
      <motion.div 
        className="absolute bottom-4 left-4 z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div 
          className="px-3 py-1"
          style={{
            backgroundColor: 'rgba(74, 55, 40, 0.9)',
            border: '2px solid #2a1f18',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.3)'
          }}
        >
          <span 
            className="text-xs font-bold uppercase tracking-wider"
            style={{ 
              fontFamily: 'var(--font-vt323)',
              color: '#f5f0e1'
            }}
          >
            Plaza Central
          </span>
        </div>
      </motion.div>
    </div>
  );
}
