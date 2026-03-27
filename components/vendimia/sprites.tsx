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
// Configuracion de tareas - definido fuera del componente para evitar recreacion
const TASK_CONFIG: Record<string, { icon: React.FC<{ size?: number }>; label: string; color: string }> = {
  cosecha: { icon: GrapeIcon, label: 'Cosecha', color: '#4caf50' },
  poda: { icon: PruningIcon, label: 'Poda', color: '#4caf50' },
  embotellado: { icon: BottleIcon, label: 'Embotellado', color: '#ff9800' },
  cata: { icon: WineGlassIcon, label: 'Cata', color: '#9c27b0' },
  administracion: { icon: BottleIcon, label: 'Admin', color: '#059669' },
  atención: { icon: GrapeIcon, label: 'Atención', color: '#dc2626' },
  venta: { icon: GrapeIcon, label: 'Venta', color: '#e91e63' },
  espera: { icon: GrapeIcon, label: 'Espera', color: '#9e9e9e' },
  descanso: { icon: GrapeIcon, label: 'Descanso', color: '#9e9e9e' },
};

const DEFAULT_TASK_CONFIG = { icon: GrapeIcon, label: 'Tarea', color: '#9e9e9e' };

// Task Label - Muestra etiqueta de tarea con icono y barra de progreso
export function TaskLabel({ task, progress }: { task?: string; progress: number }) {
  const taskKey = task ?? '';
  const cfg = TASK_CONFIG[taskKey] ?? { ...DEFAULT_TASK_CONFIG, label: taskKey || 'Tarea' };
  const IconComponent = cfg.icon;

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
      <IconComponent size={18} />
      <div className="flex flex-col gap-0.5">
        <span 
          className="text-xs font-bold"
          style={{ color: '#4a3728', fontFamily: 'var(--font-vt323)', letterSpacing: '1px' }}
        >
          {cfg.label}
        </span>
        <ProgressBar progress={progress} color={cfg.color} width={50} height={6} />
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

// ============================================
// ADDITIONAL SPRITES FROM SPRITE SHEET
// ============================================

// Worker poses - Harvesting (cosechando)
export function WorkerHarvesting({ 
  skinColor = '#e8c39e', 
  hairColor = '#5c3d2e', 
  shirtColor = '#4a6fa5',
  size = 48
}: { 
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      {/* Hair */}
      <rect x="11" y="3" width="10" height="4" fill={hairColor} />
      <rect x="10" y="4" width="1" height="3" fill={hairColor} />
      <rect x="21" y="4" width="1" height="3" fill={hairColor} />
      
      {/* Head */}
      <rect x="11" y="6" width="10" height="8" fill={skinColor} />
      <rect x="10" y="7" width="1" height="6" fill={skinColor} />
      <rect x="21" y="7" width="1" height="6" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="13" y="9" width="2" height="2" fill="#3e2723" />
      <rect x="17" y="9" width="2" height="2" fill="#3e2723" />
      
      {/* Body - bent over */}
      <rect x="10" y="14" width="12" height="8" fill={shirtColor} />
      
      {/* Arms reaching down */}
      <rect x="6" y="18" width="5" height="3" fill={shirtColor} />
      <rect x="21" y="18" width="5" height="3" fill={shirtColor} />
      <rect x="4" y="20" width="3" height="3" fill={skinColor} />
      <rect x="25" y="20" width="3" height="3" fill={skinColor} />
      
      {/* Grape crate being held */}
      <rect x="3" y="22" width="8" height="5" fill="#a1887f" />
      <rect x="4" y="23" width="6" height="3" fill="#7b1fa2" />
      
      {/* Pants */}
      <rect x="11" y="22" width="4" height="6" fill="#3d5a80" />
      <rect x="17" y="22" width="4" height="6" fill="#3d5a80" />
      
      {/* Shoes */}
      <rect x="10" y="27" width="5" height="2" fill="#5d4037" />
      <rect x="17" y="27" width="5" height="2" fill="#5d4037" />
    </svg>
  );
}

// Worker poses - Watering (regando)
export function WorkerWatering({ 
  skinColor = '#e8c39e', 
  hairColor = '#5c3d2e', 
  shirtColor = '#4a6fa5',
  size = 48
}: { 
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      {/* Hair */}
      <rect x="11" y="3" width="10" height="4" fill={hairColor} />
      <rect x="10" y="4" width="1" height="3" fill={hairColor} />
      
      {/* Head */}
      <rect x="11" y="6" width="10" height="8" fill={skinColor} />
      <rect x="10" y="7" width="1" height="6" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="13" y="9" width="2" height="2" fill="#3e2723" />
      <rect x="17" y="9" width="2" height="2" fill="#3e2723" />
      
      {/* Body */}
      <rect x="10" y="14" width="12" height="8" fill={shirtColor} />
      
      {/* Arms holding watering can */}
      <rect x="4" y="14" width="7" height="3" fill={shirtColor} />
      <rect x="21" y="16" width="4" height="4" fill={shirtColor} />
      <rect x="2" y="16" width="4" height="2" fill={skinColor} />
      
      {/* Watering can */}
      <rect x="0" y="17" width="8" height="6" fill="#5d9cec" />
      <rect x="7" y="15" width="3" height="2" fill="#5d9cec" />
      <rect x="9" y="14" width="2" height="1" fill="#5d9cec" />
      
      {/* Water drops */}
      <rect x="1" y="23" width="1" height="2" fill="#82b1ff" />
      <rect x="3" y="24" width="1" height="2" fill="#82b1ff" />
      <rect x="5" y="23" width="1" height="2" fill="#82b1ff" />
      
      {/* Pants */}
      <rect x="11" y="22" width="4" height="6" fill="#3d5a80" />
      <rect x="17" y="22" width="4" height="6" fill="#3d5a80" />
      
      {/* Shoes */}
      <rect x="10" y="27" width="5" height="2" fill="#5d4037" />
      <rect x="17" y="27" width="5" height="2" fill="#5d4037" />
    </svg>
  );
}

// Worker poses - Walking
export function WorkerWalking({ 
  skinColor = '#e8c39e', 
  hairColor = '#5c3d2e', 
  shirtColor = '#4a6fa5',
  size = 48,
  frame = 0
}: { 
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  size?: number;
  frame?: number;
}) {
  const legOffset = frame % 2 === 0 ? 0 : 2;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      {/* Hair */}
      <rect x="11" y="3" width="10" height="4" fill={hairColor} />
      <rect x="10" y="4" width="1" height="3" fill={hairColor} />
      <rect x="21" y="4" width="1" height="3" fill={hairColor} />
      
      {/* Head */}
      <rect x="11" y="6" width="10" height="8" fill={skinColor} />
      <rect x="10" y="7" width="1" height="6" fill={skinColor} />
      <rect x="21" y="7" width="1" height="6" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="13" y="9" width="2" height="2" fill="#3e2723" />
      <rect x="17" y="9" width="2" height="2" fill="#3e2723" />
      
      {/* Body */}
      <rect x="10" y="14" width="12" height="8" fill={shirtColor} />
      
      {/* Arms swinging */}
      <rect x={7 - legOffset} y="16" width="4" height="6" fill={shirtColor} />
      <rect x={21 + legOffset} y="16" width="4" height="6" fill={shirtColor} />
      <rect x={7 - legOffset} y="21" width="3" height="2" fill={skinColor} />
      <rect x={22 + legOffset} y="21" width="3" height="2" fill={skinColor} />
      
      {/* Pants - legs in walking motion */}
      <rect x={11 + legOffset} y="22" width="4" height="6" fill="#3d5a80" />
      <rect x={17 - legOffset} y="22" width="4" height="6" fill="#3d5a80" />
      
      {/* Shoes */}
      <rect x={10 + legOffset} y="27" width="5" height="2" fill="#5d4037" />
      <rect x={17 - legOffset} y="27" width="5" height="2" fill="#5d4037" />
    </svg>
  );
}

