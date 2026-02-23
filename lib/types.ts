export type AgentStatus = "active" | "idle" | "working" | "error" | "offline"

export type DistrictId = "data-center" | "comm-hub" | "processing" | "defense" | "research"

export interface MoltbotAgent {
  id: string
  name: string
  model: string
  status: AgentStatus
  district: DistrictId
  cpu: number
  memory: number
  tasksCompleted: number
  currentTask: string | null
  taskProgress: number
  color: string
  pixelX: number
  pixelY: number
  targetX: number
  targetY: number
  frame: number
  direction: "left" | "right"
}

export interface District {
  id: DistrictId
  name: string
  color: string
  bgColor: string
  x: number
  y: number
  w: number
  h: number
}

export interface LogEntry {
  id: number
  time: string
  agent: string
  message: string
  type: "info" | "success" | "error" | "warning"
}
