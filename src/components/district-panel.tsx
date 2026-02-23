import { cn } from "@/lib/utils"
import type { District, DistrictType } from "@/lib/types"
import { Database, Radio, Cpu, Shield, FlaskConical } from "lucide-react"
import type { ComponentType } from "react"

const icons: Record<string, ComponentType<{ className?: string }>> = { database: Database, radio: Radio, cpu: Cpu, shield: Shield, "flask-conical": FlaskConical }

const dColors: Record<DistrictType, { border: string; selected: string; icon: string; bar: string }> = {
  "data-center": { border: "border-[hsl(var(--district-data))]/30 hover:border-[hsl(var(--district-data))]/60", selected: "border-[hsl(var(--district-data))] bg-[hsl(var(--district-data))]/5", icon: "text-[hsl(var(--district-data))]", bar: "bg-[hsl(var(--district-data))]" },
  "comm-hub":    { border: "border-[hsl(var(--district-comm))]/30 hover:border-[hsl(var(--district-comm))]/60", selected: "border-[hsl(var(--district-comm))] bg-[hsl(var(--district-comm))]/5", icon: "text-[hsl(var(--district-comm))]", bar: "bg-[hsl(var(--district-comm))]" },
  "processing":  { border: "border-[hsl(var(--district-process))]/30 hover:border-[hsl(var(--district-process))]/60", selected: "border-[hsl(var(--district-process))] bg-[hsl(var(--district-process))]/5", icon: "text-[hsl(var(--district-process))]", bar: "bg-[hsl(var(--district-process))]" },
  "defense":     { border: "border-[hsl(var(--district-defense))]/30 hover:border-[hsl(var(--district-defense))]/60", selected: "border-[hsl(var(--district-defense))] bg-[hsl(var(--district-defense))]/5", icon: "text-[hsl(var(--district-defense))]", bar: "bg-[hsl(var(--district-defense))]" },
  "research":    { border: "border-[hsl(var(--district-research))]/30 hover:border-[hsl(var(--district-research))]/60", selected: "border-[hsl(var(--district-research))] bg-[hsl(var(--district-research))]/5", icon: "text-[hsl(var(--district-research))]", bar: "bg-[hsl(var(--district-research))]" },
}

interface Props {
  districts: District[]
  selectedDistrict: DistrictType | null
  onSelectDistrict: (d: DistrictType | null) => void
}

export function DistrictPanel({ districts, selectedDistrict, onSelectDistrict }: Props) {
  return (
    <aside className="flex flex-col gap-2 border-r border-border bg-card/30 p-3">
      <h2 className="px-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Districts</h2>
      <button
        onClick={() => onSelectDistrict(null)}
        className={cn("rounded-md border px-3 py-2 text-left text-xs font-mono transition-all", selectedDistrict === null ? "border-primary bg-primary/5 text-primary" : "border-border bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground")}
      >All Districts</button>
      {districts.map((d) => {
        const Icon = icons[d.icon] || Database
        const sel = selectedDistrict === d.id
        const c = dColors[d.id]
        return (
          <button key={d.id} onClick={() => onSelectDistrict(d.id)} className={cn("group flex flex-col gap-2 rounded-md border p-3 text-left transition-all", sel ? c.selected : cn("bg-background/30", c.border))}>
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", c.icon)} />
              <span className="text-xs font-semibold text-foreground">{d.name}</span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">{d.description}</p>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className={cn("h-full rounded-full transition-all duration-500", c.bar)} style={{ width: `${d.load}%` }} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{d.agentCount}/{d.capacity}</span>
            </div>
          </button>
        )
      })}
    </aside>
  )
}