// Office worker at desk
export function OfficeWorker({ 
  skinColor = '#e8c39e', 
  hairColor = '#5c3d2e', 
  shirtColor = '#f5f5dc',
  size = 64
}: { 
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 36" style={{ imageRendering: 'pixelated' }}>
      {/* Desk */}
      <rect x="18" y="24" width="28" height="4" fill="#8d6e63" />
      <rect x="20" y="28" width="4" height="8" fill="#6d4c41" />
      <rect x="40" y="28" width="4" height="8" fill="#6d4c41" />
      
      {/* Computer */}
      <rect x="30" y="14" width="12" height="10" fill="#37474f" />
      <rect x="31" y="15" width="10" height="8" fill="#4fc3f7" />
      <rect x="34" y="24" width="6" height="2" fill="#455a64" />
      
      {/* Chair */}
      <rect x="6" y="20" width="14" height="10" fill="#5d4037" />
      <rect x="8" y="30" width="4" height="6" fill="#4e342e" />
      <rect x="14" y="30" width="4" height="6" fill="#4e342e" />
      
      {/* Person sitting */}
      {/* Hair */}
      <rect x="9" y="4" width="8" height="4" fill={hairColor} />
      <rect x="8" y="5" width="1" height="3" fill={hairColor} />
      <rect x="17" y="5" width="1" height="3" fill={hairColor} />
      
      {/* Head */}
      <rect x="9" y="7" width="8" height="6" fill={skinColor} />
      <rect x="8" y="8" width="1" height="4" fill={skinColor} />
      <rect x="17" y="8" width="1" height="4" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="10" y="9" width="2" height="2" fill="#3e2723" />
      <rect x="14" y="9" width="2" height="2" fill="#3e2723" />
      
      {/* Body sitting */}
      <rect x="8" y="13" width="10" height="8" fill={shirtColor} />
      
      {/* Arms on desk */}
      <rect x="16" y="16" width="14" height="3" fill={shirtColor} />
      <rect x="26" y="18" width="4" height="3" fill={skinColor} />
      
      {/* Pants */}
      <rect x="8" y="21" width="10" height="6" fill="#3d5a80" />
    </svg>
  );
}

