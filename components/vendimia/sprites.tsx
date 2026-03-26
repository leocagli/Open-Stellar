'use client';

// Pixel art grape icon for Cosecha task
export function GrapeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Stem */}
      <rect x="7" y="0" width="2" height="3" fill="#5d4037" />
      <rect x="6" y="1" width="1" height="2" fill="#4a3228" />
      {/* Leaf */}
      <rect x="9" y="1" width="3" height="2" fill="#4caf50" />
      <rect x="10" y="0" width="2" height="1" fill="#4caf50" />
      <rect x="11" y="2" width="1" height="1" fill="#388e3c" />
      {/* Grapes - top row */}
      <rect x="5" y="4" width="3" height="3" fill="#7b1fa2" />
      <rect x="8" y="4" width="3" height="3" fill="#9c27b0" />
      <rect x="6" y="5" width="1" height="1" fill="#ab47bc" />
      <rect x="9" y="5" width="1" height="1" fill="#ce93d8" />
      {/* Grapes - middle row */}
      <rect x="3" y="7" width="3" height="3" fill="#7b1fa2" />
      <rect x="6" y="7" width="3" height="3" fill="#9c27b0" />
      <rect x="9" y="7" width="3" height="3" fill="#7b1fa2" />
      <rect x="4" y="8" width="1" height="1" fill="#ab47bc" />
      <rect x="7" y="8" width="1" height="1" fill="#ce93d8" />
      <rect x="10" y="8" width="1" height="1" fill="#ab47bc" />
      {/* Grapes - bottom row */}
      <rect x="4" y="10" width="3" height="3" fill="#9c27b0" />
      <rect x="7" y="10" width="3" height="3" fill="#7b1fa2" />
      <rect x="5" y="11" width="1" height="1" fill="#ce93d8" />
      <rect x="8" y="11" width="1" height="1" fill="#ab47bc" />
      {/* Bottom grape */}
      <rect x="5" y="13" width="3" height="2" fill="#9c27b0" />
      <rect x="6" y="14" width="1" height="1" fill="#ce93d8" />
    </svg>
  );
}

// Watering can icon for Riego task
export function WateringCanIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Spout */}
      <rect x="11" y="4" width="3" height="2" fill="#5d9cec" />
      <rect x="13" y="3" width="2" height="1" fill="#5d9cec" />
      <rect x="14" y="2" width="1" height="1" fill="#5d9cec" />
      {/* Handle */}
      <rect x="3" y="3" width="2" height="2" fill="#78909c" />
      <rect x="2" y="5" width="2" height="4" fill="#78909c" />
      <rect x="1" y="4" width="1" height="3" fill="#607d8b" />
      {/* Body */}
      <rect x="4" y="5" width="8" height="7" fill="#5d9cec" />
      <rect x="5" y="4" width="6" height="1" fill="#5d9cec" />
      <rect x="5" y="12" width="6" height="2" fill="#4a8ad4" />
      {/* Highlight */}
      <rect x="5" y="6" width="2" height="3" fill="#82b1ff" />
      {/* Water drops */}
      <rect x="14" y="4" width="1" height="1" fill="#82b1ff" />
      <rect x="15" y="5" width="1" height="1" fill="#82b1ff" />
    </svg>
  );
}

// Scissors/Pruning shears icon for Poda task
export function PruningIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Handle 1 */}
      <rect x="1" y="10" width="4" height="3" fill="#e53935" />
      <rect x="0" y="11" width="1" height="2" fill="#c62828" />
      <rect x="5" y="11" width="1" height="2" fill="#c62828" />
      {/* Handle 2 */}
      <rect x="1" y="13" width="4" height="3" fill="#e53935" />
      <rect x="0" y="14" width="1" height="1" fill="#c62828" />
      {/* Pivot */}
      <rect x="5" y="9" width="3" height="3" fill="#78909c" />
      <rect x="6" y="10" width="1" height="1" fill="#b0bec5" />
      {/* Blade 1 */}
      <rect x="7" y="5" width="2" height="5" fill="#b0bec5" />
      <rect x="8" y="3" width="2" height="3" fill="#cfd8dc" />
      <rect x="9" y="1" width="2" height="3" fill="#cfd8dc" />
      <rect x="10" y="0" width="2" height="2" fill="#eceff1" />
      {/* Blade 2 */}
      <rect x="9" y="7" width="2" height="4" fill="#90a4ae" />
      <rect x="10" y="5" width="2" height="3" fill="#b0bec5" />
      <rect x="11" y="3" width="2" height="3" fill="#cfd8dc" />
      {/* Edge highlight */}
      <rect x="11" y="1" width="1" height="2" fill="#eceff1" />
    </svg>
  );
}

