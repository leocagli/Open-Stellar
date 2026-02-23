"use client"

import { cn } from "@/lib/utils"
import type { MoltbotAgent, DistrictType } from "@/lib/moltbot-types"
import { StatusDot } from "./status-indicator"

const districtBgMap: Record<DistrictType, string> = {
  "data-center": "border-[hsl(var(--district-data))]/20",
  "comm-hub": "border-[hsl(var(--district-comm))]/20",
  "processing": "border-[hsl(var(--district-process))]/20",
  "defense": "border-[hsl(var(--district-defense))]/20",
  "research": "border-[hsl(var(--district-research))]/20",
}

const districtRingMap: Record<DistrictType, string> = {
  "data-center": "ring-[hsl(var(--district-data))]/40",
  "comm-hub": "ring-[hsl(var(--district-comm))]/40",
  "processing": "ring-[hsl(var(--district-process))]/40",
  "defense": "ring-[hsl(var(--district-defense))]/40",
  "research": "ring-[hsl(var(--district-research))]/40",
}

const avatarColorMap: Record<DistrictType, string> = {
  "data-center": "bg-[hsl(var(--district-data))]/15 text-[hsl(var(--district-data))]",
  "comm-hub": "bg-[hsl(var(--district-comm))]/15 text-[hsl(var(--district-comm))]",
  "processing": "bg-[hsl(var(--district-process))]/15 text-[hsl(var(--district-process))]",
  "defense": "bg-[hsl(var(--district-defense))]/15 text-[hsl(var(--district-defense))]",
  "research": "bg-[hsl(var(--district-research))]/15 text-[hsl(var(--district-research))]",
}

interface CityGridProps {
  agents: MoltbotAgent[]
  selectedAgent: MoltbotAgent | null
  onSelectAgent: (agent: MoltbotAgent) => void
}

export function CityGrid({ agents, selectedAgent, onSelectAgent }: CityGridProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid-city min-h-full rounded-lg border border-border bg-background/30 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {agents.map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent?.id === agent.id}
              onSelect={() => onSelectAgent(agent)}
            />
          ))}
        </div>

        {agents.length === 0 && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm font-mono text-muted-foreground">No agents in this district</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentNode({ agent, isSelected, onSelect }: { agent: MoltbotAgent; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-all duration-200",
        districtBgMap[agent.district],
        isSelected && cn("ring-2", districtRingMap[agent.district]),
        agent.status === "offline" && "opacity-40",
        agent.status === "working" && "animate-float",
        "hover:bg-card/80"
      )}
    >
      {/* Header with avatar and status */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-xs font-mono font-bold",
          avatarColorMap[agent.district]
        )}>
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold text-foreground">{agent.name}</span>
            <StatusDot status={agent.status} size="sm" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{agent.model}</span>
        </div>
      </div>

      {/* Task progress */}
      {agent.currentTask && (
        <div className="flex flex-col gap-1">
          <span className="truncate text-[10px] font-mono text-muted-foreground">
            {agent.currentTask.name}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[hsl(var(--status-working))] transition-all duration-1000"
                style={{ width: `${agent.currentTask.progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[hsl(var(--status-working))]">
              {agent.currentTask.progress}%
            </span>
          </div>
        </div>
      )}

      {/* Metrics */}
      {agent.status !== "offline" && (
        <div className="flex items-center gap-3">
          <MiniMetric label="CPU" value={agent.cpu} alert={agent.cpu > 80} />
          <MiniMetric label="MEM" value={agent.memory} alert={agent.memory > 80} />
        </div>
      )}

      {/* Activity */}
      <p className="truncate text-[10px] text-muted-foreground italic">{agent.lastActivity}</p>
    </button>
  )
}

function MiniMetric({ label, value, alert }: { label: string; value: number; alert: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-mono uppercase text-muted-foreground">{label}</span>
      <span className={cn(
        "text-[10px] font-mono font-semibold",
        alert ? "text-[hsl(var(--status-error))]" : "text-foreground"
      )}>
        {value}%
      </span>
    </div>
  )
}
