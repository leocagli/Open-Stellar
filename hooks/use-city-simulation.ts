"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { MoltbotAgent, District, DistrictType } from "@/lib/moltbot-types"
import { generateAgents, generateDistricts, updateAgentSimulation, computeCityStats } from "@/lib/moltbot-data"

export function useCitySimulation() {
  const [agents, setAgents] = useState<MoltbotAgent[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedAgent, setSelectedAgent] = useState<MoltbotAgent | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType | null>(null)
  const [isRunning, setIsRunning] = useState(true)
  const [speed, setSpeed] = useState<1 | 2 | 4>(1)
  const [logs, setLogs] = useState<string[]>([])
  const tickRef = useRef(0)

  useEffect(() => {
    const initialAgents = generateAgents()
    setAgents(initialAgents)
    setDistricts(generateDistricts(initialAgents))
    setLogs(["[SYSTEM] Moltbot City initialized", "[SYSTEM] 18 agents deployed across 5 districts"])
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setAgents((prev) => {
        const updated = updateAgentSimulation(prev)

        // Generate logs for status changes
        const newLogs: string[] = []
        updated.forEach((agent, i) => {
          const oldAgent = prev[i]
          if (oldAgent && agent.status !== oldAgent.status) {
            const time = new Date().toLocaleTimeString("en-US", { hour12: false })
            if (agent.status === "working" && agent.currentTask) {
              newLogs.push(`[${time}] ${agent.name} started: ${agent.currentTask.name}`)
            } else if (agent.status === "error") {
              newLogs.push(`[${time}] ${agent.name} ERROR: ${agent.lastActivity}`)
            } else if (oldAgent.status === "working" && agent.status === "active") {
              newLogs.push(`[${time}] ${agent.name} completed task successfully`)
            } else if (oldAgent.status === "error" && agent.status !== "error") {
              newLogs.push(`[${time}] ${agent.name} recovered from error`)
            }
          }
        })

        if (newLogs.length > 0) {
          setLogs((prev) => [...newLogs, ...prev].slice(0, 50))
        }

        setDistricts(generateDistricts(updated))

        // Keep selected agent in sync
        setSelectedAgent((sel) => {
          if (!sel) return null
          return updated.find((a) => a.id === sel.id) || null
        })

        tickRef.current += 1
        return updated
      })
    }, 2000 / speed)

    return () => clearInterval(interval)
  }, [isRunning, speed])

  const stats = computeCityStats(agents)

  const filteredAgents = selectedDistrict
    ? agents.filter((a) => a.district === selectedDistrict)
    : agents

  const toggleSimulation = useCallback(() => setIsRunning((r) => !r), [])

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))
  }, [])

  return {
    agents: filteredAgents,
    allAgents: agents,
    districts,
    stats,
    selectedAgent,
    setSelectedAgent,
    selectedDistrict,
    setSelectedDistrict,
    isRunning,
    toggleSimulation,
    speed,
    cycleSpeed,
    logs,
    tick: tickRef.current,
  }
}