// Wine barrel icon for Fermentacion task
export function BarrelIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Barrel body */}
      <rect x="3" y="2" width="10" height="12" fill="#8d6e63" />
      <rect x="2" y="4" width="1" height="8" fill="#795548" />
      <rect x="13" y="4" width="1" height="8" fill="#6d4c41" />
      {/* Top/bottom curves */}
      <rect x="4" y="1" width="8" height="1" fill="#8d6e63" />
      <rect x="4" y="14" width="8" height="1" fill="#6d4c41" />
      {/* Metal bands */}
      <rect x="2" y="3" width="12" height="2" fill="#455a64" />
      <rect x="3" y="4" width="10" height="1" fill="#607d8b" />
      <rect x="2" y="11" width="12" height="2" fill="#455a64" />
      <rect x="3" y="12" width="10" height="1" fill="#37474f" />
      {/* Wood grain */}
      <rect x="5" y="5" width="1" height="6" fill="#a1887f" />
      <rect x="8" y="5" width="1" height="6" fill="#a1887f" />
      <rect x="11" y="5" width="1" height="6" fill="#6d4c41" />
    </svg>
  );
}

// Wine bottle icon for Embotellado task
export function BottleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Cork */}
      <rect x="6" y="0" width="4" height="2" fill="#d7ccc8" />
      {/* Neck */}
      <rect x="6" y="2" width="4" height="3" fill="#1b5e20" />
      <rect x="7" y="3" width="1" height="2" fill="#2e7d32" />
      {/* Shoulder */}
      <rect x="5" y="5" width="6" height="2" fill="#1b5e20" />
      {/* Body */}
      <rect x="4" y="7" width="8" height="8" fill="#2e7d32" />
      <rect x="3" y="9" width="1" height="5" fill="#1b5e20" />
      <rect x="12" y="9" width="1" height="5" fill="#1b5e20" />
      {/* Label */}
      <rect x="5" y="9" width="6" height="4" fill="#f5f5dc" />
      <rect x="6" y="10" width="4" height="2" fill="#8d6e63" />
      {/* Highlight */}
      <rect x="5" y="7" width="2" height="2" fill="#43a047" />
      {/* Bottom */}
      <rect x="4" y="15" width="8" height="1" fill="#1b5e20" />
    </svg>
  );
}

// Wine glass icon for Cata task
export function WineGlassIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Bowl */}
      <rect x="3" y="1" width="10" height="6" fill="#e8eaf6" />
      <rect x="2" y="2" width="1" height="4" fill="#c5cae9" />
      <rect x="13" y="2" width="1" height="4" fill="#c5cae9" />
      {/* Wine */}
      <rect x="4" y="3" width="8" height="3" fill="#880e4f" />
      <rect x="5" y="4" width="2" height="1" fill="#ad1457" />
      {/* Stem */}
      <rect x="7" y="7" width="2" height="5" fill="#e8eaf6" />
      <rect x="8" y="8" width="1" height="3" fill="#c5cae9" />
      {/* Base */}
      <rect x="4" y="12" width="8" height="2" fill="#e8eaf6" />
      <rect x="3" y="13" width="10" height="1" fill="#c5cae9" />
      <rect x="5" y="14" width="6" height="1" fill="#9fa8da" />
    </svg>
  );
}

