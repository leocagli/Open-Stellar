import { NextResponse } from "next/server"
import {
  listAgentPositionHistory,
  normalizeAgentPositionHistoryLimit,
} from "@/lib/agents/agent-position-store"

export const dynamic = "force-dynamic"

interface RouteContext {
  params: Promise<{ id: string }>
}

function parseLimit(value: string | null): number {
  if (value === null || !value.trim()) {
    return normalizeAgentPositionHistoryLimit(undefined)
  }

  return normalizeAgentPositionHistoryLimit(Number(value))
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const url = new URL(req.url)
    const limit = parseLimit(url.searchParams.get("limit"))
    const positions = listAgentPositionHistory(decodeURIComponent(id), limit)

    return NextResponse.json(
      { ok: true, positions },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed listing positions" },
      { status: 400 },
    )
  }
}
