import type { MoltbotAgent, District, DistrictType, MoltbotStatus, MoltbotTask } from "./moltbot-types"

const TASK_NAMES: Record<DistrictType, string[]> = {
  "data-center": [
    "Indexing vector embeddings",
    "Syncing R2 storage buckets",
    "Compressing log archives",
    "Rebalancing shard clusters",
    "Running backup validation",
  ],
  "comm-hub": [
    "Processing WebSocket streams",
    "Routing Telegram messages",
    "Handling Discord events",
    "Mediating Slack channels",
    "Broadcasting status updates",
  ],
  "processing": [
    "Executing LLM inference",
    "Parsing user queries",
    "Generating code completions",
    "Running prompt optimization",
    "Analyzing sentiment data",
  ],
  "defense": [
    "Scanning for intrusions",
    "Validating JWT tokens",
    "Monitoring rate limits",
    "Auditing access logs",
    "Patching security rules",
  ],
  "research": [
    "Training model weights",
    "Evaluating benchmark tests",
    "Exploring hyperparameters",
    "Analyzing feedback loops",
    "Synthesizing research papers",
  ],
}

const AGENT_NAMES = [
  "NOVA-01", "PULSE-02", "HELIX-03", "DRIFT-04", "CIPHER-05",
  "NEXUS-06", "FORGE-07", "SPARK-08", "ORBIT-09", "FLUX-10",
  "PRISM-11", "ECHO-12", "VORTEX-13", "BLADE-14", "CORE-15",
  "WAVE-16", "ATLAS-17", "ZETA-18",
]

const MODELS = [
  "llama-3.3-70b", "mixtral-8x7b", "gemma2-9b",
  "llama-3.1-70b", "deepseek-r1",
]

const AVATARS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
]

const DISTRICTS: DistrictType[] = ["data-center", "comm-hub", "processing", "defense", "research"]

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateTask(district: DistrictType): MoltbotTask {
  const names = TASK_NAMES[district]
  return {
    id: `task-${Math.random().toString(36).slice(2, 9)}`,
    name: pickRandom(names),
    progress: randomBetween(5, 95),
    startedAt: Date.now() - randomBetween(10000, 300000),
    estimatedDuration: randomBetween(30000, 600000),
    district,
  }
}

const ACTIVITY_MESSAGES: Record<MoltbotStatus, string[]> = {
  active: ["Monitoring systems", "Standing by for tasks", "Health check passed"],
  idle: ["Awaiting instructions", "Low power mode", "Cooldown cycle"],
  working: ["Processing task", "Executing pipeline", "Generating output"],
  error: ["Connection timeout", "Memory overflow detected", "Task failed, retrying"],
  offline: ["Shutdown initiated", "Maintenance mode", "Unreachable"],
}

export function generateAgents(): MoltbotAgent[] {
  const statuses: MoltbotStatus[] = ["active", "active", "active", "working", "working", "working", "working", "idle", "idle", "error", "offline"]
  
  return AGENT_NAMES.map((name, i) => {
    const status = statuses[i % statuses.length]
    const district = DISTRICTS[i % DISTRICTS.length]
    const hasTask = status === "working"
    
    const gridCol = i % 6
    const gridRow = Math.floor(i / 6)

    return {
      id: `agent-${i + 1}`,
      name,
      status,
      district,
      currentTask: hasTask ? generateTask(district) : null,
      completedTasks: randomBetween(12, 487),
      errorCount: randomBetween(0, 15),
      uptime: randomFloat(85, 99.9),
      cpu: status === "working" ? randomFloat(40, 92) : status === "idle" ? randomFloat(2, 15) : randomFloat(10, 40),
      memory: randomFloat(20, 85),
      model: pickRandom(MODELS),
      avatar: AVATARS[i],
      position: { x: 80 + gridCol * 140, y: 60 + gridRow * 120 },
      lastActivity: pickRandom(ACTIVITY_MESSAGES[status]),
    }
  })
}