// UI Element Icons for toolbar
export function BoxIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Box top */}
      <rect x="2" y="3" width="12" height="4" fill="#d7a86e" />
      <rect x="1" y="4" width="1" height="3" fill="#c49a6c" />
      <rect x="14" y="4" width="1" height="3" fill="#a67c52" />
      {/* Box front */}
      <rect x="2" y="7" width="12" height="7" fill="#c49a6c" />
      <rect x="1" y="7" width="1" height="6" fill="#a67c52" />
      <rect x="14" y="7" width="1" height="6" fill="#8b6914" />
      {/* Box bottom */}
      <rect x="2" y="13" width="12" height="1" fill="#8b6914" />
      {/* Highlight */}
      <rect x="3" y="4" width="3" height="2" fill="#e8c490" />
      <rect x="3" y="8" width="2" height="3" fill="#d7a86e" />
    </svg>
  );
}

export function ShirtIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Body */}
      <rect x="4" y="4" width="8" height="10" fill="#f5f5dc" />
      {/* Collar */}
      <rect x="6" y="2" width="4" height="3" fill="#f5f5dc" />
      <rect x="7" y="2" width="2" height="2" fill="#e8e8d0" />
      {/* Sleeves */}
      <rect x="1" y="4" width="3" height="6" fill="#f5f5dc" />
      <rect x="12" y="4" width="3" height="6" fill="#f5f5dc" />
      <rect x="0" y="5" width="1" height="4" fill="#e8e8d0" />
      <rect x="15" y="5" width="1" height="4" fill="#d8d8c0" />
      {/* Shadow */}
      <rect x="4" y="13" width="8" height="1" fill="#d8d8c0" />
      <rect x="1" y="9" width="3" height="1" fill="#d8d8c0" />
      <rect x="12" y="9" width="3" height="1" fill="#d8d8c0" />
    </svg>
  );
}

export function BookIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Cover */}
      <rect x="2" y="1" width="11" height="14" fill="#5d4037" />
      <rect x="1" y="2" width="1" height="12" fill="#4e342e" />
      {/* Pages */}
      <rect x="3" y="2" width="9" height="12" fill="#f5f5dc" />
      <rect x="4" y="3" width="7" height="10" fill="#fffde7" />
      {/* Spine */}
      <rect x="2" y="2" width="1" height="12" fill="#3e2723" />
      {/* Page lines */}
      <rect x="5" y="5" width="5" height="1" fill="#d7ccc8" />
      <rect x="5" y="7" width="5" height="1" fill="#d7ccc8" />
      <rect x="5" y="9" width="4" height="1" fill="#d7ccc8" />
    </svg>
  );
}

export function GearIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Outer teeth */}
      <rect x="6" y="0" width="4" height="2" fill="#78909c" />
      <rect x="6" y="14" width="4" height="2" fill="#607d8b" />
      <rect x="0" y="6" width="2" height="4" fill="#78909c" />
      <rect x="14" y="6" width="2" height="4" fill="#607d8b" />
      {/* Diagonal teeth */}
      <rect x="2" y="2" width="3" height="3" fill="#78909c" />
      <rect x="11" y="2" width="3" height="3" fill="#78909c" />
      <rect x="2" y="11" width="3" height="3" fill="#607d8b" />
      <rect x="11" y="11" width="3" height="3" fill="#607d8b" />
      {/* Center body */}
      <rect x="3" y="3" width="10" height="10" fill="#90a4ae" />
      {/* Inner circle */}
      <rect x="5" y="5" width="6" height="6" fill="#607d8b" />
      {/* Center hole */}
      <rect x="6" y="6" width="4" height="4" fill="#455a64" />
      <rect x="7" y="7" width="2" height="2" fill="#37474f" />
    </svg>
  );
}

export function MenuIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="12" height="2" fill="#5d4037" />
      <rect x="2" y="7" width="12" height="2" fill="#5d4037" />
      <rect x="2" y="11" width="12" height="2" fill="#5d4037" />
    </svg>
  );
}

