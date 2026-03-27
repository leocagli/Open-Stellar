'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  'vinedo': '/scenes/vinedo.jpg',
  'fermentacion': '/scenes/fermentacion.jpg',
  'oficina': '/scenes/oficina.jpg',
};

// Scene labels in Spanish
const sceneLabels: Record<string, string> = {
  'plaza-central': 'Plaza Central',
  'vinedo': 'Viñedo',
  'fermentacion': 'Sala de Fermentación',
  'oficina': 'Oficina',
};

export function GameWorld({ agents, selectedAgent, onAgentClick, currentScene = 'plaza-central' }: GameWorldProps) {
  const backgroundImage = sceneBackgrounds[currentScene];
  const sceneLabel = sceneLabels[currentScene] || 'Vendimia World';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Track mouse position para parallax effect
  useEffect(() => {
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Parallax offset basado en mouse position (subtle)
  // Solo calcular si el componente está montado en el cliente
  const parallaxX = (typeof window !== 'undefined' && windowSize.width > 0) ? (mousePos.x - windowSize.width / 2) * 0.02 : 0;
  const parallaxY = (typeof window !== 'undefined' && windowSize.height > 0) ? (mousePos.y - windowSize.height / 2) * 0.02 : 0;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Fondo base con gradiente atmosphere */}
      <div 
        className="absolute inset-0"
        style={{
          background: currentScene === 'plaza-central' 
            ? 'linear-gradient(180deg, #87ceeb 0%, #e0f4ff 50%, #d4a574 100%)'
            : currentScene === 'vinedo'
            ? 'linear-gradient(180deg, #87ceeb 0%, #d4a574 100%)'
            : currentScene === 'bodega' || currentScene === 'fermentacion'
            ? 'linear-gradient(180deg, #4a3728 0%, #8b7355 100%)'
            : 'linear-gradient(180deg, #8b8b8b 0%, #c9b896 100%)',
        }}
      />

      {/* Parallax Background Layer - Far */}
      {currentScene === 'plaza-central' && (
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.1) 80px, rgba(255,255,255,0.1) 81px)',
            backgroundSize: '200px 100%',
            x: parallaxX * 0.5,
            y: parallaxY * 0.5,
          }}
        />
      )}

      {/* Scene Background Image con parallax */}
      {backgroundImage ? (
        <motion.div
          className="absolute inset-0"
          style={{
            x: parallaxX * 0.8,
            y: parallaxY * 0.8,
          }}
        >
          <Image
            src={backgroundImage}
            alt={`Escena: ${currentScene}`}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      ) : (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: '#c9b896' }}
        />
      )}

      {/* Agents - positioned on top of the scene con depth sorting */}
      <div className="absolute inset-0 pointer-events-none">
        {agents
          .sort((a, b) => a.y - b.y) // Depth sort: más arriba primero, más abajo último
          .map((agent) => (
            <div key={agent.id} className="pointer-events-auto">
              <AgentSprite
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onClick={() => onAgentClick(agent)}
              />
            </div>
          ))}
      </div>

      {/* Fog/Atmosphere effect - profundidad visual */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
          mixBlendMode: 'multiply',
        }}
      />

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
            {sceneLabel}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
