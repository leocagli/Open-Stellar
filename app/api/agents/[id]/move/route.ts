import { NextResponse } from "next/server"
import { apiError } from "@/lib/api/error"
import { moveAgentPosition } from "@/lib/agents/agent-position-store"
import { isAuthorized } from "@/lib/auth"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: RouteContext) {
  if (!isAuthorized(req)) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401)
  }

  try {
    const { id } = await context.params
    const position = moveAgentPosition(decodeURIComponent(id), await req.json())

    return NextResponse.json(
      { ok: true, position },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed moving agent", "FAILED_MOVING_AGENT", 400)
  }
}
