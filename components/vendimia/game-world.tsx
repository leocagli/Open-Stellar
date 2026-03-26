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
          style={{ imageRendering: 'pixelated' }}
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

      {/* Welcome Banner */}
      <motion.div 
        className="absolute top-2 right-16 md:top-4 md:right-56 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <div 
          className="relative px-3 py-2 transform rotate-2"
          style={{
            backgroundColor: '#f5f0e1',
            border: '3px solid #4a3728',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
          }}
        >
          <span 
            className="text-xs md:text-sm font-bold"
            style={{ 
              fontFamily: 'var(--font-vt323)',
              color: '#8b2942',
              letterSpacing: '1px'
            }}
          >
            BIENVENIDOS A MENDOZA
          </span>
          {/* Decorative flags */}
          <div className="absolute -top-3 -left-1 w-2 h-3" style={{ backgroundColor: '#8b2942' }} />
          <div className="absolute -top-3 -right-1 w-2 h-3" style={{ backgroundColor: '#8b2942' }} />
        </div>
      </motion.div>

      {/* Scene Label */}
      <motion.div 
        className="absolute bottom-4 left-4 z-10"
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
