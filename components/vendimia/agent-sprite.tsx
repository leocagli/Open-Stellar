'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Agent } from '@/lib/vendimia-types';
import { WorkerSprite, TaskLabel, WorkerHarvesting, WorkerWatering, WorkerWalking, OfficeWorker } from './sprites';

interface AgentSpriteProps {
  agent: Agent;
  onClick?: () => void;
  isSelected?: boolean;
}

// Sprites direccionales para agentes con imagen
const VALENTINA_SPRITES = {
  front: '/sprites/worker-front.png',
  back: '/sprites/worker-back.png',
  left: '/sprites/worker-left.png',
  right: '/sprites/worker-right.png',
};

const CAMILA_SPRITES = {
  front: '/sprites/camila-front.png',
  back: '/sprites/camila-back.png',
  left: '/sprites/camila-left.png',
  right: '/sprites/camila-right.png',
};

const VENDEDOR_SPRITES = {
  front: '/sprites/vendedor-front.png',
  back: '/sprites/vendedor-back.png',
  left: '/sprites/vendedor-left.png',
  right: '/sprites/vendedor-right.png',
};

const NPC005_SPRITES = {
  front: '/sprites/npc005-front.png',
  back: '/sprites/npc005-back.png',
  left: '/sprites/npc005-left.png',
  right: '/sprites/npc005-right.png',
};

const NPC006_SPRITES = {
  front: '/sprites/npc006-front.png',
  back: '/sprites/npc006-back.png',
  left: '/sprites/npc006-left.png',
  right: '/sprites/npc006-right.png',
};

const NPC007_SPRITES = {
  front: '/sprites/npc007-front.png',
  back: '/sprites/npc007-back.png',
  left: '/sprites/npc007-left.png',
  right: '/sprites/npc007-right.png',
};

const NPC008_SPRITES = {
  front: '/sprites/npc008-front.png',
  back: '/sprites/npc008-back.png',
  left: '/sprites/npc008-left.png',
  right: '/sprites/npc008-right.png',
};

export function AgentSprite({ agent, onClick, isSelected }: AgentSpriteProps) {
  const [walkFrame, setWalkFrame] = useState(0);
  const [direction, setDirection] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Animate walking frames mas fluido
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % 2);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Movimiento fluido aleatorio para todos los agentes
  useEffect(() => {
    const moveInterval = setInterval(() => {
      // Movimiento sutil aleatorio entre -2 y 2 pixeles
      setOffsetX(Math.random() * 4 - 2);
      setOffsetY(Math.random() * 2 - 1);
    }, 2000);
    return () => clearInterval(moveInterval);
  }, []);

  // Cambiar direccion aleatoriamente para agentes con sprites de imagen
  useEffect(() => {
    if (agent.id === '1' || agent.id === '3' || agent.id === '5' || agent.id === '8' || agent.id === '9' || agent.id === '10' || agent.id === '11') {
      const dirInterval = setInterval(() => {
        const dirs: Array<'front' | 'back' | 'left' | 'right'> = ['front', 'back', 'left', 'right'];
        setDirection(dirs[Math.floor(Math.random() * dirs.length)]);
      }, 2500);
      return () => clearInterval(dirInterval);
    }
  }, [agent.id]);

  // Sprite de imagen para Valentina (id: 1)
  function getValentinaSprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={VALENTINA_SPRITES[direction]}
          alt="Valentina"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Sprite de imagen para Camila (id: 3)
  function getCamilaSprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={CAMILA_SPRITES[direction]}
          alt="Camila"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Sprite de imagen para Vendedor/Fernando (id: 9)
  function getVendedorSprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={VENDEDOR_SPRITES[direction]}
          alt="Fernando"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Sprite de imagen para NPC005/Tomas (id: 11)
  function getNPC005Sprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={NPC005_SPRITES[direction]}
          alt="Tomas"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Sprite de imagen para NPC006/Santiago embotellado (id: 5)
  function getNPC006Sprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={NPC006_SPRITES[direction]}
          alt="Santiago"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Sprite de imagen para NPC007/Rosita sommelier cata (id: 8)
  function getNPC007Sprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={NPC007_SPRITES[direction]}
          alt="Rosita"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Sprite de imagen para NPC008/Pancho vendedor ambulante (id: 10)
  function getNPC008Sprite() {
    return (
      <div className="relative w-11 h-14" style={{ imageRendering: 'pixelated' }}>
        <Image
          src={NPC008_SPRITES[direction]}
          alt="Pancho"
          fill
          className="object-contain"
          style={{ imageRendering: 'pixelated' }}
          priority
        />
      </div>
    );
  }

  // Select sprite based on task (para otros agentes)
  function getWorkerSprite() {
    // Si es Valentina, usar el sprite de imagen
    if (agent.id === '1') {
      return getValentinaSprite();
    }

    // Si es Camila, usar el sprite de imagen
    if (agent.id === '3') {
      return getCamilaSprite();
    }

    // Si es Santiago (NPC006 embotellado), usar el sprite de bodega
    if (agent.id === '5') {
      return getNPC006Sprite();
    }

    // Si es Rosita (NPC007 sommelier cata), usar el sprite del sommelier
    if (agent.id === '8') {
      return getNPC007Sprite();
    }

    // Si es Fernando (vendedor), usar el sprite del vendedor
    if (agent.id === '9') {
      return getVendedorSprite();
    }

    // Si es Pancho (NPC008 vendedor ambulante), usar el sprite del ambulante
    if (agent.id === '10') {
      return getNPC008Sprite();
    }

    // Si es Tomas (NPC005), usar el sprite del trabajador de viñedo
    if (agent.id === '11') {
      return getNPC005Sprite();
    }

    const commonProps = {
      skinColor: agent.skinColor || '#e8c39e',
      hairColor: agent.hairColor || '#5c3d2e',
      shirtColor: agent.shirtColor || '#4a6fa5',
      size: 44,
    };

    switch (agent.task) {
      case 'cosecha':
        return <WorkerHarvesting {...commonProps} />;
      case 'riego':
        return <WorkerWatering {...commonProps} />;
      case 'poda':
        return <WorkerHarvesting {...commonProps} />;
      case 'fermentacion':
      case 'embotellado':
        return <OfficeWorker {...commonProps} size={40} />;
      case 'cata':
        return <OfficeWorker {...commonProps} size={40} />;
      default:
        return <WorkerWalking {...commonProps} frame={walkFrame} />;
    }
  }

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ 
        left: `${agent.x}%`, 
        top: `${agent.y}%`,
        zIndex: isSelected ? 20 : 10
      }}
      initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: `calc(-50% + ${offsetX}px)`,
        y: `calc(-50% + ${offsetY}px)`,
      }}
      transition={{
        scale: { duration: 0.4, ease: "backOut" },
        opacity: { duration: 0.3 },
        x: { duration: 1.5, ease: "easeInOut" },
        y: { duration: 1.5, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
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

      {/* Agent Avatar - Dynamic worker sprite based on task */}
      <motion.div 
        className="relative"
        animate={isSelected ? {
          filter: ['drop-shadow(0 0 4px #ffd700)', 'drop-shadow(0 0 8px #ffd700)', 'drop-shadow(0 0 4px #ffd700)'],
          y: [0, -2, 0],
        } : {
          y: [0, -1.5, 0],
        }}
        transition={{ 
          duration: 1.2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {getWorkerSprite()}
        
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
