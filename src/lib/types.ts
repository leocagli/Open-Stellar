export type MoltbotStatus = "active" | "idle" | "working" | "error" | "offline"
export type DistrictType = "data-center" | "comm-hub" | "processing" | "defense" | "research"

export interface MoltbotTask {
  id: string
  name: string
  progress: number
  startedAt: number
  estimatedDuration: number
  district: DistrictType
}

export interface MoltbotAgent {
  id: string
  name: string
  status: MoltbotStatus
  district: DistrictType
  currentTask: MoltbotTask | null
  completedTasks: number
  errorCount: number
  uptime: number
  cpu: number
  memory: number
  model: string
  avatar: string
  lastActivity: string
}

export interface District {
  id: DistrictType
  name: string
  description: string
  agentCount: number
  capacity: number
  load: number
  icon: string
}

export interface CityStats {
  totalAgents: number
  activeAgents: number
  totalTasks: number
  completedTasks: number
  errorRate: number
  avgCpu: number
  avgMemory: number
}