// Worker sprite - pixel art person
export function WorkerSprite({ 
  skinColor = '#e8c39e', 
  hairColor = '#5c3d2e', 
  shirtColor = '#4a6fa5',
  pantsColor = '#3d5a80',
  size = 48,
  isWorking = false
}: { 
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  size?: number;
  isWorking?: boolean;
}) {
  const scale = size / 32;
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Hair */}
      <rect x="11" y="3" width="10" height="4" fill={hairColor} />
      <rect x="10" y="4" width="1" height="3" fill={hairColor} />
      <rect x="21" y="4" width="1" height="3" fill={hairColor} />
      <rect x="12" y="2" width="8" height="1" fill={hairColor} />
      
      {/* Head/Face */}
      <rect x="11" y="6" width="10" height="8" fill={skinColor} />
      <rect x="10" y="7" width="1" height="6" fill={skinColor} />
      <rect x="21" y="7" width="1" height="6" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="13" y="9" width="2" height="2" fill="#3e2723" />
      <rect x="17" y="9" width="2" height="2" fill="#3e2723" />
      <rect x="13" y="9" width="1" height="1" fill="#1a1a1a" />
      <rect x="17" y="9" width="1" height="1" fill="#1a1a1a" />
      
      {/* Neck */}
      <rect x="14" y="14" width="4" height="2" fill={skinColor} />
      
      {/* Shirt/Body */}
      <rect x="10" y="16" width="12" height="8" fill={shirtColor} />
      <rect x="9" y="17" width="1" height="6" fill={shirtColor} />
      <rect x="22" y="17" width="1" height="6" fill={shirtColor} />
      
      {/* Arms */}
      {isWorking ? (
        <>
          {/* Working pose - arms extended */}
          <rect x="5" y="16" width="5" height="3" fill={shirtColor} />
          <rect x="22" y="16" width="5" height="3" fill={shirtColor} />
          <rect x="4" y="17" width="2" height="2" fill={skinColor} />
          <rect x="26" y="17" width="2" height="2" fill={skinColor} />
        </>
      ) : (
        <>
          {/* Standing pose */}
          <rect x="7" y="17" width="3" height="6" fill={shirtColor} />
          <rect x="22" y="17" width="3" height="6" fill={shirtColor} />
          <rect x="7" y="22" width="3" height="2" fill={skinColor} />
          <rect x="22" y="22" width="3" height="2" fill={skinColor} />
        </>
      )}
      
      {/* Pants */}
      <rect x="11" y="24" width="4" height="6" fill={pantsColor} />
      <rect x="17" y="24" width="4" height="6" fill={pantsColor} />
      
      {/* Shoes */}
      <rect x="10" y="29" width="5" height="2" fill="#5d4037" />
      <rect x="17" y="29" width="5" height="2" fill="#5d4037" />
    </svg>
  );
}

// Avatar portrait for sidebar
export function AvatarPortrait({
  skinColor = '#e8c39e',
  hairColor = '#5c3d2e',
  shirtColor = '#4a6fa5',
  size = 40
}: {
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Background */}
      <rect x="0" y="0" width="16" height="16" fill="#4a3728" />
      
      {/* Hair */}
      <rect x="4" y="2" width="8" height="3" fill={hairColor} />
      <rect x="3" y="3" width="1" height="2" fill={hairColor} />
      <rect x="12" y="3" width="1" height="2" fill={hairColor} />
      
      {/* Face */}
      <rect x="4" y="4" width="8" height="6" fill={skinColor} />
      <rect x="3" y="5" width="1" height="4" fill={skinColor} />
      <rect x="12" y="5" width="1" height="4" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="5" y="6" width="2" height="2" fill="#3e2723" />
      <rect x="9" y="6" width="2" height="2" fill="#3e2723" />
      <rect x="5" y="6" width="1" height="1" fill="#1a1a1a" />
      <rect x="9" y="6" width="1" height="1" fill="#1a1a1a" />
      
      {/* Neck & Shirt */}
      <rect x="6" y="10" width="4" height="1" fill={skinColor} />
      <rect x="3" y="11" width="10" height="5" fill={shirtColor} />
      
      {/* Border */}
      <rect x="0" y="0" width="16" height="1" fill="#2a1f18" />
      <rect x="0" y="15" width="16" height="1" fill="#2a1f18" />
      <rect x="0" y="0" width="1" height="16" fill="#2a1f18" />
      <rect x="15" y="0" width="1" height="16" fill="#2a1f18" />
    </svg>
  );
}

