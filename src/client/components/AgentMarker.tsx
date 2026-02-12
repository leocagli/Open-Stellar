import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import type { Agent } from '../types/map'

interface AgentMarkerProps {
  agent: Agent
}

// Custom icon for agents based on status
const getAgentIcon = (status: Agent['status']) => {
  const colors = {
    idle: '#10B981',
    moving: '#F59E0B',
    working: '#EF4444'
  }
  
  const color = colors[status]
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
        <path d="M7 18C7 15.7909 9.23858 14 12 14C14.7614 14 17 15.7909 17 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

export default function AgentMarker({ agent }: AgentMarkerProps) {
  const markerRef = useRef<L.Marker>(null)

  // Animate marker position when agent moves
  useEffect(() => {
    if (markerRef.current && agent.status === 'moving' && agent.targetBuilding) {
      const marker = markerRef.current
      const targetPos = agent.targetBuilding.coordinates
      
      // Smooth animation to target position
      const currentLatLng = marker.getLatLng()
      const steps = 50
      let step = 0
      
      const animate = () => {
        if (step < steps) {
          step++
          const progress = step / steps
          const newLat = currentLatLng.lat + (targetPos.lat - currentLatLng.lat) * progress
          const newLng = currentLatLng.lng + (targetPos.lng - currentLatLng.lng) * progress
          marker.setLatLng([newLat, newLng])
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }
  }, [agent.status, agent.targetBuilding])

  const statusText = {
    idle: 'Idle',
    moving: 'Moving to destination',
    working: 'Working on task'
  }

  return (
    <Marker
      ref={markerRef}
      position={[agent.position.lat, agent.position.lng]}
      icon={getAgentIcon(agent.status)}
    >
      <Popup>
        <div className="agent-popup">
          <h3>{agent.name}</h3>
          <p className={`status status-${agent.status}`}>
            {statusText[agent.status]}
          </p>
          {agent.assignedTask && (
            <div className="task-info">
              <strong>Task:</strong> {agent.assignedTask.description}
              <br />
              <strong>Building:</strong> {agent.assignedTask.buildingName}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
