import { cn } from "@/lib/utils"
import type { MoltbotAgent, DistrictType } from "@/lib/types"
import { StatusDot } from "./status-indicator"

const borderMap: Record<DistrictType, string> = {
  "data-center": "border-[hsl(var(--district-data))]/20",
  "comm-hub": "border-[hsl(var(--district-comm))]/20",
  "processing": "border-[hsl(var(--district-process))]/20",
  "defense": "border-[hsl(var(--district-defense))]/20",
  "research": "border-[hsl(var(--district-research))]/20",
}
const ringMap: Record<DistrictType, string> = {
  "data-center": "ring-[hsl(var(--district-data))]/40",
  "comm-hub": "ring-[hsl(var(--district-comm))]/40",
  "processing": "ring-[hsl(var(--district-process))]/40",
  "defense": "ring-[hsl(var(--district-defense))]/40",
  "research": "ring-[hsl(var(--district-research))]/40",
}
const avatarMap: Record<DistrictType, string> = {
  "data-center": "bg-[hsl(var(--district-data))]/15 text-[hsl(var(--district-data))]",
  "comm-hub": "bg-[hsl(var(--district-comm))]/15 text-[hsl(var(--district-comm))]",
  "processing": "bg-[hsl(var(--district-process))]/15 text-[hsl(var(--district-process))]",
  "defense": "bg-[hsl(var(--district-defense))]/15 text-[hsl(var(--district-defense))]",
  "research": "bg-[hsl(var(--district-research))]/15 text-[hsl(var(--district-research))]",
}

interface Props { agents: MoltbotAgent[]; selectedAgent: MoltbotAgent | null; onSelectAgent: (a: MoltbotAgent) => void }

export function CityGrid({ agents, selectedAgent, onSelectAgent }: Props) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid-city min-h-full rounded-lg border border-border bg-background/30 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectAgent(a)}
              className={cn(
                "group relative flex flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-all duration-200 hover:bg-card/80",
                borderMap[a.district],
                selectedAgent?.id === a.id && cn("ring-2", ringMap[a.district]),
                a.status === "offline" && "opacity-40",
                a.status === "working" && "animate-float"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-md text-xs font-mono font-bold", avatarMap[a.district])}>{a.avatar}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-foreground">{a.name}</span>
                    <StatusDot status={a.status} size="sm" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{a.model}</span>
                </div>
              </div>
              {a.currentTask && (
                <div className="flex flex-col gap-1">
                  <span className="truncate text-[10px] font-mono text-muted-foreground">{a.currentTask.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-[hsl(var(--status-working))] transition-all duration-1000" style={{ width: `${a.currentTask.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-[hsl(var(--status-working))]">{a.currentTask.progress}%</span>
                  </div>
                </div>
              )}
              {a.status !== "offline" && (
                <div className="flex items-center gap-3">
                  <Mini label="CPU" value={a.cpu} alert={a.cpu > 80} />
                  <Mini label="MEM" value={a.memory} alert={a.memory > 80} />
                </div>
              )}
              <p className="truncate text-[10px] text-muted-foreground italic">{a.lastActivity}</p>
            </button>
          ))}
        </div>
        {agents.length === 0 && <div className="flex h-64 items-center justify-center"><p className="text-sm font-mono text-muted-foreground">No agents in this district</p></div>}
      </div>
    </div>
  )
}

function Mini({ label, value, alert }: { label: string; value: number; alert: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-mono uppercase text-muted-foreground">{label}</span>
      <span className={cn("text-[10px] font-mono font-semibold", alert ? "text-[hsl(var(--status-error))]" : "text-foreground")}>{value}%</span>
    </div>
  )
}