// Horse standing
export function HorseSprite({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      {/* Body */}
      <rect x="6" y="12" width="18" height="10" fill="#8d6e63" />
      <rect x="5" y="14" width="2" height="6" fill="#795548" />
      <rect x="23" y="14" width="2" height="6" fill="#6d4c41" />
      
      {/* Head */}
      <rect x="0" y="8" width="8" height="8" fill="#8d6e63" />
      <rect x="0" y="10" width="2" height="4" fill="#795548" />
      
      {/* Eye */}
      <rect x="2" y="10" width="2" height="2" fill="#3e2723" />
      <rect x="2" y="10" width="1" height="1" fill="#1a1a1a" />
      
      {/* Ear */}
      <rect x="4" y="6" width="3" height="3" fill="#8d6e63" />
      <rect x="5" y="5" width="2" height="2" fill="#795548" />
      
      {/* Mane */}
      <rect x="6" y="8" width="6" height="4" fill="#5d4037" />
      <rect x="8" y="6" width="4" height="2" fill="#5d4037" />
      <rect x="10" y="10" width="8" height="3" fill="#5d4037" />
      
      {/* Legs */}
      <rect x="8" y="21" width="3" height="8" fill="#795548" />
      <rect x="14" y="21" width="3" height="8" fill="#795548" />
      <rect x="19" y="21" width="3" height="8" fill="#795548" />
      
      {/* Hooves */}
      <rect x="8" y="28" width="3" height="2" fill="#3e2723" />
      <rect x="14" y="28" width="3" height="2" fill="#3e2723" />
      <rect x="19" y="28" width="3" height="2" fill="#3e2723" />
      
      {/* Tail */}
      <rect x="24" y="14" width="4" height="2" fill="#5d4037" />
      <rect x="26" y="16" width="3" height="4" fill="#5d4037" />
      <rect x="27" y="20" width="2" height="2" fill="#5d4037" />
    </svg>
  );
}

