"use client"

import { cn } from "@/lib/utils"
import type { District, DistrictType } from "@/lib/moltbot-types"
import { Database, Radio, Cpu, Shield, FlaskConical } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  radio: Radio,
  cpu: Cpu,
  shield: Shield,
  "flask-conical": FlaskConical,
}

const districtColorMap: Record<DistrictType, string> = {
  "data-center": "border-[hsl(var(--district-data))]/30 hover:border-[hsl(var(--district-data))]/60",
  "comm-hub": "border-[hsl(var(--district-comm))]/30 hover:border-[hsl(var(--district-comm))]/60",
  "processing": "border-[hsl(var(--district-process))]/30 hover:border-[hsl(var(--district-process))]/60",
  "defense": "border-[hsl(var(--district-defense))]/30 hover:border-[hsl(var(--district-defense))]/60",
  "research": "border-[hsl(var(--district-research))]/30 hover:border-[hsl(var(--district-research))]/60",
}

const districtSelectedMap: Record<DistrictType, string> = {
  "data-center": "border-[hsl(var(--district-data))] bg-[hsl(var(--district-data))]/5",
  "comm-hub": "border-[hsl(var(--district-comm))] bg-[hsl(var(--district-comm))]/5",
  "processing": "border-[hsl(var(--district-process))] bg-[hsl(var(--district-process))]/5",
  "defense": "border-[hsl(var(--district-defense))] bg-[hsl(var(--district-defense))]/5",
  "research": "border-[hsl(var(--district-research))] bg-[hsl(var(--district-research))]/5",
}

const iconColorMap: Record<DistrictType, string> = {
  "data-center": "text-[hsl(var(--district-data))]",
  "comm-hub": "text-[hsl(var(--district-comm))]",
  "processing": "text-[hsl(var(--district-process))]",
  "defense": "text-[hsl(var(--district-defense))]",
  "research": "text-[hsl(var(--district-research))]",
}

const barColorMap: Record<DistrictType, string> = {
  "data-center": "bg-[hsl(var(--district-data))]",
  "comm-hub": "bg-[hsl(var(--district-comm))]",
  "processing": "bg-[hsl(var(--district-process))]",
  "defense": "bg-[hsl(var(--district-defense))]",
  "research": "bg-[hsl(var(--district-research))]",
}

interface DistrictPanelProps {
  districts: District[]
  selectedDistrict: DistrictType | null
  onSelectDistrict: (d: DistrictType | null) => void
}

export function DistrictPanel({ districts, selectedDistrict, onSelectDistrict }: DistrictPanelProps) {
  return (
    <aside className="flex flex-col gap-2 border-r border-border bg-card/30 p-3">
      <h2 className="px-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Districts</h2>

      <button
        onClick={() => onSelectDistrict(null)}
        className={cn(
          "rounded-md border px-3 py-2 text-left text-xs font-mono transition-all",
          selectedDistrict === null
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
        )}
      >
        All Districts
      </button>

      {districts.map((district) => {
        const Icon = iconMap[district.icon] || Database
        const isSelected = selectedDistrict === district.id

        return (
          <button
            key={district.id}
            onClick={() => onSelectDistrict(district.id)}
            className={cn(
              "group flex flex-col gap-2 rounded-md border p-3 text-left transition-all",
              isSelected ? districtSelectedMap[district.id] : cn("bg-background/30", districtColorMap[district.id])
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", iconColorMap[district.id])} />
              <span className="text-xs font-semibold text-foreground">{district.name}</span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">{district.description}</p>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barColorMap[district.id])}
                  style={{ width: `${district.load}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {district.agentCount}/{district.capacity}
              </span>
            </div>
          </button>
        )
      })}
    </aside>
  )
}