// Progress bar component
export function ProgressBar({ 
  progress, 
  color = '#4caf50',
  width = 60,
  height = 8 
}: { 
  progress: number;
  color?: string;
  width?: number;
  height?: number;
}) {
  const fillWidth = Math.round((progress / 100) * (width - 4));
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ imageRendering: 'pixelated' }}>
      {/* Background */}
      <rect x="0" y="0" width={width} height={height} fill="#2a2a2a" />
      {/* Border */}
      <rect x="1" y="1" width={width - 2} height={height - 2} fill="#1a1a1a" />
      {/* Fill */}
      <rect x="2" y="2" width={fillWidth} height={height - 4} fill={color} />
      {/* Highlight */}
      <rect x="2" y="2" width={fillWidth} height={1} fill={`${color}dd`} />
    </svg>
  );
}

// Task label bubble
export function TaskLabel({ 
  task, 
  progress 
}: { 
  task: 'cosecha' | 'riego' | 'poda' | 'fermentacion' | 'embotellado' | 'cata';
  progress: number;
}) {
  const taskConfig = {
    cosecha: { icon: GrapeIcon, label: 'Cosecha', color: '#4caf50' },
    riego: { icon: WateringCanIcon, label: 'Riego', color: '#4caf50' },
    poda: { icon: PruningIcon, label: 'Poda', color: '#4caf50' },
    fermentacion: { icon: BarrelIcon, label: 'Fermentacion', color: '#ff9800' },
    embotellado: { icon: BottleIcon, label: 'Embotellado', color: '#ff9800' },
    cata: { icon: WineGlassIcon, label: 'Cata', color: '#ff9800' },
  };
  
  const config = taskConfig[task];
  const Icon = config.icon;
  
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5"
      style={{
        backgroundColor: '#f5f0e1',
        border: '2px solid #4a3728',
        borderRadius: '4px',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
      }}
    >
      <Icon size={18} />
      <div className="flex flex-col gap-0.5">
        <span 
          className="text-xs font-bold"
          style={{ color: '#4a3728', fontFamily: 'var(--font-vt323)', letterSpacing: '1px' }}
        >
          {config.label}
        </span>
        <ProgressBar progress={progress} color={config.color} width={50} height={6} />
      </div>
    </div>
  );
}

// Horse with cart sprite
export function HorseCartSprite({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 80 48" style={{ imageRendering: 'pixelated' }}>
      {/* Cart */}
      <rect x="40" y="20" width="35" height="18" fill="#8d6e63" />
      <rect x="42" y="22" width="31" height="14" fill="#a1887f" />
      {/* Grapes in cart */}
      <rect x="44" y="24" width="8" height="6" fill="#7b1fa2" />
      <rect x="54" y="24" width="8" height="6" fill="#9c27b0" />
      <rect x="64" y="24" width="6" height="6" fill="#7b1fa2" />
      <rect x="48" y="28" width="6" height="5" fill="#9c27b0" />
      <rect x="58" y="28" width="6" height="5" fill="#7b1fa2" />
      {/* Wheels */}
      <rect x="45" y="36" width="8" height="8" fill="#5d4037" />
      <rect x="47" y="38" width="4" height="4" fill="#4e342e" />
      <rect x="65" y="36" width="8" height="8" fill="#5d4037" />
      <rect x="67" y="38" width="4" height="4" fill="#4e342e" />
      
      {/* Horse body */}
      <rect x="10" y="18" width="25" height="16" fill="#8d6e63" />
      <rect x="8" y="20" width="4" height="12" fill="#795548" />
      {/* Horse head */}
      <rect x="2" y="12" width="12" height="10" fill="#8d6e63" />
      <rect x="0" y="14" width="4" height="6" fill="#795548" />
      {/* Eye */}
      <rect x="4" y="15" width="2" height="2" fill="#3e2723" />
      {/* Mane */}
      <rect x="10" y="10" width="8" height="4" fill="#5d4037" />
      <rect x="12" y="8" width="4" height="2" fill="#5d4037" />
      {/* Legs */}
      <rect x="12" y="32" width="4" height="10" fill="#795548" />
      <rect x="20" y="32" width="4" height="10" fill="#795548" />
      <rect x="28" y="32" width="4" height="10" fill="#795548" />
      {/* Hooves */}
      <rect x="12" y="40" width="4" height="2" fill="#3e2723" />
      <rect x="20" y="40" width="4" height="2" fill="#3e2723" />
      <rect x="28" y="40" width="4" height="2" fill="#3e2723" />
      {/* Harness */}
      <rect x="34" y="24" width="8" height="2" fill="#5d4037" />
    </svg>
  );
}

