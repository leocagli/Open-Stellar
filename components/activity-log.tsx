"use client"

import { cn } from "@/lib/utils"
import { Terminal } from "lucide-react"

interface ActivityLogProps {
  logs: string[]
}

export function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="flex flex-col border-t border-border bg-card/30">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Terminal className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Activity Log</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">{logs.length} entries</span>
      </div>
      <div className="h-32 overflow-auto p-3 lg:h-40">
        <div className="flex flex-col gap-0.5">
          {logs.map((log, i) => (
            <p
              key={`${log}-${i}`}
              className={cn(
                "text-[11px] font-mono leading-relaxed",
                log.includes("ERROR") ? "text-[hsl(var(--status-error))]" :
                log.includes("SYSTEM") ? "text-primary" :
                log.includes("completed") ? "text-[hsl(var(--status-active))]" :
                log.includes("recovered") ? "text-[hsl(var(--status-active))]" :
                "text-muted-foreground"
              )}
            >
              {log}
            </p>
          ))}
          {logs.length === 0 && (
            <p className="text-[11px] font-mono text-muted-foreground italic">Waiting for activity...</p>
          )}
        </div>
      </div>
    </div>
  )
}