// Fountain
export function FountainSprite({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ imageRendering: 'pixelated' }}>
      {/* Base pool */}
      <ellipse cx="24" cy="40" rx="20" ry="6" fill="#90a4ae" />
      <ellipse cx="24" cy="40" rx="18" ry="5" fill="#4fc3f7" />
      <ellipse cx="24" cy="38" rx="14" ry="3" fill="#81d4fa" />
      
      {/* Middle tier */}
      <rect x="18" y="28" width="12" height="10" fill="#b0bec5" />
      <ellipse cx="24" cy="28" rx="8" ry="3" fill="#90a4ae" />
      <ellipse cx="24" cy="28" rx="6" ry="2" fill="#4fc3f7" />
      
      {/* Top tier */}
      <rect x="21" y="18" width="6" height="10" fill="#b0bec5" />
      <ellipse cx="24" cy="18" rx="5" ry="2" fill="#90a4ae" />
      
      {/* Water spout */}
      <rect x="22" y="8" width="4" height="10" fill="#4fc3f7" />
      <rect x="23" y="6" width="2" height="4" fill="#81d4fa" />
      
      {/* Water drops falling */}
      <rect x="16" y="20" width="2" height="3" fill="#4fc3f7" />
      <rect x="30" y="22" width="2" height="3" fill="#4fc3f7" />
      <rect x="12" y="32" width="2" height="3" fill="#4fc3f7" />
      <rect x="34" y="34" width="2" height="3" fill="#4fc3f7" />
      
      {/* Grape decoration on top */}
      <rect x="21" y="3" width="6" height="4" fill="#7b1fa2" />
      <rect x="22" y="2" width="4" height="2" fill="#9c27b0" />
      <rect x="23" y="0" width="2" height="2" fill="#4caf50" />
    </svg>
  );
}

// Wine table with bottles and glasses
export function WineTableSprite({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
      {/* Table top */}
      <rect x="2" y="14" width="28" height="4" fill="#8d6e63" />
      <rect x="3" y="13" width="26" height="1" fill="#a1887f" />
      
      {/* Table legs */}
      <rect x="4" y="18" width="3" height="12" fill="#6d4c41" />
      <rect x="25" y="18" width="3" height="12" fill="#6d4c41" />
      
      {/* Wine bottle */}
      <rect x="6" y="4" width="5" height="10" fill="#1b5e20" />
      <rect x="7" y="1" width="3" height="3" fill="#2e7d32" />
      <rect x="7" y="0" width="3" height="1" fill="#d7ccc8" />
      <rect x="7" y="7" width="3" height="4" fill="#f5f5dc" />
      
      {/* Wine glass 1 */}
      <rect x="14" y="6" width="5" height="4" fill="#e8eaf6" />
      <rect x="13" y="7" width="1" height="2" fill="#c5cae9" />
      <rect x="19" y="7" width="1" height="2" fill="#c5cae9" />
      <rect x="15" y="8" width="3" height="2" fill="#880e4f" />
      <rect x="15" y="10" width="3" height="3" fill="#e8eaf6" />
      <rect x="13" y="13" width="7" height="1" fill="#c5cae9" />
      
      {/* Wine glass 2 */}
      <rect x="22" y="6" width="5" height="4" fill="#e8eaf6" />
      <rect x="21" y="7" width="1" height="2" fill="#c5cae9" />
      <rect x="27" y="7" width="1" height="2" fill="#c5cae9" />
      <rect x="23" y="8" width="3" height="2" fill="#880e4f" />
      <rect x="23" y="10" width="3" height="3" fill="#e8eaf6" />
      <rect x="21" y="13" width="7" height="1" fill="#c5cae9" />
    </svg>
  );
}

// Wooden bench
export function BenchSprite({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 32 16" style={{ imageRendering: 'pixelated' }}>
      {/* Seat */}
      <rect x="0" y="4" width="32" height="4" fill="#8d6e63" />
      <rect x="1" y="3" width="30" height="1" fill="#a1887f" />
      
      {/* Back rest */}
      <rect x="2" y="0" width="28" height="3" fill="#8d6e63" />
      <rect x="3" y="0" width="26" height="1" fill="#a1887f" />
      
      {/* Legs */}
      <rect x="2" y="8" width="4" height="8" fill="#6d4c41" />
      <rect x="14" y="8" width="4" height="8" fill="#6d4c41" />
      <rect x="26" y="8" width="4" height="8" fill="#6d4c41" />
    </svg>
  );
}

