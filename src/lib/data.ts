import type { MoltbotAgent, District, DistrictType, MoltbotStatus, MoltbotTask } from "./types"

const TASK_NAMES: Record<DistrictType, string[]> = {
  "data-center": ["Indexing vector embeddings", "Syncing R2 storage buckets", "Compressing log archives", "Rebalancing shard clusters", "Running backup validation"],
  "comm-hub": ["Processing WebSocket streams", "Routing Telegram messages", "Handling Discord events", "Mediating Slack channels", "Broadcasting status updates"],
  "processing": ["Executing LLM inference", "Parsing user queries", "Generating code completions", "Running prompt optimization", "Analyzing sentiment data"],
  "defense": ["Scanning for intrusions", "Validating JWT tokens", "Monitoring rate limits", "Auditing access logs", "Patching security rules"],
  "research": ["Training model weights", "Evaluating benchmark tests", "Exploring hyperparameters", "Analyzing feedback loops", "Synthesizing research papers"],
}

const AGENT_NAMES = [
  "NOVA-01", "PULSE-02", "HELIX-03", "DRIFT-04", "CIPHER-05",
  "NEXUS-06", "FORGE-07", "SPARK-08", "ORBIT-09", "FLUX-10",
  "PRISM-11", "ECHO-12", "VORTEX-13", "BLADE-14", "CORE-15",
  "WAVE-16", "ATLAS-17", "ZETA-18",
]
const MODELS = ["llama-3.3-70b", "mixtral-8x7b", "gemma2-9b", "llama-3.1-70b", "deepseek-r1"]
const AVATARS = "ABCDEFGHIJKLMNOPQR".split("")
const DISTRICTS: DistrictType[] = ["data-center", "comm-hub", "processing", "defense", "research"]

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randf(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 10) / 10 }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)] }

function makeTask(district: DistrictType): MoltbotTask {
  return {
    id: `task-${Math.random().toString(36).slice(2, 9)}`,
    name: pick(TASK_NAMES[district]),
    progress: rand(5, 95),
    startedAt: Date.now() - rand(10000, 300000),
    estimatedDuration: rand(30000, 600000),
    district,
  }
}

const MSGS: Record<MoltbotStatus, string[]> = {
  active: ["Monitoring systems", "Standing by for tasks", "Health check passed"],
  idle: ["Awaiting instructions", "Low power mode", "Cooldown cycle"],
  working: ["Processing task", "Executing pipeline", "Generating output"],
  error: ["Connection timeout", "Memory overflow detected", "Task failed, retrying"],
  offline: ["Shutdown initiated", "Maintenance mode", "Unreachable"],
}

export function generateAgents(): MoltbotAgent[] {
  const pool: MoltbotStatus[] = ["active", "active", "active", "working", "working", "working", "working", "idle", "idle", "error", "offline"]
  return AGENT_NAMES.map((name, i) => {
    const status = pool[i % pool.length]
    const district = DISTRICTS[i % DISTRICTS.length]
    return {
      id: `agent-${i + 1}`,
      name,
      status,
      district,
      currentTask: status === "working" ? makeTask(district) : null,
      completedTasks: rand(12, 487),
      errorCount: rand(0, 15),
      uptime: randf(85, 99.9),
      cpu: status === "working" ? randf(40, 92) : status === "idle" ? randf(2, 15) : randf(10, 40),
      memory: randf(20, 85),
      model: pick(MODELS),
      avatar: AVATARS[i],
      lastActivity: pick(MSGS[status]),
    }
  })
}

export function generateDistricts(agents: MoltbotAgent[]): District[] {
  const cfg: Record<DistrictType, { name: string; description: string; capacity: number; icon: string }> = {
    "data-center": { name: "Data Center", description: "Storage, indexing, and data pipeline management", capacity: 6, icon: "database" },
    "comm-hub": { name: "Comm Hub", description: "Message routing, WebSocket, and channels", capacity: 5, icon: "radio" },
    "processing": { name: "Processing Zone", description: "LLM inference, code generation, queries", capacity: 6, icon: "cpu" },
    "defense": { name: "Defense Grid", description: "Security, auth, and threat detection", capacity: 4, icon: "shield" },
    "research": { name: "Research Lab", description: "Model training, benchmarks, experiments", capacity: 5, icon: "flask-conical" },
  }
  return DISTRICTS.map((id) => {
    const c = cfg[id]
    const dAgents = agents.filter((a) => a.district === id)
    const online = dAgents.filter((a) => a.status !== "offline")
    return { id, name: c.name, description: c.description, agentCount: dAgents.length, capacity: c.capacity, load: online.length > 0 ? Math.round((online.length / c.capacity) * 100) : 0, icon: c.icon }
  })
}

export function tickAgents(agents: MoltbotAgent[]): MoltbotAgent[] {
  return agents.map((agent) => {
    const r = Math.random()
    let s = agent.status, task = agent.currentTask, done = agent.completedTasks, errs = agent.errorCount

    if (s === "offline") { if (r < 0.05) s = "idle"; return { ...agent, status: s } }

    if (s === "working" && task) {
      const elapsed = Date.now() - task.startedAt
      const prog = Math.min(100, (elapsed / task.estimatedDuration) * 100)
      if (prog >= 100 || r < 0.03) { s = "active"; task = null; done += 1 }
      else if (r < 0.008) { s = "error"; task = null; errs += 1 }
      else { task = { ...task, progress: Math.round(prog) } }
    } else if (s === "active" || s === "idle") {
      if (r < 0.08) { s = "working"; task = makeTask(agent.district) }
      else if (r < 0.12) { s = s === "active" ? "idle" : "active" }
      else if (r < 0.005) { s = "error"; errs += 1 }
    } else if (s === "error") {
      if (r < 0.15) s = "idle"
    }

    const cpuT = s === "working" ? randf(45, 92) : s === "idle" ? randf(2, 12) : s === "error" ? randf(5, 25) : randf(10, 35)
    const memD = (Math.random() - 0.5) * 5

    return {
      ...agent, status: s, currentTask: task, completedTasks: done, errorCount: errs,
      cpu: Math.round((agent.cpu * 0.7 + cpuT * 0.3) * 10) / 10,
      memory: Math.max(10, Math.min(95, Math.round((agent.memory + memD) * 10) / 10)),
      lastActivity: pick(MSGS[s]),
    }
  })
}

export function computeStats(agents: MoltbotAgent[]) {
  const on = agents.filter((a) => a.status !== "offline")
  const active = agents.filter((a) => a.status === "active" || a.status === "working")
  const working = agents.filter((a) => a.status === "working")
  const done = agents.reduce((s, a) => s + a.completedTasks, 0)
  const errs = agents.reduce((s, a) => s + a.errorCount, 0)
  return {
    totalAgents: agents.length,
    activeAgents: active.length,
    totalTasks: working.length,
    completedTasks: done,
    errorRate: done > 0 ? Math.round((errs / (done + errs)) * 1000) / 10 : 0,
    avgCpu: on.length > 0 ? Math.round(on.reduce((s, a) => s + a.cpu, 0) / on.length * 10) / 10 : 0,
    avgMemory: on.length > 0 ? Math.round(on.reduce((s, a) => s + a.memory, 0) / on.length * 10) / 10 : 0,
  }
}
