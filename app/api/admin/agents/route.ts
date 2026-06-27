import { NextResponse } from "next/server"
import { cloudConfigToAgent, listCloudAgentConfigs, provisionCloudAgent } from "@/lib/agent-runtime/cloud-agents"
import { DISTRICTS, SPRITE_COUNT } from "@/lib/data"
import { listRegisteredAgents, type AgentCapabilityManifest } from "@/lib/agent-registry"
import type { MoltbotAgent } from "@/lib/types"
import { isAuthorized } from "@/lib/auth"

export const dynamic = "force-dynamic"

function registryAgentToCanvasAgent(agent: AgentCapabilityManifest, index: number): MoltbotAgent {
  const district = DISTRICTS.find((item) => item.id === agent.district) ?? DISTRICTS[0]
  const x = district.x + 34 + (index * 41) % Math.max(80, district.w - 80)
  const y = district.y + 48 + (index * 31) % Math.max(80, district.h - 80)
  return {
    id: agent.agentId,
    name: agent.name ?? agent.agentId,
    model: agent.model,
    deployment: agent.endpoint.includes("localhost") || agent.model.startsWith("local/") ? "local" : "cloud",
    status: agent.status,
    district: agent.district,
    cpu: 8,
    memory: 24,
    tasksCompleted: 0,
    currentTask: "Registered runtime agent",
    taskProgress: 0,
    color: "#22d3ee",
    pixelX: x,
    pixelY: y,
    targetX: x,
    targetY: y,
    frame: 0,
    direction: "right",
    spriteId: (index + 3) % SPRITE_COUNT,
    skills: agent.capabilities.slice(0, 4).map((capability, capabilityIndex) => ({
      id: `${agent.agentId}-${capabilityIndex}`,
      name: capability,
      level: 1,
      maxLevel: 5,
      xp: 0,
      xpToNext: 100,
    })),
    autoRestart: true,
    lastHeartbeat: agent.updatedAt,
    appearance: { skin: "neon", accessories: [], customColor: null },
  }
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }
  const configs = listCloudAgentConfigs()
  const cloudAgents = configs.map((config, index) => cloudConfigToAgent(config, index))
  const registeredAgents = listRegisteredAgents().map((agent, index) => registryAgentToCanvasAgent(agent, cloudAgents.length + index))
  const seen = new Set(cloudAgents.map((agent) => agent.id))
  const agents = [...cloudAgents, ...registeredAgents.filter((agent) => !seen.has(agent.id))]
  return NextResponse.json({ ok: true, agents, configs }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const config = provisionCloudAgent({ name: body.name, model: body.model, district: body.district, queueMode: body.queueMode }, req)
    return NextResponse.json({ ok: true, config, agent: cloudConfigToAgent(config, listCloudAgentConfigs().length - 1) }, { status: 201, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed provisioning cloud agent" }, { status: 400 })
  }
}
