import { NextResponse } from "next/server"
import { deactivateSkill, SkillStoreError } from "@/lib/marketplace/skill-store"

function resolveAgentId(req: Request): string | undefined {
  const headerId = req.headers.get("x-agent-id")
  const authHeader = req.headers.get("authorization")
  const authAgentId = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined

  return [headerId, authAgentId].find((candidate) => Boolean(candidate?.trim()))?.trim()
}

interface RouteContext {
  params: Promise<{ skillId: string }>
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { skillId } = await context.params
    const agentId = resolveAgentId(req)

    if (!agentId) {
      return NextResponse.json(
        { ok: false, error: "Agent authentication required" },
        { status: 401 },
      )
    }

    const skill = deactivateSkill(decodeURIComponent(skillId), agentId)
    return NextResponse.json({ ok: true, skill })
  } catch (error) {
    if (error instanceof SkillStoreError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed deactivating skill" },
      { status: 500 },
    )
  }
}
