import { useState, useEffect, useCallback } from "react"
import type { MoltbotAgent, District, DistrictType } from "@/lib/types"
import { generateAgents, generateDistricts, tickAgents, computeStats } from "@/lib/data"

export function useCitySimulation() {
  const [agents, setAgents] = useState<MoltbotAgent[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedAgent, setSelectedAgent] = useState<MoltbotAgent | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType | null>(null)
  const [isRunning, setIsRunning] = useState(true)
  const [speed, setSpeed] = useState<1 | 2 | 4>(1)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const init = generateAgents()
    setAgents(init)
    setDistricts(generateDistricts(init))
    setLogs(["[SYSTEM] Moltbot City initialized", "[SYSTEM] 18 agents deployed across 5 districts"])
  }, [])

  useEffect(() => {
    if (!isRunning) return
    const iv = setInterval(() => {
      setAgents((prev) => {
        const updated = tickAgents(prev)
        const newLogs: string[] = []
        updated.forEach((a, i) => {
          const old = prev[i]
          if (old && a.status !== old.status) {
            const t = new Date().toLocaleTimeString("en-US", { hour12: false })
            if (a.status === "working" && a.currentTask) newLogs.push(`[${t}] ${a.name} started: ${a.currentTask.name}`)
            else if (a.status === "error") newLogs.push(`[${t}] ${a.name} ERROR: ${a.lastActivity}`)
            else if (old.status === "working" && a.status === "active") newLogs.push(`[${t}] ${a.name} completed task successfully`)
            else if (old.status === "error" && a.status !== "error") newLogs.push(`[${t}] ${a.name} recovered from error`)
          }
        })
        if (newLogs.length > 0) setLogs((p) => [...newLogs, ...p].slice(0, 50))
        setDistricts(generateDistricts(updated))
        setSelectedAgent((sel) => sel ? updated.find((a) => a.id === sel.id) || null : null)
        return updated
      })
    }, 2000 / speed)
    return () => clearInterval(iv)
  }, [isRunning, speed])

  const stats = computeStats(agents)
  const filtered = selectedDistrict ? agents.filter((a) => a.district === selectedDistrict) : agents
  const toggleSimulation = useCallback(() => setIsRunning((r) => !r), [])
  const cycleSpeed = useCallback(() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1)), [])

  return { agents: filtered, districts, stats, selectedAgent, setSelectedAgent, selectedDistrict, setSelectedDistrict, isRunning, toggleSimulation, speed, cycleSpeed, logs }
}
