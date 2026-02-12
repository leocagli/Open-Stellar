import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import BuildingMarker from '../components/BuildingMarker'
import AgentMarker from '../components/AgentMarker'
import TaskPanel from '../components/TaskPanel'
import { sampleBuildings, defaultSpawnPoint } from '../data/buildings'
import type { Agent, Task, Building } from '../types/map'
import './MapPage.css'

let nextAgentId = 1
let nextTaskId = 1

export default function MapPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [buildings] = useState<Building[]>(sampleBuildings)
  const [agentTimeouts, setAgentTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())

  // Create a new agent
  const handleCreateAgent = useCallback((name: string) => {
    const newAgent: Agent = {
      id: `agent-${nextAgentId++}`,
      name,
      position: { ...defaultSpawnPoint },
      status: 'idle'
    }
    setAgents(prev => [...prev, newAgent])
  }, [])

  // Create a task from building
  const handleTaskSelect = useCallback((buildingId: string, taskName: string) => {
    const building = buildings.find(b => b.id === buildingId)
    if (!building) return

    const newTask: Task = {
      id: `task-${nextTaskId++}`,
      buildingId,
      buildingName: building.name,
      description: taskName,
      status: 'pending'
    }
    setTasks(prev => [...prev, newTask])
  }, [buildings])

  // Assign a task to an agent
  const handleAssignTask = useCallback((agentId: string, taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    const building = buildings.find(b => b.id === task?.buildingId)
    
    if (!task || !building) return

    // Update task status
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: 'assigned', assignedAgentId: agentId }
        : t
    ))

    // Update agent with task and start movement
    setAgents(prev => prev.map(a =>
      a.id === agentId
        ? {
            ...a,
            status: 'moving',
            assignedTask: { ...task, status: 'in-progress' },
            targetBuilding: building
          }
        : a
    ))
  }, [tasks, buildings])

  // Clear all tasks
  const handleClearTasks = useCallback(() => {
    if (confirm('Are you sure you want to clear all tasks and reset agents?')) {
      setTasks([])
      setAgents(prev => prev.map(a => ({
        ...a,
        status: 'idle',
        assignedTask: undefined,
        targetBuilding: undefined
      })))
    }
  }, [])

  // Simulate agent movement and task completion
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === 'moving' && agent.targetBuilding) {
          const { lat: targetLat, lng: targetLng } = agent.targetBuilding.coordinates
          const { lat: currentLat, lng: currentLng } = agent.position
          
          // Calculate distance
          const distance = Math.sqrt(
            Math.pow(targetLat - currentLat, 2) + 
            Math.pow(targetLng - currentLng, 2)
          )
          
          // If close enough, start working
          if (distance < 0.001) {
            return {
              ...agent,
              position: agent.targetBuilding.coordinates,
              status: 'working'
            }
          }
          
          // Move towards target
          const speed = 0.0002 // units per tick
          const dx = (targetLat - currentLat) * speed / distance
          const dy = (targetLng - currentLng) * speed / distance
          
          return {
            ...agent,
            position: {
              lat: currentLat + dx,
              lng: currentLng + dy
            }
          }
        }
        
        // Simulate task completion after working for a while
        if (agent.status === 'working' && agent.assignedTask) {
          // Clear any existing timeout for this agent
          const existingTimeout = agentTimeouts.get(agent.id)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }
          
          // Complete task after 5 seconds
          const timeoutId = setTimeout(() => {
            setTasks(prev => prev.map(t =>
              t.id === agent.assignedTask?.id
                ? { ...t, status: 'completed' }
                : t
            ))
            setAgents(prev => prev.map(a =>
              a.id === agent.id
                ? {
                    ...a,
                    status: 'idle',
                    assignedTask: undefined,
                    targetBuilding: undefined
                  }
                : a
            ))
            // Remove timeout from map after it completes
            setAgentTimeouts(prev => {
              const next = new Map(prev)
              next.delete(agent.id)
              return next
            })
          }, 5000)
          
          // Store timeout ID
          setAgentTimeouts(prev => new Map(prev).set(agent.id, timeoutId))
        }
        
        return agent
      }))
    }, 100) // Update every 100ms

    return () => {
      clearInterval(interval)
      // Clear all timeouts when component unmounts
      agentTimeouts.forEach(timeoutId => clearTimeout(timeoutId))
    }
  }, [agentTimeouts])

  return (
    <div className="map-page">
      <div className="map-container-wrapper">
        <MapContainer
          center={[40.7300, -73.9950]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {buildings.map(building => (
            <BuildingMarker
              key={building.id}
              building={building}
              onTaskSelect={handleTaskSelect}
            />
          ))}
          
          {agents.map(agent => (
            <AgentMarker
              key={agent.id}
              agent={agent}
            />
          ))}
        </MapContainer>
      </div>
      
      <TaskPanel
        agents={agents}
        tasks={tasks}
        onCreateAgent={handleCreateAgent}
        onAssignTask={handleAssignTask}
        onClearTasks={handleClearTasks}
      />
    </div>
  )
}
