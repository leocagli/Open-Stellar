'use client';

import { motion } from 'framer-motion';

// Scene particles config
export const sceneParticles: Record<string, { type: string; count: number; color: string }> = {
  'vinedo': { type: 'leaves', count: 5, color: '#4caf50' },
  'plaza-central': { type: 'dust', count: 4, color: '#d4a574' },
  'fermentacion': { type: 'bubbles', count: 4, color: '#9c27b0' },
  'oficina': { type: 'dust', count: 3, color: '#78909c' },
};

// Ambient Particle Component
export function Particle({ type, color, i }: { type: string; color: string; i: number }) {
  const x = (i * 17) % 100;
  const duration = 8 + (i % 4) * 2;
  const delay = i * 1.2;
  
  if (type === 'leaves') {
    return (
      <motion.div 
        className="absolute pointer-events-none" 
        style={{ 
          left: `${x}%`, 
          top: '-5%', 
          width: 8, 
          height: 8, 
          backgroundColor: color, 
          borderRadius: '0 50% 50% 50%',
          transform: 'rotate(45deg)'
        }} 
        animate={{ 
          y: ['0vh', '110vh'], 
          x: [0, 40, -30, 20, 0],
          rotate: [45, 180, 360, 540, 720], 
          opacity: [0, 0.6, 0.5, 0] 
        }} 
        transition={{ 
          duration, 
          delay, 
          repeat: Infinity,
          ease: 'linear'
        }} 
      />
    );
  }
  
  if (type === 'bubbles') {
    return (
      <motion.div 
        className="absolute pointer-events-none rounded-full" 
        style={{ 
          left: `${x}%`, 
          bottom: '15%', 
          width: 5, 
          height: 5, 
          border: `1px solid ${color}`,
          backgroundColor: 'transparent'
        }} 
        animate={{ 
          y: [0, -180], 
          scale: [0.5, 1, 0.7],
          opacity: [0, 0.5, 0] 
        }} 
        transition={{ 
          duration: duration * 0.5, 
          delay, 
          repeat: Infinity,
          ease: 'easeOut'
        }} 
      />
    );
  }
  
  // Default: dust
  return (
    <motion.div 
      className="absolute pointer-events-none rounded-full" 
      style={{ 
        left: `${x}%`, 
        top: `${40 + (i * 7) % 25}%`, 
        width: 3, 
        height: 3, 
        backgroundColor: color 
      }} 
      animate={{ 
        x: [0, 25, -15, 0], 
        y: [0, -8, 4, 0],
        opacity: [0.2, 0.35, 0.2] 
      }} 
      transition={{ 
        duration: duration * 0.7, 
        delay, 
        repeat: Infinity,
        ease: 'easeInOut'
      }} 
    />
  );
}

// Vignette overlay for depth
export function VignetteOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ 
        zIndex: 10, 
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)' 
      }} 
    />
  );
}

// Scanlines for retro pixel art feel
export function ScanlinesOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        zIndex: 11,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
      }}
    />
  );
}

// Particle layer component
export function ParticleLayer({ scene }: { scene: string }) {
  const particles = sceneParticles[scene] || { type: 'dust', count: 3, color: '#9e9e9e' };
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {Array.from({ length: particles.count }).map((_, i) => (
        <Particle key={i} type={particles.type} color={particles.color} i={i} />
      ))}
    </div>
  );
}
