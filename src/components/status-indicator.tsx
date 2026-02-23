import { cn } from "@/lib/utils"
import type { MoltbotStatus } from "@/lib/types"

const cfg: Record<MoltbotStatus, { label: string; dot: string; pulse: string; badge: string }> = {
  active:  { label: "Active",  dot: "bg-[hsl(var(--status-active))]",  pulse: "animate-pulse-glow", badge: "bg-[hsl(var(--status-active))]/10 text-[hsl(var(--status-active))]" },
  idle:    { label: "Idle",    dot: "bg-[hsl(var(--status-idle))]",    pulse: "",                    badge: "bg-[hsl(var(--status-idle))]/10 text-[hsl(var(--status-idle))]" },
  working: { label: "Working", dot: "bg-[hsl(var(--status-working))]", pulse: "animate-pulse-glow", badge: "bg-[hsl(var(--status-working))]/10 text-[hsl(var(--status-working))]" },
  error:   { label: "Error",   dot: "bg-[hsl(var(--status-error))]",   pulse: "animate-pulse-glow", badge: "bg-[hsl(var(--status-error))]/10 text-[hsl(var(--status-error))]" },
  offline: { label: "Offline", dot: "bg-[hsl(var(--status-offline))]", pulse: "",                    badge: "bg-[hsl(var(--status-offline))]/10 text-[hsl(var(--status-offline))]" },
}

export function StatusDot({ status, size = "sm" }: { status: MoltbotStatus; size?: "sm" | "md" }) {
  const c = cfg[status]
  return <span className={cn("inline-block rounded-full", size === "md" ? "h-2.5 w-2.5" : "h-2 w-2", c.dot, c.pulse)} />
}

export function StatusBadge({ status }: { status: MoltbotStatus }) {
  const c = cfg[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-mono uppercase tracking-wider", c.badge)}>
      <StatusDot status={status} />
      {c.label}
    </span>
  )
}
