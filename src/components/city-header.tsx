import { Pause, Play, Gauge, Zap } from "lucide-react"
import type { CityStats } from "@/lib/types"

interface Props {
  stats: CityStats
  isRunning: boolean
  speed: 1 | 2 | 4
  onToggle: () => void
  onCycleSpeed: () => void
}

export function CityHeader({ stats, isRunning, speed, onToggle, onCycleSpeed }: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card/50 px-4 py-3 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 glow-teal-sm">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Moltbot City</h1>
          <p className="text-xs font-mono text-muted-foreground">Agent Monitoring Dashboard</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        <div className="flex items-center gap-4 rounded-md border border-border bg-background/50 px-3 py-1.5">
          <Chip label="Agents" value={`${stats.activeAgents}/${stats.totalAgents}`} />
          <Sep />
          <Chip label="Tasks" value={String(stats.totalTasks)} />
          <Sep />
          <Chip label="Done" value={stats.completedTasks.toLocaleString()} />
          <Sep />
          <Chip label="Errors" value={`${stats.errorRate}%`} alert={stats.errorRate > 5} />
        </div>
        <div className="flex items-center gap-4 rounded-md border border-border bg-background/50 px-3 py-1.5">
          <Chip label="CPU" value={`${stats.avgCpu}%`} alert={stats.avgCpu > 80} />
          <Sep />
          <Chip label="MEM" value={`${stats.avgMemory}%`} alert={stats.avgMemory > 80} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCycleSpeed} className="flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
            <Gauge className="h-3.5 w-3.5" />{speed}x
          </button>
          <button onClick={onToggle} className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-mono text-primary transition-colors hover:bg-primary/20">
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "Pause" : "Run"}
          </button>
        </div>
      </div>
    </header>
  )
}

function Chip({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-xs font-mono font-semibold ${alert ? "text-[hsl(var(--status-error))]" : "text-foreground"}`}>{value}</span>
    </div>
  )
}

function Sep() { return <div className="h-4 w-px bg-border" /> }