// Barrel object
export function BarrelObject({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ imageRendering: 'pixelated' }}>
      {/* Body */}
      <rect x="4" y="3" width="16" height="18" fill="#8d6e63" />
      <rect x="3" y="6" width="1" height="12" fill="#795548" />
      <rect x="20" y="6" width="1" height="12" fill="#6d4c41" />
      {/* Top curve */}
      <rect x="6" y="2" width="12" height="1" fill="#8d6e63" />
      <rect x="6" y="21" width="12" height="1" fill="#6d4c41" />
      {/* Metal bands */}
      <rect x="3" y="5" width="18" height="2" fill="#455a64" />
      <rect x="4" y="6" width="16" height="1" fill="#607d8b" />
      <rect x="3" y="17" width="18" height="2" fill="#455a64" />
      <rect x="4" y="18" width="16" height="1" fill="#37474f" />
      {/* Wood grain */}
      <rect x="7" y="8" width="1" height="8" fill="#a1887f" />
      <rect x="12" y="8" width="1" height="8" fill="#a1887f" />
      <rect x="17" y="8" width="1" height="8" fill="#6d4c41" />
    </svg>
  );
}

// Grape crate
export function GrapeCrate({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ imageRendering: 'pixelated' }}>
      {/* Crate */}
      <rect x="2" y="10" width="20" height="12" fill="#8d6e63" />
      <rect x="3" y="11" width="18" height="10" fill="#a1887f" />
      <rect x="2" y="21" width="20" height="1" fill="#6d4c41" />
      {/* Slats */}
      <rect x="4" y="12" width="2" height="8" fill="#8d6e63" />
      <rect x="10" y="12" width="2" height="8" fill="#8d6e63" />
      <rect x="16" y="12" width="2" height="8" fill="#8d6e63" />
      {/* Grapes */}
      <rect x="4" y="4" width="5" height="5" fill="#7b1fa2" />
      <rect x="9" y="4" width="5" height="5" fill="#9c27b0" />
      <rect x="14" y="4" width="5" height="5" fill="#7b1fa2" />
      <rect x="6" y="7" width="4" height="4" fill="#9c27b0" />
      <rect x="12" y="7" width="4" height="4" fill="#7b1fa2" />
      {/* Highlights */}
      <rect x="5" y="5" width="2" height="2" fill="#ab47bc" />
      <rect x="10" y="5" width="2" height="2" fill="#ce93d8" />
      <rect x="15" y="5" width="2" height="2" fill="#ab47bc" />
    </svg>
  );
}

// Wine bottles group
export function WineBottles({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ imageRendering: 'pixelated' }}>
      {/* Bottle 1 */}
      <rect x="2" y="8" width="6" height="14" fill="#1b5e20" />
      <rect x="3" y="4" width="4" height="4" fill="#2e7d32" />
      <rect x="3" y="2" width="4" height="2" fill="#d7ccc8" />
      <rect x="3" y="12" width="4" height="6" fill="#f5f5dc" />
      
      {/* Bottle 2 */}
      <rect x="9" y="8" width="6" height="14" fill="#4a148c" />
      <rect x="10" y="4" width="4" height="4" fill="#6a1b9a" />
      <rect x="10" y="2" width="4" height="2" fill="#d7ccc8" />
      <rect x="10" y="12" width="4" height="6" fill="#f5f5dc" />
      
      {/* Bottle 3 */}
      <rect x="16" y="8" width="6" height="14" fill="#1b5e20" />
      <rect x="17" y="4" width="4" height="4" fill="#2e7d32" />
      <rect x="17" y="2" width="4" height="2" fill="#d7ccc8" />
      <rect x="17" y="12" width="4" height="6" fill="#f5f5dc" />
    </svg>
  );
}
