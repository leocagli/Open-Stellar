"use client"

import type { MoltbotAgent, District, LogEntry } from "@/lib/types"
import { DISTRICTS } from "@/lib/data"

interface SidebarPanelProps {
  agents: MoltbotAgent[]
  selectedAgent: MoltbotAgent | null
  logs: LogEntry[]
  onSelectAgent: (id: string | null) => void
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: "#1a2235",
      borderRadius: 6,
      padding: "8px 10px",
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
    </div>
  )
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ background: "#0a0e17", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.3s" }} />
    </div>
  )
}

function AgentRow({ agent, isSelected, onClick }: { agent: MoltbotAgent; isSelected: boolean; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    active: "#34d399", working: "#fbbf24", idle: "#64748b", error: "#f87171", offline: "#1e293b",
  }
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "6px 8px",
        background: isSelected ? "#1e293b" : "transparent",
        border: isSelected ? "1px solid #2a3a52" : "1px solid transparent",
        borderRadius: 6,
        cursor: "pointer",
        color: "#e2e8f0",
        textAlign: "left",
        transition: "background 0.15s",
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[agent.status], flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: agent.color }}>{agent.name}</div>
        <div style={{ fontSize: 10, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {agent.currentTask || agent.status}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{agent.cpu}%</div>
    </button>
  )
}

export function SidebarPanel({ agents, selectedAgent, logs, onSelectAgent }: SidebarPanelProps) {
  const active = agents.filter(a => a.status === "active" || a.status === "working").length
  const working = agents.filter(a => a.status === "working").length
  const errors = agents.filter(a => a.status === "error").length
  const totalTasks = agents.reduce((s, a) => s + a.tasksCompleted, 0)

  const logTypeColors: Record<string, string> = {
    info: "#60a5fa", success: "#34d399", error: "#f87171", warning: "#fbbf24",
  }

  return (
    <div style={{
      width: 320,
      height: "100%",
      background: "#111827",
      borderLeft: "1px solid #2a3a52",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Stats */}
      <div style={{ padding: 12, borderBottom: "1px solid #2a3a52" }}>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          City Overview
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <StatBox label="Active" value={active} color="#34d399" />
          <StatBox label="Working" value={working} color="#fbbf24" />
          <StatBox label="Errors" value={errors} color="#f87171" />
          <StatBox label="Tasks Done" value={totalTasks} color="#22d3ee" />
        </div>
      </div>

      {/* Selected agent detail */}
      {selectedAgent && (
        <div style={{ padding: 12, borderBottom: "1px solid #2a3a52", background: "#0f172a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: selectedAgent.color, fontFamily: "monospace" }}>
              {selectedAgent.name}
            </span>
            <button
              onClick={() => onSelectAgent(null)}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}
              aria-label="Close agent detail"
            >
              x
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            Model: {selectedAgent.model}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
            District: {DISTRICTS.find(d => d.id === selectedAgent.district)?.name}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
            Status: <span style={{ color: selectedAgent.status === "error" ? "#f87171" : "#34d399", fontWeight: 600 }}>
              {selectedAgent.status.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>CPU {selectedAgent.cpu}%</div>
          <ProgressBar value={selectedAgent.cpu} color="#22d3ee" />
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, marginTop: 6 }}>Memory {selectedAgent.memory}%</div>
          <ProgressBar value={selectedAgent.memory} color="#a78bfa" />

          {selectedAgent.currentTask && (
            <>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, marginTop: 6 }}>
                Task: {selectedAgent.currentTask}
              </div>
              <ProgressBar value={selectedAgent.taskProgress} color={selectedAgent.color} />
            </>
          )}

          <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
            Completed: {selectedAgent.tasksCompleted} tasks
          </div>
        </div>
      )}

      {/* Agent list */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, padding: "0 4px" }}>
          Agents ({agents.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {agents.map(a => (
            <AgentRow
              key={a.id}
              agent={a}
              isSelected={selectedAgent?.id === a.id}
              onClick={() => onSelectAgent(a.id)}
            />
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div style={{ height: 160, borderTop: "1px solid #2a3a52", overflow: "auto", padding: 8 }}>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Activity Log
        </div>
        {logs.slice(-20).reverse().map(log => (
          <div key={log.id} style={{ fontSize: 10, marginBottom: 3, display: "flex", gap: 6, lineHeight: 1.4 }}>
            <span style={{ color: "#475569", flexShrink: 0, fontFamily: "monospace" }}>{log.time}</span>
            <span style={{ color: logTypeColors[log.type] || "#94a3b8" }}>
              <strong>{log.agent}</strong> {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
