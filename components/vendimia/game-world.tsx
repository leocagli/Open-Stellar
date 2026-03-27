'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Agent } from '@/lib/vendimia-types';
import { AgentSprite } from './agent-sprite';
import { 
  FountainSprite, 
  VendimiaBanner, 
  MarketStall, 
  BenchSprite, 
  GrapeFlag, 
  HorseSprite, 
  VineyardRow,
  MountainBackdrop,
  SunSprite,
  WineTableSprite
} from './sprites';

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

      {/* Mountain backdrop - animated parallax */}
      <motion.div 
        className="absolute top-0 left-0 w-full z-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center scale-150 md:scale-200">
          <MountainBackdrop size={256} />
        </div>
      </motion.div>

      {/* Sun - animated in top right */}
      <motion.div 
        className="absolute top-6 right-20 z-10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <SunSprite size={48} />
      </motion.div>

      {/* Vendimia Banner - centered entrance */}
      <motion.div 
        className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
      >
        <VendimiaBanner size={120} />
      </motion.div>

      {/* Fountain - center of plaza */}
      <motion.div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 z-15"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <FountainSprite size={96} />
      </motion.div>

      {/* Benches around plaza */}
      <motion.div 
        className="absolute top-1/2 left-1/4 -translate-x-1/2 z-12"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <BenchSprite size={60} />
      </motion.div>
      <motion.div 
        className="absolute top-1/2 right-1/4 translate-x-1/2 z-12 transform -scale-x-100"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <BenchSprite size={60} />
      </motion.div>

      {/* Market stalls - right side */}
      <motion.div 
        className="absolute bottom-1/4 right-1/3 z-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <MarketStall size={96} />
      </motion.div>

      {/* Grape flags - decorations */}
      <motion.div 
        className="absolute top-1/4 left-1/3 z-10"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <GrapeFlag size={48} />
      </motion.div>
      <motion.div 
        className="absolute top-1/4 right-1/3 z-10"
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      >
        <GrapeFlag size={48} />
      </motion.div>

      {/* Vineyard rows - left and right background */}
      <motion.div 
        className="absolute bottom-1/3 left-1/4 z-8 scale-75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.3 }}
      >
        <VineyardRow size={120} />
      </motion.div>
      <motion.div 
        className="absolute bottom-1/3 right-1/4 z-8 scale-75 transform -scale-x-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.3 }}
      >
        <VineyardRow size={120} />
      </motion.div>

      {/* Horse cart - moving across */}
      <motion.div 
        className="absolute bottom-1/2 left-0 z-11"
        animate={{ x: ['-10%', '110%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <HorseSprite size={80} />
      </motion.div>

      {/* Wine table - left side with bottles */}
      <motion.div 
        className="absolute bottom-1/4 left-1/4 z-13"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      >
        <WineTableSprite size={96} />
      </motion.div>

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
        className="absolute top-2 right-16 md:top-4 md:right-56 z-30"
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