export function generateDistricts(agents: MoltbotAgent[]): District[] {
  const districtConfigs: Record<DistrictType, { name: string; description: string; capacity: number; color: string; icon: string }> = {
    "data-center": {
      name: "Data Center",
      description: "Storage, indexing, and data pipeline management",
      capacity: 6,
      color: "hsl(var(--district-data))",
      icon: "database",
    },
    "comm-hub": {
      name: "Communication Hub",
      description: "Message routing, WebSocket, and channel management",
      capacity: 5,
      color: "hsl(var(--district-comm))",
      icon: "radio",
    },
    "processing": {
      name: "Processing Zone",
      description: "LLM inference, code generation, and query handling",
      capacity: 6,
      color: "hsl(var(--district-process))",
      icon: "cpu",
    },
    "defense": {
      name: "Defense Grid",
      description: "Security monitoring, auth, and threat detection",
      capacity: 4,
      color: "hsl(var(--district-defense))",
      icon: "shield",
    },
    "research": {
      name: "Research Lab",
      description: "Model training, benchmarking, and experimentation",
      capacity: 5,
      color: "hsl(var(--district-research))",
      icon: "flask-conical",
    },
  }

  return DISTRICTS.map((districtId) => {
    const config = districtConfigs[districtId]
    const districtAgents = agents.filter((a) => a.district === districtId)
    const activeAgents = districtAgents.filter((a) => a.status !== "offline")

    return {
      id: districtId,
      name: config.name,
      description: config.description,
      agentCount: districtAgents.length,
      capacity: config.capacity,
      load: activeAgents.length > 0 ? Math.round((activeAgents.length / config.capacity) * 100) : 0,
      color: config.color,
      icon: config.icon,
    }
  })
}

export function updateAgentSimulation(agents: MoltbotAgent[]): MoltbotAgent[] {
  return agents.map((agent) => {
    const rand = Math.random()

    let newStatus = agent.status
    let newTask = agent.currentTask
    let newCompletedTasks = agent.completedTasks
    let newErrorCount = agent.errorCount

    if (agent.status === "offline") {
      if (rand < 0.05) newStatus = "idle"
      return { ...agent, status: newStatus }
    }

    if (agent.status === "working" && agent.currentTask) {
      const elapsed = Date.now() - agent.currentTask.startedAt
      const progress = Math.min(100, (elapsed / agent.currentTask.estimatedDuration) * 100)
      
      if (progress >= 100 || rand < 0.03) {
        newStatus = "active"
        newTask = null
        newCompletedTasks += 1
      } else if (rand < 0.008) {
        newStatus = "error"
        newTask = null
        newErrorCount += 1
      } else {
        newTask = { ...agent.currentTask, progress: Math.round(progress) }
      }
    } else if (agent.status === "active" || agent.status === "idle") {
      if (rand < 0.08) {
        newStatus = "working"
        newTask = generateTask(agent.district)
      } else if (rand < 0.12) {
        newStatus = agent.status === "active" ? "idle" : "active"
      } else if (rand < 0.005) {
        newStatus = "error"
        newErrorCount += 1
      }
    } else if (agent.status === "error") {
      if (rand < 0.15) {
        newStatus = "idle"
      }
    }

    const cpuTarget =
      newStatus === "working" ? randomFloat(45, 92) :
      newStatus === "idle" ? randomFloat(2, 12) :
      newStatus === "error" ? randomFloat(5, 25) :
      randomFloat(10, 35)

    const memoryDelta = (Math.random() - 0.5) * 5

    return {
      ...agent,
      status: newStatus,
      currentTask: newTask,
      completedTasks: newCompletedTasks,
      errorCount: newErrorCount,
      cpu: Math.round((agent.cpu * 0.7 + cpuTarget * 0.3) * 10) / 10,
      memory: Math.max(10, Math.min(95, Math.round((agent.memory + memoryDelta) * 10) / 10)),
      lastActivity: pickRandom(ACTIVITY_MESSAGES[newStatus]),
    }
  })
}

export function computeCityStats(agents: MoltbotAgent[]) {
  const onlineAgents = agents.filter((a) => a.status !== "offline")
  const activeAgents = agents.filter((a) => a.status === "active" || a.status === "working")
  const workingAgents = agents.filter((a) => a.status === "working")
  const totalCompleted = agents.reduce((s, a) => s + a.completedTasks, 0)
  const totalErrors = agents.reduce((s, a) => s + a.errorCount, 0)

  return {
    totalAgents: agents.length,
    activeAgents: activeAgents.length,
    totalTasks: workingAgents.length,
    completedTasks: totalCompleted,
    errorRate: totalCompleted > 0 ? Math.round((totalErrors / (totalCompleted + totalErrors)) * 1000) / 10 : 0,
    avgCpu: onlineAgents.length > 0 ? Math.round(onlineAgents.reduce((s, a) => s + a.cpu, 0) / onlineAgents.length * 10) / 10 : 0,
    avgMemory: onlineAgents.length > 0 ? Math.round(onlineAgents.reduce((s, a) => s + a.memory, 0) / onlineAgents.length * 10) / 10 : 0,
  }
}
