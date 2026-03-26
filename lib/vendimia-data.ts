import type { Agent, ChatMessage, Building } from './vendimia-types';

export const initialAgents: Agent[] = [
  { id: '1', name: 'Valentina', avatar: '👩‍🌾', task: 'cosecha', location: 'viñedo-norte', progress: 75, x: 15, y: 35, color: '#8B5CF6', skinColor: '#e8c39e', hairColor: '#5c3d2e', shirtColor: '#4a6fa5' },
  { id: '2', name: 'Martín', avatar: '👨‍🌾', task: 'riego', location: 'viñedo-sur', progress: 45, x: 80, y: 30, color: '#3B82F6', skinColor: '#d4a574', hairColor: '#2c1810', shirtColor: '#4a6fa5' },
  { id: '3', name: 'Lucía', avatar: '👩‍🔬', task: 'fermentacion', location: 'bodega', progress: 90, x: 42, y: 42, color: '#EC4899', skinColor: '#f5d6c6', hairColor: '#8b4513', shirtColor: '#f5f5dc' },
  { id: '4', name: 'Diego', avatar: '👨‍💼', task: 'cata', location: 'oficina', progress: 60, x: 72, y: 62, color: '#F59E0B', skinColor: '#e8c39e', hairColor: '#3d2914', shirtColor: '#8b2942' },
  { id: '5', name: 'Camila', avatar: '👩‍💻', task: 'poda', location: 'viñedo-norte', progress: 30, x: 88, y: 50, color: '#10B981', skinColor: '#c9a86c', hairColor: '#1a1a1a', shirtColor: '#2d5a27' },
  { id: '6', name: 'Santiago', avatar: '👨‍🍳', task: 'embotellado', location: 'bodega', progress: 55, x: 22, y: 72, color: '#6366F1', skinColor: '#d4a574', hairColor: '#4a3728', shirtColor: '#f5f5dc' },
];

export const buildings: Building[] = [
  { id: 'bodega', name: 'Bodega Central', type: 'bodega', x: 35, y: 35, width: 30, height: 25 },
  { id: 'mercado', name: 'Mercado de Skills', type: 'mercado', x: 10, y: 55, width: 20, height: 15 },
  { id: 'oficina', name: 'Oficina IA', type: 'oficina', x: 70, y: 60, width: 18, height: 15 },
  { id: 'plaza', name: 'Plaza Vendimia', type: 'plaza', x: 45, y: 70, width: 15, height: 12 },
];

export const taskLabels: Record<string, { label: string; icon: string }> = {
  cosecha: { label: 'Cosecha', icon: '🍇' },
  riego: { label: 'Riego', icon: '💧' },
  poda: { label: 'Poda', icon: '✂️' },
  fermentacion: { label: 'Fermentación', icon: '🧪' },
  embotellado: { label: 'Embotellado', icon: '🍾' },
  cata: { label: 'Cata', icon: '🍷' },
  descanso: { label: 'Descanso', icon: '😴' },
};

// Use static IDs to avoid hydration issues
export const initialMessages: ChatMessage[] = [
  { id: 'welcome-msg-001', agentName: 'Sistema', message: 'Bienvenidos a Vendimia World!', timestamp: new Date('2024-03-01T10:00:00'), type: 'celebration' },
  { id: 'welcome-msg-002', agentName: 'Valentina', message: 'Cosecha Malbec al 75%', timestamp: new Date('2024-03-01T10:00:01'), type: 'task' },
  { id: 'welcome-msg-003', agentName: 'Lucia', message: 'Fermentacion casi lista', timestamp: new Date('2024-03-01T10:00:02'), type: 'info' },
  { id: 'welcome-msg-004', agentName: 'Sistema', message: 'Agentes IA sincronizados', timestamp: new Date('2024-03-01T10:00:03'), type: 'info' },
];

export const celebrationMessages = [
  '¡Viva la vendimia!',
  '¡Excelente cosecha!',
  '¡Los Andes nos bendicen!',
  '¡Malbec de primera!',
  '¡Mendoza orgullosa!',
];