// Vendimia banner/sign
export function VendimiaBanner({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 64 26" style={{ imageRendering: 'pixelated' }}>
      {/* Left post */}
      <rect x="2" y="0" width="4" height="26" fill="#5d4037" />
      <rect x="0" y="0" width="8" height="4" fill="#8d6e63" />
      
      {/* Right post */}
      <rect x="58" y="0" width="4" height="26" fill="#5d4037" />
      <rect x="56" y="0" width="8" height="4" fill="#8d6e63" />
      
      {/* Banner */}
      <rect x="6" y="6" width="52" height="14" fill="#8b2942" />
      <rect x="8" y="8" width="48" height="10" fill="#a13350" />
      
      {/* Text "VENDIMIA" */}
      <rect x="12" y="10" width="40" height="6" fill="#ffd700" />
      
      {/* Grape decorations */}
      <rect x="8" y="4" width="4" height="4" fill="#7b1fa2" />
      <rect x="9" y="3" width="2" height="2" fill="#4caf50" />
      <rect x="52" y="4" width="4" height="4" fill="#7b1fa2" />
      <rect x="53" y="3" width="2" height="2" fill="#4caf50" />
    </svg>
  );
}

// Market stall with awning
export function MarketStall({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ imageRendering: 'pixelated' }}>
      {/* Awning */}
      <rect x="0" y="0" width="48" height="12" fill="#f59e0b" />
      <rect x="0" y="0" width="8" height="12" fill="#fbbf24" />
      <rect x="16" y="0" width="8" height="12" fill="#fbbf24" />
      <rect x="32" y="0" width="8" height="12" fill="#fbbf24" />
      
      {/* Counter */}
      <rect x="2" y="12" width="44" height="20" fill="#8d6e63" />
      <rect x="4" y="14" width="40" height="16" fill="#a1887f" />
      
      {/* Products - grapes */}
      <rect x="6" y="16" width="8" height="6" fill="#7b1fa2" />
      <rect x="8" y="15" width="4" height="2" fill="#4caf50" />
      
      {/* Products - bottles */}
      <rect x="18" y="14" width="4" height="10" fill="#1b5e20" />
      <rect x="19" y="12" width="2" height="2" fill="#d7ccc8" />
      <rect x="24" y="14" width="4" height="10" fill="#4a148c" />
      <rect x="25" y="12" width="2" height="2" fill="#d7ccc8" />
      
      {/* Products - barrel */}
      <rect x="32" y="16" width="10" height="12" fill="#8d6e63" />
      <rect x="33" y="18" width="8" height="2" fill="#455a64" />
      <rect x="33" y="24" width="8" height="2" fill="#455a64" />
      
      {/* Legs */}
      <rect x="4" y="32" width="4" height="14" fill="#6d4c41" />
      <rect x="40" y="32" width="4" height="14" fill="#6d4c41" />
    </svg>
  );
}

// Vineyard rows (isometric style)
export function VineyardRow({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 64 32" style={{ imageRendering: 'pixelated' }}>
      {/* Ground */}
      <rect x="0" y="24" width="64" height="8" fill="#c9b896" />
      
      {/* Vine posts */}
      {[0, 16, 32, 48].map((x, i) => (
        <g key={i}>
          <rect x={x + 6} y="8" width="2" height="18" fill="#5d4037" />
          {/* Leaves */}
          <rect x={x + 2} y="4" width="10" height="6" fill="#4caf50" />
          <rect x={x + 4} y="2" width="6" height="3" fill="#66bb6a" />
          {/* Grapes */}
          <rect x={x + 4} y="10" width="4" height="4" fill="#7b1fa2" />
          <rect x={x + 6} y="12" width="3" height="4" fill="#9c27b0" />
        </g>
      ))}
      
      {/* Wire between posts */}
      <rect x="0" y="10" width="64" height="1" fill="#78909c" />
      <rect x="0" y="14" width="64" height="1" fill="#78909c" />
    </svg>
  );
}

