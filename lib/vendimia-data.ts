import type { Agent, ChatMessage, Building } from './vendimia-types';

export const initialAgents: Agent[] = [
  // Vinedo - cosecha, riego, poda
  { id: '1', name: 'Valentina', avatar: '👩‍🌾', task: 'cosecha', location: 'vinedo', progress: 75, x: 25, y: 45, color: '#8B5CF6', skinColor: '#e8c39e', hairColor: '#5c3d2e', shirtColor: '#4a6fa5' },
  { id: '3', name: 'Camila', avatar: '👩‍🌾', task: 'poda', location: 'vinedo', progress: 30, x: 45, y: 65, color: '#10B981', skinColor: '#c9a86c', hairColor: '#1a1a1a', shirtColor: '#2d5a27' },
  { id: '11', name: 'Tomas', avatar: '👨‍🌾', task: 'cosecha', location: 'vinedo', progress: 55, x: 75, y: 45, color: '#F59E0B', skinColor: '#d4a574', hairColor: '#8b4513', shirtColor: '#8b3a62' },
  
  // Fermentacion - embotellado
  { id: '5', name: 'Santiago', avatar: '👨‍🍳', task: 'embotellado', location: 'bodega', progress: 55, x: 70, y: 60, color: '#6366F1', skinColor: '#d4a574', hairColor: '#4a3728', shirtColor: '#f5f5dc' },
  
  // Oficina - administracion
  { id: '13', name: 'Elena', avatar: '👩‍💼', task: 'administracion', location: 'oficina', progress: 70, x: 50, y: 50, color: '#059669', skinColor: '#e8c39e', hairColor: '#8b4513', shirtColor: '#2d5a27' },
  
  // Plaza - venta, cata, atención
  { id: '8', name: 'Rosita', avatar: '👩‍🍷', task: 'cata', location: 'plaza', progress: 40, x: 30, y: 45, color: '#3B82F6', skinColor: '#d4a574', hairColor: '#2c1810', shirtColor: '#4a6fa5' },
  { id: '10', name: 'Pancho', avatar: '👨‍🌾', task: 'venta', location: 'plaza', progress: 35, x: 70, y: 50, color: '#10B981', skinColor: '#c9a86c', hairColor: '#3d2914', shirtColor: '#f5f5dc' },
  { id: '12', name: 'Marta', avatar: '👩‍🍳', task: 'atención', location: 'plaza', progress: 50, x: 40, y: 35, color: '#DC2626', skinColor: '#e8c39e', hairColor: '#8b4513', shirtColor: '#8b3a40' },
];

export const buildings: Building[] = [
  { id: 'bodega', name: 'Bodega Central', type: 'bodega', x: 35, y: 35, width: 30, height: 25 },
  { id: 'mercado', name: 'Mercado de Skills', type: 'mercado', x: 10, y: 55, width: 20, height: 15 },
  { id: 'oficina', name: 'Oficina IA', type: 'oficina', x: 70, y: 60, width: 18, height: 15 },
  { id: 'plaza', name: 'Plaza Vendimia', type: 'plaza', x: 45, y: 70, width: 15, height: 12 },
];

export const taskLabels: Record<string, { label: string; icon: string }> = {
  // Vinedo
  cosecha: { label: 'Cosecha', icon: '🍇' },
  riego: { label: 'Riego', icon: '💧' },
  poda: { label: 'Poda', icon: '✂️' },
  // Fermentacion
  fermentacion: { label: 'Fermentacion', icon: '🧪' },
  embotellado: { label: 'Embotellado', icon: '🍾' },
  // Oficina - solo administrativas
  administracion: { label: 'Administracion', icon: '📋' },
  contabilidad: { label: 'Contabilidad', icon: '📊' },
  marketing: { label: 'Marketing', icon: '📢' },
  // Plaza - cata, venta, atención
  cata: { label: 'Cata', icon: '🍷' },
  venta: { label: 'Venta', icon: '💰' },
  atención: { label: 'Atención', icon: '🍺' },
  espera: { label: 'En espera', icon: '⏳' },
  descanso: { label: 'Descanso', icon: '😴' },
};

// Use static IDs to avoid hydration issues
export const initialMessages: ChatMessage[] = [
  { id: 'welcome-msg-001', agentName: 'Sistema', message: 'Bienvenidos a Vendimia World!', timestamp: new Date('2024-03-01T10:00:00'), type: 'celebration' },
  { id: 'welcome-msg-002', agentName: 'Valentina', message: 'Cosecha Malbec al 75%', timestamp: new Date('2024-03-01T10:00:01'), type: 'task' },
  { id: 'welcome-msg-003', agentName: 'Santiago', message: 'Embotellado en progreso', timestamp: new Date('2024-03-01T10:00:02'), type: 'info' },
  { id: 'welcome-msg-004', agentName: 'Sistema', message: 'Agentes IA sincronizados', timestamp: new Date('2024-03-01T10:00:03'), type: 'info' },
];

export const celebrationMessages = [
  '¡Viva la vendimia!',
  '¡Excelente cosecha!',
  '¡Los Andes nos bendicen!',
  '¡Malbec de primera!',
  '¡Mendoza orgullosa!',
];

// Mapeo de tareas a escenas - cada tarea pertenece a una escena especifica
export const taskToScene: Record<string, string> = {
  // Vinedo - trabajo de campo
  cosecha: 'vinedo',
  poda: 'vinedo',
  // Fermentacion - produccion de vino
  embotellado: 'fermentacion',
  // Oficina - administracion
  administracion: 'oficina',
  // Plaza - cata, venta, atención
  cata: 'plaza-central',
  venta: 'plaza-central',
  atención: 'plaza-central',
  espera: 'plaza-central',
  descanso: 'plaza-central',
};

// Funcion helper para obtener agentes de una escena
export function getAgentsForScene(agents: Agent[], scene: string): Agent[] {
  return agents.filter(agent => taskToScene[agent.task] === scene);
}
