'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent, ChatMessage } from '@/lib/vendimia-types';
import { initialAgents, initialMessages, celebrationMessages, taskLabels } from '@/lib/vendimia-data';
import { GameWorld } from './game-world';
import { ChatPanel } from './chat-panel';
import { AgentsSidebar } from './agents-sidebar';
import { Toolbar } from './toolbar';
import { TopBar } from './top-bar';

const TASKS = ['cosecha', 'riego', 'poda', 'fermentacion', 'embotellado', 'cata'] as const;

function getRandomTask() {
  return TASKS[Math.floor(Math.random() * TASKS.length)];
}

export function VendimiaWorld() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const messageIdRef = useRef(100);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [day, setDay] = useState(1);
  const [totalGrapes, setTotalGrapes] = useState(12450);
  const [showWelcome, setShowWelcome] = useState(true);

  // Use a stable ref for addMessage to avoid dependency issues
  const addMessageRef = useRef<(msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void>(() => {});
  
  // Update the ref with the actual function
  addMessageRef.current = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    messageIdRef.current += 1;
    const uniqueId = `msg-${messageIdRef.current}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: ChatMessage = {
      ...msg,
      id: uniqueId,
      timestamp: new Date()
    };
    setMessages(prev => [...prev.slice(-20), newMessage]);
  };

  // Stable wrapper function that uses the ref
  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    addMessageRef.current(msg);
  };

  // Simulate agent progress
  useEffect(() => {
    const completedAgentsRef = new Set<string>();
    
    const interval = setInterval(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => {
          const newProgress = agent.progress + Math.random() * 3;
          
          if (newProgress >= 100 && !completedAgentsRef.has(agent.id)) {
            completedAgentsRef.add(agent.id);
            const taskInfo = taskLabels[agent.task];
            
            setTimeout(() => {
              addMessageRef.current({
                agentName: agent.name,
                message: `${taskInfo.label} completada!`,
                type: 'celebration'
              });
              completedAgentsRef.delete(agent.id);
            }, 0);
            
            setTotalGrapes(prev => prev + Math.floor(Math.random() * 500 + 200));
            
            return {
              ...agent,
              progress: 0,
              task: getRandomTask()
            };
          }
          
          return { ...agent, progress: Math.min(newProgress, 100) };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simulate day passing
  useEffect(() => {
    const dayInterval = setInterval(() => {
      setDay(prev => {
        const newDay = prev + 1;
        if (newDay % 7 === 0) {
          setTimeout(() => {
            addMessageRef.current({
              agentName: 'Sistema',
              message: celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)],
              type: 'celebration'
            });
          }, 0);
        }
        return newDay;
      });
    }, 30000);

    return () => clearInterval(dayInterval);
  }, []);

  // Move agents randomly
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          x: Math.max(10, Math.min(90, agent.x + (Math.random() - 0.5) * 8)),
          y: Math.max(20, Math.min(85, agent.y + (Math.random() - 0.5) * 6))
        }))
      );
    }, 5000);

    return () => clearInterval(moveInterval);
  }, []);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    addMessage({
      agentName: 'Sistema',
      message: `Agente ${agent.name} seleccionado`,
      type: 'info'
    });
  };

  const handleToolSelect = (tool: string) => {
    setActiveTool(activeTool === tool ? null : tool);
    addMessage({
      agentName: 'Sistema',
      message: `Herramienta: ${tool}`,
      type: 'info'
    });
  };

  const handleSendMessage = (message: string) => {
    addMessage({
      agentName: 'Usuario',
      message,
      type: 'info'
    });

    // Simulate AI response
    setTimeout(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      addMessage({
        agentName: randomAgent.name,
        message: `Recibido! Procesando "${message}"...`,
        type: 'task'
      });
    }, 1000);
  };

  const getSeason = () => {
    if (day <= 90) return 'Verano - Cosecha';
    if (day <= 180) return 'Otoño - Fermentación';
    if (day <= 270) return 'Invierno - Poda';
    return 'Primavera - Floración';
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Welcome Modal - Pixel art style */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(35, 30, 25, 0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-md w-full"
              style={{
                backgroundColor: '#f5f0e1',
                border: '4px solid #4a3728',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.3)'
              }}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              {/* Header bar */}
              <div 
                className="px-4 py-2 flex items-center gap-2"
                style={{ backgroundColor: '#8b2942', borderBottom: '3px solid #5c1a2a' }}
              >
                <span className="text-2xl">🍇</span>
                <span 
                  className="text-base font-bold"
                  style={{ fontFamily: 'var(--font-vt323)', color: '#ffd700', letterSpacing: '2px' }}
                >
                  VENDIMIA WORLD
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <p 
                  className="mb-6 text-base leading-relaxed"
                  style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                >
                  Una ciudad de agentes IA inspirada en Mendoza y la vendimia argentina. 
                  Observa como los agentes trabajan en los vinedos, la bodega y el mercado.
                </p>
                
                <div className="space-y-3 mb-6">
                  {[
                    { icon: '👆', text: 'Toca un agente para ver su informacion' },
                    { icon: '💬', text: 'Usa el chat para interactuar' },
                    { icon: '👥', text: 'Panel de agentes a la derecha' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ backgroundColor: '#4a3728' }}
                      >
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <span 
                        className="text-sm"
                        style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-3 font-bold"
                  style={{ 
                    fontFamily: 'var(--font-vt323)',
                    fontSize: '18px',
                    backgroundColor: '#4a3728',
                    color: '#f5f0e1',
                    border: '3px solid #2a1f18',
                    boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                    letterSpacing: '2px'
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 2, boxShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}
                >
                  COMENZAR
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Game World */}
        <div className="flex-1 relative">
          <TopBar season={getSeason()} day={day} totalGrapes={totalGrapes} />
          
          <GameWorld
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentClick={handleAgentClick}
          />

          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
          />

          <Toolbar
            onToolSelect={handleToolSelect}
            activeTool={activeTool}
          />
        </div>

        {/* Sidebar */}
        <AgentsSidebar
          agents={agents}
          selectedAgent={selectedAgent}
          onAgentSelect={handleAgentClick}
        />
      </div>

      {/* Selected Agent Detail - Mobile */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            className="fixed bottom-20 left-4 right-4 md:hidden z-30"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="bg-card/95 backdrop-blur-md border-2 border-primary rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: selectedAgent.color }}
                  >
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h3 
                      className="font-bold text-card-foreground"
                      style={{ fontFamily: 'var(--font-vt323)' }}
                    >
                      {selectedAgent.name}
                    </h3>
                    <p 
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: 'var(--font-vt323)' }}
                    >
                      {taskLabels[selectedAgent.task].icon} {taskLabels[selectedAgent.task].label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: selectedAgent.color,
                    width: `${selectedAgent.progress}%`
                  }}
                />
              </div>
              <p 
                className="mt-2 text-xs text-right text-muted-foreground"
                style={{ fontFamily: 'var(--font-vt323)' }}
              >
                Progreso: {Math.round(selectedAgent.progress)}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
