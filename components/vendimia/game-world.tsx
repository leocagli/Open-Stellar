'use client';

import { motion } from 'framer-motion';
import type { Agent, Building } from '@/lib/vendimia-types';
import { AgentSprite } from './agent-sprite';
import { BarrelObject, GrapeCrate, WineBottles, HorseCartSprite } from './sprites';

interface GameWorldProps {
  agents: Agent[];
  buildings: Building[];
  selectedAgent: Agent | null;
  onAgentClick: (agent: Agent) => void;
}

export function GameWorld({ agents, buildings, selectedAgent, onAgentClick }: GameWorldProps) {
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: '#87ceeb' }}
    >
      {/* Sky gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #7ec8e3 0%, #b8d4e3 40%, #e8dcc8 70%, #d4c4a8 100%)'
        }}
      />

      {/* Mountains Background - Andes style */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none">
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          {/* Far mountains - blue/gray */}
          <path 
            d="M0 200 L80 100 L160 140 L280 50 L400 110 L520 30 L640 90 L760 40 L880 100 L1000 60 L1120 90 L1200 70 L1200 200 Z" 
            fill="#8b9dc3"
          />
          {/* Snow caps */}
          <path d="M280 50 L250 85 L310 85 Z" fill="#ffffff"/>
          <path d="M520 30 L480 70 L560 70 Z" fill="#ffffff"/>
          <path d="M760 40 L720 80 L800 80 Z" fill="#ffffff"/>
          {/* Near mountains - darker */}
          <path 
            d="M0 200 L100 130 L220 160 L340 100 L460 140 L580 90 L700 130 L820 100 L940 140 L1060 110 L1200 140 L1200 200 Z" 
            fill="#6b7c9c"
          />
        </svg>
      </div>

      {/* Sun */}
      <motion.div 
        className="absolute top-6 right-12 w-14 h-14 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fff9c4 0%, #ffeb3b 50%, #ffc107 100%)',
          boxShadow: '0 0 40px #ffc107'
        }}
        animate={{ 
          boxShadow: ['0 0 30px #ffc107', '0 0 50px #ffc107', '0 0 30px #ffc107']
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Ground Layer */}
      <div 
        className="absolute inset-x-0 bottom-0 top-32"
        style={{ backgroundColor: '#c9b896' }}
      >
        {/* Ground texture pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 4px,
              rgba(139, 119, 85, 0.3) 4px,
              rgba(139, 119, 85, 0.3) 5px
            )`
          }}
        />

        {/* Vineyard Rows - Left */}
        <div className="absolute left-[3%] top-[5%] w-[28%] h-[35%]">
          <VineyardRows />
        </div>
        
        {/* Vineyard Rows - Right */}
        <div className="absolute right-[3%] top-[8%] w-[25%] h-[38%]">
          <VineyardRows />
        </div>

        {/* Vineyard Rows - Bottom Left */}
        <div className="absolute left-[5%] bottom-[30%] w-[22%] h-[28%]">
          <VineyardRows />
        </div>

        {/* Vineyard Rows - Bottom Right */}
        <div className="absolute right-[5%] bottom-[25%] w-[20%] h-[25%]">
          <VineyardRows />
        </div>

        {/* Buildings */}
        {buildings.map((building) => (
          <BuildingComponent key={building.id} building={building} />
        ))}

        {/* Plaza Fountain */}
        <div className="absolute left-[48%] top-[68%] -translate-x-1/2">
          <Fountain />
        </div>

        {/* Festival Stand - Vendimia */}
        <div className="absolute left-[50%] top-[78%] -translate-x-1/2">
          <FestivalStand />
        </div>

        {/* Decorative elements using SVG sprites */}
        <div className="absolute left-[30%] top-[58%] flex gap-1">
          <BarrelObject size={28} />
          <BarrelObject size={28} />
          <BarrelObject size={28} />
        </div>
        <div className="absolute right-[28%] top-[48%] flex gap-1">
          <BarrelObject size={24} />
          <BarrelObject size={24} />
        </div>
        <div className="absolute left-[18%] top-[38%]">
          <HorseCartSprite size={70} />
        </div>
        <div className="absolute right-[12%] top-[65%]">
          <GrapeCrate size={28} />
        </div>
        <div className="absolute left-[38%] top-[72%]">
          <GrapeCrate size={24} />
        </div>
        <div className="absolute right-[35%] top-[58%] flex gap-0.5">
          <WineBottles size={24} />
        </div>
        <WoodenBench className="absolute left-[42%] top-[75%]" />
        <WoodenBench className="absolute right-[40%] top-[78%]" />
        <TreeDecoration className="absolute left-[44%] top-[62%]" />
        <TreeDecoration className="absolute right-[44%] top-[58%]" />
      </div>

      {/* Agents */}
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
    </div>
  );
}

