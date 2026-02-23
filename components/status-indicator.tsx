"use client"

import { cn } from "@/lib/utils"
import type { MoltbotStatus } from "@/lib/moltbot-types"

const statusConfig: Record<MoltbotStatus, { label: string; colorClass: string; pulseClass: string }> = {
  active: {
    label: "Active",
    colorClass: "bg-[hsl(var(--status-active))]",
    pulseClass: "animate-pulse-glow",
  },
  idle: {
    label: "Idle",
    colorClass: "bg-[hsl(var(--status-idle))]",
    pulseClass: "",
  },
  working: {
    label: "Working",
    colorClass: "bg-[hsl(var(--status-working))]",
    pulseClass: "animate-pulse-glow",
  },
  error: {
    label: "Error",
    colorClass: "bg-[hsl(var(--status-error))]",
    pulseClass: "animate-pulse-glow",
  },
  offline: {
    label: "Offline",
    colorClass: "bg-[hsl(var(--status-offline))]",
    pulseClass: "",
  },
}

export function StatusDot({ status, size = "sm" }: { status: MoltbotStatus; size?: "sm" | "md" | "lg" }) {
  const config = statusConfig[status]
  const sizeClass = size === "lg" ? "h-3 w-3" : size === "md" ? "h-2.5 w-2.5" : "h-2 w-2"

  return (
    <span className={cn("inline-block rounded-full", sizeClass, config.colorClass, config.pulseClass)} />
  )
}

export function StatusBadge({ status }: { status: MoltbotStatus }) {
  const config = statusConfig[status]

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-mono uppercase tracking-wider",
      status === "active" && "bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))]",
      status === "idle" && "bg-[hsl(var(--status-idle))]/10 text-[hsl(var(--status-idle))]",
      status === "working" && "bg-[hsl(var(--status-working))]/10 text-[hsl(var(--status-working))]",
      status === "error" && "bg-[hsl(var(--status-error))]/10 text-[hsl(var(--status-error))]",
      status === "offline" && "bg-[hsl(var(--status-offline))]/10 text-[hsl(var(--status-offline))]",
    )}>
      <StatusDot status={status} />
      {config.label}
    </span>
  )
}
