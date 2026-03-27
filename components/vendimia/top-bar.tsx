'use client';

import { motion } from 'framer-motion';
import { GrapeIcon } from './sprites';
import { WalletButton } from '@/components/wallet/wallet-button';

interface TopBarProps {
  season: string;
  day: number;
  totalGrapes: number;
  currentScene?: string;
  onSceneChange?: (scene: string) => void;
}

const SCENES = ['plaza-central', 'vinedo', 'fermentacion', 'oficina'] as const;
const SCENE_LABELS: Record<string, string> = {
  'plaza-central': '🏛️ Plaza',
  'vinedo': '🍇 Viñedo',
  'fermentacion': '🛢️ Fermentación',
  'oficina': '📋 Oficina'
};

export function TopBar({ season, day, totalGrapes, currentScene = 'plaza-central', onSceneChange }: TopBarProps) {
  return (
    <>
      {/* Left side - Game info */}
      <motion.div
        className="absolute top-0 left-0 z-10 pointer-events-none"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-2 md:p-3">
        {/* Logo - Pixel style */}
        <div 
          className="px-3 py-2 pointer-events-auto flex items-center gap-2"
          style={{
            backgroundColor: '#8b2942',
            border: '3px solid #5c1a2a',
            boxShadow: '3px 3px 0 rgba(0,0,0,0.3)'
          }}
        >
          <GrapeIcon size={20} />
          <span 
            className="text-xs md:text-sm font-bold tracking-wider"
            style={{ 
              fontFamily: 'var(--font-vt323)',
              color: '#ffd700',
              letterSpacing: '1px'
            }}
          >
            VENDIMIA WORLD
          </span>
        </div>

        {/* Stats row */}
        <div className="flex gap-1 mt-1">
          {/* Day counter */}
          <div 
            className="px-2 py-1 pointer-events-auto flex items-center gap-1"
            style={{
              backgroundColor: '#f5f0e1',
              border: '2px solid #4a3728',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
            }}
          >
            <span className="text-sm">📅</span>
            <span 
              className="text-xs"
              style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
            >
              Dia {day}
            </span>
          </div>

          {/* Grapes counter */}
          <div 
            className="px-2 py-1 pointer-events-auto flex items-center gap-1"
            style={{
              backgroundColor: '#f5f0e1',
              border: '2px solid #4a3728',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
            }}
          >
            <GrapeIcon size={14} />
            <span 
              className="text-xs font-bold"
              style={{ fontFamily: 'var(--font-vt323)', color: '#7c3aed' }}
            >
              {totalGrapes.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
          </div>
        </div>

        {/* Season indicator - hidden on small screens */}
        <div 
          className="hidden sm:flex px-2 py-1 mt-1 pointer-events-auto items-center gap-1"
          style={{
            backgroundColor: '#f5f0e1',
            border: '2px solid #4a3728',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
          }}
        >
          <span className="text-sm">🌞</span>
          <span 
            className="text-xs"
            style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
          >
            {season}
          </span>
        </div>

        {/* Scene selector */}
        <div className="flex gap-1 mt-1 flex-wrap">
          {SCENES.map(scene => (
            <motion.button
              key={scene}
              onClick={() => onSceneChange?.(scene)}
              className="px-2 py-1 pointer-events-auto text-xs font-bold"
              style={{
                backgroundColor: currentScene === scene ? '#4a3728' : '#f5f0e1',
                color: currentScene === scene ? '#f5f0e1' : '#4a3728',
                border: '2px solid #4a3728',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                fontFamily: 'var(--font-vt323)'
              }}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1 }}
            >
              {SCENE_LABELS[scene]}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>

      {/* Right side - Wallet */}
      <motion.div
        className="absolute top-0 right-0 z-10 pointer-events-none"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-2 md:p-3">
          <WalletButton />
        </div>
      </motion.div>
    </>
  );
}