function VineyardRows() {
  return (
    <div className="w-full h-full grid grid-rows-6 gap-0.5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-end gap-0.5">
          {[...Array(10)].map((_, j) => (
            <motion.div 
              key={j}
              className="flex-1 flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (i * 10 + j) * 0.01 }}
            >
              {/* Vine post */}
              <div 
                className="w-0.5 h-2 md:h-3"
                style={{ backgroundColor: '#5c4033' }}
              />
              {/* Leaves cluster */}
              <div className="relative -mt-0.5">
                <div 
                  className="w-3 md:w-4 h-2 md:h-3 rounded-sm"
                  style={{ backgroundColor: '#3d8b40' }}
                />
                <div 
                  className="absolute -left-0.5 top-0 w-2 h-1.5 md:h-2 rounded-sm"
                  style={{ backgroundColor: '#4ade80' }}
                />
                <div 
                  className="absolute -right-0.5 top-0 w-2 h-1.5 md:h-2 rounded-sm"
                  style={{ backgroundColor: '#4ade80' }}
                />
                {/* Grapes */}
                {j % 3 === 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7c3aed' }} />
                    <div className="w-1.5 h-1.5 rounded-full -mt-0.5 ml-0.5" style={{ backgroundColor: '#6d28d9' }} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BuildingComponent({ building }: { building: Building }) {
  const getBuildingColors = () => {
    switch (building.type) {
      case 'bodega':
        return { 
          wall: '#d4a574', 
          roof: '#8b4513', 
          door: '#5c3d2e',
          window: '#87ceeb'
        };
      case 'mercado':
        return { 
          wall: '#f5deb3', 
          roof: '#cd853f', 
          door: '#8b4513',
          window: '#f0e68c'
        };
      case 'oficina':
        return { 
          wall: '#d3d3d3', 
          roof: '#708090', 
          door: '#4a4a4a',
          window: '#add8e6'
        };
      default:
        return { 
          wall: '#deb887', 
          roof: '#a0522d', 
          door: '#654321',
          window: '#f5f5dc'
        };
    }
  };

  const colors = getBuildingColors();

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${building.x}%`,
        top: `${building.y}%`,
        width: `${building.width}%`,
        height: `${building.height}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
    >
      {/* Main building */}
      <div 
        className="relative w-full h-full"
        style={{
          backgroundColor: colors.wall,
          border: '3px solid #4a3728',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'
        }}
      >
        {/* Roof */}
        {building.type === 'bodega' && (
          <div 
            className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 w-[105%]"
          >
            <div 
              className="w-full h-4 md:h-6"
              style={{ 
                backgroundColor: colors.roof,
                clipPath: 'polygon(5% 100%, 50% 0%, 95% 100%)',
                border: '2px solid #3d2914'
              }} 
            />
          </div>
        )}
        
        {/* Building Name Label */}
        <div 
          className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 px-2 py-0.5"
          style={{
            backgroundColor: '#f5f0e1',
            border: '2px solid #4a3728',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
          }}
        >
          <span 
            className="text-[8px] md:text-xs font-bold"
            style={{ 
              fontFamily: 'var(--font-vt323)',
              color: '#4a3728'
            }}
          >
            {building.name.toUpperCase()}
          </span>
        </div>

        {/* Windows */}
        <div className="absolute inset-2 md:inset-3 flex flex-wrap gap-1 md:gap-2 justify-center items-start pt-1">
          {[...Array(building.type === 'bodega' ? 4 : 2)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 md:w-4 h-2 md:h-4"
              style={{
                backgroundColor: colors.window,
                border: '1px solid #4a3728'
              }}
            />
          ))}
        </div>

        {/* Door */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 md:w-5 h-4 md:h-6"
          style={{
            backgroundColor: colors.door,
            border: '2px solid #2a1f18',
            borderBottom: 'none'
          }}
        />
      </div>
    </motion.div>
  );
}

function Fountain() {
  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      {/* Grape on top */}
      <motion.div 
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs">🍇</span>
      </motion.div>
      {/* Column */}
      <div 
        className="w-2 h-6"
        style={{ backgroundColor: '#a0a0a0', border: '1px solid #606060' }}
      />
      {/* Base */}
      <div 
        className="w-14 h-3 rounded-full"
        style={{
          backgroundColor: '#b0b0b0',
          border: '2px solid #707070',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
        }}
      />
    </motion.div>
  );
}

function FestivalStand() {
  return (
    <motion.div 
      className="relative"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {/* Banner */}
      <div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1"
        style={{
          backgroundColor: '#8b2942',
          border: '2px solid #5c1a2a',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)'
        }}
      >
        <span 
          className="text-[10px] md:text-xs font-bold"
          style={{ 
            fontFamily: 'var(--font-vt323)',
            color: '#ffd700',
            letterSpacing: '1px'
          }}
        >
          VENDIMIA
        </span>
      </div>
      {/* Canopy */}
      <div 
        className="w-20 h-6"
        style={{
          background: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 8px, #fbbf24 8px, #fbbf24 16px)',
          border: '2px solid #92400e',
          borderRadius: '2px 2px 0 0'
        }}
      />
      {/* Stand */}
      <div 
        className="w-20 h-4"
        style={{
          backgroundColor: '#8b4513',
          border: '2px solid #5c2d0a',
          borderTop: 'none'
        }}
      />
    </motion.div>
  );
}

function WineBarrels({ className, count = 3 }: { className?: string; count?: number }) {
  return (
    <div className={className}>
      <div className="flex gap-0.5">
        {[...Array(count)].map((_, i) => (
          <div 
            key={i}
            className="w-4 md:w-5 h-5 md:h-6 rounded-sm relative"
            style={{ 
              backgroundColor: '#8b4513',
              border: '2px solid #5c2d0a',
              transform: `rotate(${i % 2 === 0 ? -5 : 5}deg)`
            }}
          >
            {/* Metal bands */}
            <div className="absolute top-1 left-0 right-0 h-0.5" style={{ backgroundColor: '#4a4a4a' }} />
            <div className="absolute bottom-1 left-0 right-0 h-0.5" style={{ backgroundColor: '#4a4a4a' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GrapeCart({ className }: { className?: string }) {
  return (
    <motion.div 
      className={className}
      animate={{ x: [0, 2, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      {/* Cart body */}
      <div 
        className="w-8 md:w-10 h-4 md:h-5 relative"
        style={{
          backgroundColor: '#8b4513',
          border: '2px solid #5c2d0a'
        }}
      >
        {/* Grapes in cart */}
        <div className="absolute -top-1.5 left-1 flex gap-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7c3aed' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6d28d9' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7c3aed' }} />
        </div>
        {/* Wheels */}
        <div 
          className="absolute -bottom-1 left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: '#4a3728', border: '1px solid #2a1f18' }}
        />
        <div 
          className="absolute -bottom-1 right-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: '#4a3728', border: '1px solid #2a1f18' }}
        />
      </div>
    </motion.div>
  );
}

function WoodenBench({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div 
        className="w-8 h-2"
        style={{
          backgroundColor: '#8b4513',
          border: '1px solid #5c2d0a',
          boxShadow: '1px 1px 0 rgba(0,0,0,0.2)'
        }}
      />
      <div className="flex justify-between px-0.5 -mt-0.5">
        <div className="w-1 h-2" style={{ backgroundColor: '#5c2d0a' }} />
        <div className="w-1 h-2" style={{ backgroundColor: '#5c2d0a' }} />
      </div>
    </div>
  );
}

function TreeDecoration({ className }: { className?: string }) {
  return (
    <div className={className}>
      {/* Tree crown */}
      <div 
        className="w-8 h-6 rounded-full"
        style={{ backgroundColor: '#228b22' }}
      />
      {/* Trunk */}
      <div 
        className="w-2 h-3 mx-auto -mt-1"
        style={{ backgroundColor: '#8b4513' }}
      />
    </div>
  );
}
