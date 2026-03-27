export type AgentTask = 
  | 'cosecha' 
  | 'riego' 
  | 'poda' 
  | 'fermentacion' 
  | 'embotellado'
  | 'cata'
  | 'descanso'
  | 'administracion'
  | 'contabilidad'
  | 'marketing'
  | 'venta'
  | 'espera';

export type AgentLocation = 
  | 'viñedo-norte'
  | 'viñedo-sur'
  | 'bodega'
  | 'plaza'
  | 'mercado'
  | 'oficina';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  task: AgentTask;
  location: AgentLocation;
  progress: number;
  x: number;
  y: number;
  color: string;
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
}

export interface ChatMessage {
  id: string;
  agentName: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'task' | 'celebration' | 'warning';
}

export interface Building {
  id: string;
  name: string;
  type: 'bodega' | 'mercado' | 'oficina' | 'plaza' | 'viñedo';
  x: number;
  y: number;
  width: number;
  height: number;
}