// Bodega building
export function BodegaBuilding({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 64 48" style={{ imageRendering: 'pixelated' }}>
      {/* Main building */}
      <rect x="4" y="16" width="56" height="32" fill="#b0a090" />
      <rect x="6" y="18" width="52" height="28" fill="#c9b896" />
      
      {/* Roof */}
      <rect x="0" y="8" width="64" height="10" fill="#8b4513" />
      <rect x="2" y="6" width="60" height="4" fill="#a0522d" />
      <rect x="4" y="4" width="56" height="3" fill="#8b4513" />
      
      {/* Roof tiles pattern */}
      {[0, 8, 16, 24, 32, 40, 48, 56].map((x, i) => (
        <rect key={i} x={x + 2} y={i % 2 === 0 ? 8 : 10} width="6" height="4" fill="#cd853f" />
      ))}
      
      {/* Windows */}
      <rect x="10" y="22" width="8" height="10" fill="#87ceeb" />
      <rect x="12" y="24" width="4" height="6" fill="#add8e6" />
      <rect x="46" y="22" width="8" height="10" fill="#87ceeb" />
      <rect x="48" y="24" width="4" height="6" fill="#add8e6" />
      
      {/* Door */}
      <rect x="26" y="26" width="12" height="20" fill="#5d4037" />
      <rect x="28" y="28" width="8" height="16" fill="#4e342e" />
      <rect x="36" y="34" width="2" height="2" fill="#ffd700" />
      
      {/* Sign */}
      <rect x="20" y="12" width="24" height="6" fill="#f5f0e1" />
      <rect x="22" y="13" width="20" height="4" fill="#8b2942" />
    </svg>
  );
}

// Mountain backdrop
export function MountainBackdrop({ size = 128 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 128 52" style={{ imageRendering: 'pixelated' }}>
      {/* Far mountains */}
      <polygon points="0,52 20,20 40,35 60,10 80,25 100,5 120,20 128,15 128,52" fill="#8b9dc3" />
      
      {/* Snow caps */}
      <polygon points="60,10 50,25 70,25" fill="#ffffff" />
      <polygon points="100,5 88,22 112,22" fill="#ffffff" />
      
      {/* Near mountains */}
      <polygon points="0,52 30,30 50,40 70,25 90,35 110,22 128,30 128,52" fill="#6b7c9c" />
    </svg>
  );
}

// Flag with grape decoration
export function GrapeFlag({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 16 24" style={{ imageRendering: 'pixelated' }}>
      {/* Pole */}
      <rect x="1" y="0" width="2" height="24" fill="#5d4037" />
      <rect x="0" y="0" width="4" height="2" fill="#8d6e63" />
      
      {/* Flag */}
      <rect x="3" y="2" width="12" height="10" fill="#8b2942" />
      <rect x="4" y="3" width="10" height="8" fill="#a13350" />
      
      {/* Grape on flag */}
      <rect x="6" y="4" width="4" height="3" fill="#7b1fa2" />
      <rect x="7" y="6" width="3" height="3" fill="#9c27b0" />
      <rect x="8" y="3" width="2" height="2" fill="#4caf50" />
    </svg>
  );
}

// Sun sprite
export function SunSprite({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ imageRendering: 'pixelated' }}>
      {/* Rays */}
      <rect x="10" y="0" width="4" height="4" fill="#ffc107" />
      <rect x="10" y="20" width="4" height="4" fill="#ffc107" />
      <rect x="0" y="10" width="4" height="4" fill="#ffc107" />
      <rect x="20" y="10" width="4" height="4" fill="#ffc107" />
      
      {/* Diagonal rays */}
      <rect x="2" y="2" width="4" height="4" fill="#ffca28" />
      <rect x="18" y="2" width="4" height="4" fill="#ffca28" />
      <rect x="2" y="18" width="4" height="4" fill="#ffca28" />
      <rect x="18" y="18" width="4" height="4" fill="#ffca28" />
      
      {/* Core */}
      <rect x="6" y="6" width="12" height="12" fill="#ffeb3b" />
      <rect x="8" y="8" width="8" height="8" fill="#fff9c4" />
    </svg>
  );
}
