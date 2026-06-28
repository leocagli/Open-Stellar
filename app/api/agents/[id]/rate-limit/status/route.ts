import { NextResponse } from "next/server"
import { getRateLimitStatus } from "@/lib/agents/rate-limit-store"
import { isAuthorized } from "@/lib/auth"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: RouteContext) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const agentId = decodeURIComponent(id)
  const status = getRateLimitStatus(agentId)

  return NextResponse.json(
    { ok: true, agentId, status },
    { headers: { "Cache-Control": "no-store" } },
  )
}
