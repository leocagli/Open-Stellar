"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { MoltbotAgent, LogEntry } from "@/lib/types"
import { DISTRICTS, createAgents, getRandomTask } from "@/lib/data"
import { PixelCity } from "@/components/pixel-city"
import { SidebarPanel } from "@/components/sidebar-panel"

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export default function CityPage() {
  const [agents, setAgents] = useState<MoltbotAgent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const logId = useRef(0)

  useEffect(() => {
    setAgents(createAgents())
    setReady(true)
  }, [])

  const addLog = useCallback((agent: string, message: string, type: LogEntry["type"]) => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
    setLogs(prev => [...prev.slice(-50), { id: logId.current++, time, agent, message, type }])
  }, [])

  useEffect(() => {
    if (paused || !ready) return
    const interval = setInterval(() => {
      setTick(t => t + 1)

      setAgents(prev =>
        prev.map(agent => {
          const updated = { ...agent }
          const district = DISTRICTS.find(d => d.id === agent.district)!

          // Move toward target
          const dx = updated.targetX - updated.pixelX
          const dy = updated.targetY - updated.pixelY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 2) {
            updated.pixelX += (dx / dist) * 1.2
            updated.pixelY += (dy / dist) * 1.2
            updated.direction = dx > 0 ? "right" : "left"
          } else {
            // Pick new target within district
            if (Math.random() < 0.02) {
              updated.targetX = district.x + 30 + Math.random() * (district.w - 60)
              updated.targetY = district.y + 40 + Math.random() * (district.h - 60)
            }
          }

          // Update task progress
          if (updated.status === "working") {
            updated.taskProgress = clamp(updated.taskProgress + Math.random() * 3, 0, 100)
            if (updated.taskProgress >= 100) {
              updated.tasksCompleted++
              updated.taskProgress = 0
              updated.status = Math.random() > 0.1 ? "active" : "idle"
              updated.currentTask = null
              return updated // return early, log will be added below
            }
          }

          // State transitions
          if (Math.random() < 0.008) {
            if (updated.status === "active" || updated.status === "idle") {
              updated.status = "working"
              updated.currentTask = getRandomTask(updated.district)
              updated.taskProgress = 0
            } else if (updated.status === "working" && Math.random() < 0.02) {
              updated.status = "error"
              updated.currentTask = null
            }
          }

          if (updated.status === "error" && Math.random() < 0.03) {
            updated.status = "idle"
          }

          updated.cpu = clamp(updated.cpu + (Math.random() - 0.5) * 6, 5, 99)
          updated.memory = clamp(updated.memory + (Math.random() - 0.5) * 4, 10, 95)
          updated.frame++

          return updated
        })
      )
    }, 60)

    return () => clearInterval(interval)
  }, [paused, ready])

  // Log events from state transitions
  useEffect(() => {
    if (tick % 30 === 0 && tick > 0) {
      const working = agents.filter(a => a.status === "working")
      if (working.length > 0) {
        const a = working[Math.floor(Math.random() * working.length)]
        addLog(a.name, `processing "${a.currentTask}"`, "info")
      }
    }
    if (tick % 60 === 0 && tick > 0) {
      const active = agents.filter(a => a.status === "active")
      if (active.length > 0) {
        const a = active[Math.floor(Math.random() * active.length)]
        addLog(a.name, `completed task #${a.tasksCompleted}`, "success")
      }
    }
    if (tick % 100 === 0 && tick > 0) {
      const errored = agents.filter(a => a.status === "error")
      if (errored.length > 0) {
        const a = errored[0]
        addLog(a.name, "encountered an error, restarting...", "error")
      }
    }
  }, [tick, agents, addLog])

  const selectedAgent = agents.find(a => a.id === selectedAgentId) ?? null

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw", background: "#0a0e17", color: "#22d3ee", fontFamily: "monospace", fontSize: 14 }}>
        Initializing Moltbot City...
      </div>
    )
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#0a0e17" }}>
      {/* City canvas area */}
      <div style={{ flex: 1, position: "relative" }}>
        <PixelCity
          agents={agents}
          districts={DISTRICTS}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
          tick={tick}
        />

        {/* Controls overlay */}
        <div style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          display: "flex",
          gap: 8,
        }}>
          <button
            onClick={() => setPaused(!paused)}
            style={{
              padding: "6px 14px",
              background: paused ? "#22d3ee" : "#1e293b",
              color: paused ? "#000" : "#e2e8f0",
              border: "1px solid #2a3a52",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <SidebarPanel
        agents={agents}
        selectedAgent={selectedAgent}
        logs={logs}
        onSelectAgent={setSelectedAgentId}
      />
    </div>
  )
}
