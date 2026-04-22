"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PixelCity } from "@/components/pixel-city"
import { SidebarPanel } from "@/components/sidebar-panel"
import { DISTRICTS, createAgents, generateChatMessage, getRandomTask } from "@/lib/data"
import type { ChatMessage, LogEntry, MoltbotAgent, WalletTransaction } from "@/lib/types"

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function OpenStellarHub() {
  const [agents, setAgents] = useState<MoltbotAgent[]>(() => createAgents())
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [tick, setTick] = useState(0)

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) || null,
    [agents, selectedAgentId]
  )

  const pushLog = useCallback((message: string, type: LogEntry["type"] = "info", agent = "system") => {
    setLogs((prev) => [
      ...prev.slice(-79),
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        time: nowTime(),
        agent,
        message,
        type,
      },
    ])
  }, [])

  const agentsRef = useRef(agents)
  useEffect(() => { agentsRef.current = agents }, [agents])

  useEffect(() => {
    pushLog("Open-Stellar v0 frontend initialized", "success")
  }, [pushLog])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((prev) => prev + 1)

      setAgents((prev) =>
        prev.map((agent) => {
          const progressDelta = Math.random() * 14
          const taskProgress = Math.min(100, agent.taskProgress + progressDelta)
          const finishedTask = taskProgress >= 100

          return {
            ...agent,
            cpu: Math.max(10, Math.min(98, agent.cpu + (Math.random() - 0.5) * 10)),
            memory: Math.max(20, Math.min(95, agent.memory + (Math.random() - 0.5) * 6)),
            status: finishedTask
              ? "active"
              : Math.random() < 0.04
              ? "idle"
              : "working",
            taskProgress: finishedTask ? 0 : taskProgress,
            tasksCompleted: finishedTask ? agent.tasksCompleted + 1 : agent.tasksCompleted,
            currentTask: finishedTask ? getRandomTask(agent.district) : agent.currentTask,
            targetX: agent.targetX + (Math.random() - 0.5) * 40,
            targetY: agent.targetY + (Math.random() - 0.5) * 28,
            pixelX: agent.pixelX + (Math.random() - 0.5) * 4,
            pixelY: agent.pixelY + (Math.random() - 0.5) * 3,
            direction: Math.random() > 0.5 ? "right" : "left",
          }
        })
      )
    }, 1200)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const chatInterval = window.setInterval(() => {
      setChatMessages((prev) => {
        const next = generateChatMessage(agentsRef.current)
        if (!next) return prev

        if (Math.random() < 0.5) {
          pushLog(`relay ${next.fromName} -> ${next.toName}: ${next.message}`, "info", next.fromName)
        }

        return [...prev.slice(-79), next]
      })
    }, 2200)

    return () => window.clearInterval(chatInterval)
  }, [pushLog])

  const handleSelectAgent = useCallback((id: string | null) => {
    setSelectedAgentId(id)

    const picked = agentsRef.current.find((agent) => agent.id === id)
    if (picked) {
      pushLog(`agent selected: ${picked.name} (${picked.model})`, "info", picked.name)
    }
  }, [pushLog])

  const handleUpdateAgentWallet = useCallback((agentId: string, wallet: MoltbotAgent["wallet"]) => {
    setAgents((prev) => {
      const updated = prev.map((agent) => (agent.id === agentId ? { ...agent, wallet } : agent))
      const updatedAgent = updated.find((agent) => agent.id === agentId)
      if (updatedAgent && wallet?.publicKey) {
        pushLog(`wallet linked: ${updatedAgent.name} -> ${wallet.publicKey.slice(0, 8)}...`, "success", updatedAgent.name)
      }
      return updated
    })
  }, [pushLog])

  const handleAddTransaction = useCallback((tx: WalletTransaction) => {
    setTransactions((prev) => [tx, ...prev.slice(0, 99)])
    pushLog(`tx ${tx.fromName} -> ${tx.toName} (${tx.amount} XLM)`, "success", tx.fromName)
  }, [pushLog])

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", overflow: "hidden", background: "#030712" }}>
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <PixelCity
          agents={agents}
          districts={DISTRICTS}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          tick={tick}
        />
      </div>

      <SidebarPanel
        agents={agents}
        selectedAgent={selectedAgent}
        logs={logs}
        chatMessages={chatMessages}
        transactions={transactions}
        onSelectAgent={handleSelectAgent}
        onUpdateAgent={handleUpdateAgentWallet}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  )
}
