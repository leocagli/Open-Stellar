import { NextResponse } from "next/server"
import { apiError } from "@/lib/api/error"
import { deregisterAgent, getRegisteredAgent } from "@/lib/agent-registry"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params
  const agent = getRegisteredAgent(decodeURIComponent(id))

  if (!agent) {
    return apiError("agent not found", "AGENT_NOT_FOUND", 404)
  }

  return NextResponse.json(
    { ok: true, agent },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params
  const agent = deregisterAgent(decodeURIComponent(id))

  if (!agent) {
    return apiError("agent not found", "AGENT_NOT_FOUND", 404)
  }

  return NextResponse.json(
    { ok: true, agent },
    { headers: { "Cache-Control": "no-store" } },
  )
}
