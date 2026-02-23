"use client"

import { cn } from "@/lib/utils"
import type { MoltbotAgent, DistrictType } from "@/lib/moltbot-types"
import { StatusBadge } from "./status-indicator"
import { X, Cpu, HardDrive, Clock, CheckCircle2, AlertTriangle, Activity } from "lucide-react"

const avatarColorMap: Record<DistrictType, string> = {
  "data-center": "bg-[hsl(var(--district-data))]/15 text-[hsl(var(--district-data))] border-[hsl(var(--district-data))]/30",
  "comm-hub": "bg-[hsl(var(--district-comm))]/15 text-[hsl(var(--district-comm))] border-[hsl(var(--district-comm))]/30",
  "processing": "bg-[hsl(var(--district-process))]/15 text-[hsl(var(--district-process))] border-[hsl(var(--district-process))]/30",
  "defense": "bg-[hsl(var(--district-defense))]/15 text-[hsl(var(--district-defense))] border-[hsl(var(--district-defense))]/30",
  "research": "bg-[hsl(var(--district-research))]/15 text-[hsl(var(--district-research))] border-[hsl(var(--district-research))]/30",
}

const districtLabel: Record<DistrictType, string> = {
  "data-center": "Data Center",
  "comm-hub": "Communication Hub",
  "processing": "Processing Zone",
  "defense": "Defense Grid",
  "research": "Research Lab",
}

interface AgentDetailProps {
  agent: MoltbotAgent
  onClose: () => void
}

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  return (
    <aside className="flex w-80 flex-col border-l border-border bg-card/50 backdrop-blur-sm xl:w-96">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-mono font-bold",
            avatarColorMap[agent.district]
          )}>
            {agent.avatar}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="text-[10px] font-mono text-muted-foreground">{agent.model}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{districtLabel[agent.district]}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Status</span>
          <StatusBadge status={agent.status} />
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="border-b border-border p-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Current Task</span>
          <div className="mt-2 rounded-md border border-border bg-background/50 p-3">
            <p className="text-xs font-semibold text-foreground">{agent.currentTask.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-[hsl(var(--status-working))] transition-all duration-1000"
                  style={{ width: `${agent.currentTask.progress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-semibold text-[hsl(var(--status-working))]">
                {agent.currentTask.progress}%
              </span>
            </div>
            <p className="mt-1.5 text-[10px] font-mono text-muted-foreground">
              ID: {agent.currentTask.id}
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="border-b border-border p-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Metrics</span>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MetricCard icon={Cpu} label="CPU Usage" value={`${agent.cpu}%`} alert={agent.cpu > 80} />
          <MetricCard icon={HardDrive} label="Memory" value={`${agent.memory}%`} alert={agent.memory > 80} />
          <MetricCard icon={Clock} label="Uptime" value={`${agent.uptime}%`} />
          <MetricCard icon={Activity} label="Activity" value={agent.status === "working" ? "High" : agent.status === "active" ? "Medium" : "Low"} />
          <MetricCard icon={CheckCircle2} label="Completed" value={agent.completedTasks.toLocaleString()} />
          <MetricCard icon={AlertTriangle} label="Errors" value={agent.errorCount.toString()} alert={agent.errorCount > 10} />
        </div>
      </div>

      {/* Resource Bars */}
      <div className="border-b border-border p-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Resources</span>
        <div className="mt-3 flex flex-col gap-3">
          <ResourceBar label="CPU" value={agent.cpu} color="bg-primary" />
          <ResourceBar label="Memory" value={agent.memory} color="bg-[hsl(var(--district-comm))]" />
        </div>
      </div>

      {/* Last Activity */}
      <div className="p-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Last Activity</span>
        <p className="mt-2 text-xs text-muted-foreground italic">{agent.lastActivity}</p>
      </div>
    </aside>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  alert = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  alert?: boolean
}) {
  return (
    <div className="rounded-md border border-border bg-background/50 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      </div>
      <p className={cn("mt-1 text-sm font-mono font-semibold", alert ? "text-[hsl(var(--status-error))]" : "text-foreground")}>
        {value}
      </p>
    </div>
  )
}

function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
        <span className={cn(
          "text-[10px] font-mono font-semibold",
          value > 80 ? "text-[hsl(var(--status-error))]" : "text-foreground"
        )}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
