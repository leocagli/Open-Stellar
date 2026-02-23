import type { MoltbotAgent, District, DistrictId } from "./types"

export const DISTRICTS: District[] = [
  { id: "data-center", name: "Data Center", color: "#22d3ee", bgColor: "#0e2a30", x: 40, y: 60, w: 260, h: 200 },
  { id: "comm-hub", name: "Comm Hub", color: "#34d399", bgColor: "#0e2a1e", x: 320, y: 60, w: 260, h: 200 },
  { id: "processing", name: "Processing", color: "#fbbf24", bgColor: "#2a2510", x: 600, y: 60, w: 260, h: 200 },
  { id: "defense", name: "Defense Grid", color: "#f87171", bgColor: "#2a1414", x: 120, y: 290, w: 300, h: 200 },
  { id: "research", name: "Research Lab", color: "#a78bfa", bgColor: "#1e142a", x: 460, y: 290, w: 300, h: 200 },
]

const NAMES = [
  "Nexus-7", "Cipher-3", "Pulse-9", "Vector-1", "Halo-5",
  "Stratos-2", "Bolt-8", "Prism-4", "Flux-6", "Nova-0",
  "Vertex-11", "Echo-12",
]

const MODELS = ["claude-4-sonnet", "claude-4-opus", "claude-3.5-haiku", "gpt-5-mini"]

const TASKS: Record<DistrictId, string[]> = {
  "data-center": ["Indexing datasets", "Running backup", "Syncing replicas", "Compressing logs"],
  "comm-hub": ["Routing messages", "Encrypting channel", "Relaying signals", "Handshake protocol"],
  "processing": ["Batch inference", "Tokenizing input", "Gradient descent", "Model fine-tune"],
  "defense": ["Scanning perimeter", "Firewall update", "Threat analysis", "Anomaly detection"],
  "research": ["Hypothesis test", "Paper analysis", "Experiment run", "Data visualization"],
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function createAgents(): MoltbotAgent[] {
  const colors = ["#22d3ee", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#60a5fa", "#fb923c", "#e879f9", "#2dd4bf", "#facc15", "#818cf8", "#f472b6"]
  return NAMES.map((name, i) => {
    const districtIdx = i % DISTRICTS.length
    const district = DISTRICTS[districtIdx]
    const px = district.x + rand(30, district.w - 50)
    const py = district.y + rand(40, district.h - 40)
    return {
      id: `bot-${i}`,
      name,
      model: MODELS[i % MODELS.length],
      status: (["active", "working", "idle", "working", "active"] as const)[i % 5],
      district: district.id,
      cpu: rand(20, 95),
      memory: rand(30, 85),
      tasksCompleted: rand(10, 200),
      currentTask: TASKS[district.id][rand(0, 3)],
      taskProgress: Math.random() * 100,
      color: colors[i % colors.length],
      pixelX: px,
      pixelY: py,
      targetX: px,
      targetY: py,
      frame: 0,
      direction: "right" as const,
    }
  })
}

export function getRandomTask(districtId: DistrictId): string {
  const tasks = TASKS[districtId]
  return tasks[rand(0, tasks.length - 1)]
}
