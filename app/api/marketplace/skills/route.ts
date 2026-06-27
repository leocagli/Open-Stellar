import { NextResponse } from "next/server"
import { listSkills, registerSkill, SkillStoreError } from "@/lib/marketplace/skill-store"

function resolveAgentId(req: Request, body: Record<string, unknown>): string | undefined {
  const headerId = req.headers.get("x-agent-id")
  const authHeader = req.headers.get("authorization")
  const bodyAgentId = typeof body.agentId === "string" ? body.agentId : undefined
  const authAgentId = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined

  return [headerId, bodyAgentId, authAgentId].find((candidate) => Boolean(candidate?.trim()))?.trim()
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name") ?? undefined
    const agentId = searchParams.get("agentId") ?? undefined
    const maxPriceRaw = searchParams.get("maxPriceXLM")
    const maxPriceXLM = maxPriceRaw === null ? undefined : Number(maxPriceRaw)

    if (maxPriceRaw !== null && (!Number.isFinite(maxPriceXLM) || (maxPriceXLM ?? 0) < 0)) {
      return NextResponse.json(
        { ok: false, error: "maxPriceXLM must be a non-negative number" },
        { status: 400 },
      )
    }

    const skills = listSkills({ name, maxPriceXLM, agentId })
    return NextResponse.json({ ok: true, skills })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed listing skills" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const agentId = resolveAgentId(req, body)

    if (!agentId) {
      return NextResponse.json(
        { ok: false, error: "Agent authentication required" },
        { status: 401 },
      )
    }

    const name = typeof body.name === "string" ? body.name : undefined
    const description = typeof body.description === "string" ? body.description : undefined
    const priceXLM = typeof body.priceXLM === "number" ? body.priceXLM : Number(body.priceXLM)
    const callUrl = typeof body.callUrl === "string" ? body.callUrl : undefined

    const skill = registerSkill({
      agentId,
      name: name ?? "",
      description: description ?? "",
      priceXLM,
      callUrl: callUrl ?? "",
    })

    return NextResponse.json({ ok: true, skill }, { status: 201 })
  } catch (error) {
    if (error instanceof SkillStoreError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed registering skill" },
      { status: 500 },
    )
  }
}
