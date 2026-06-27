import { NextResponse } from "next/server"
import { invokeSkillWithPayment } from "@/lib/marketplace/x402-middleware"
import { recordInvocation } from "@/lib/marketplace/invocation-ledger"

interface RouteContext {
  params: Promise<{ skillId: string }>
}

// Mock skill registry for demo — in production this queries the skills store
const MOCK_SKILLS: Record<string, { callUrl: string; priceXLM: number; ownerWallet: string }> = {
  "skill-payment": {
    callUrl: "https://api.example.com/skills/payment",
    priceXLM: 1.0,
    ownerWallet: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  },
}

function getSkill(skillId: string) {
  // TODO: Replace with actual skills-store lookup when PR#304 merges
  return MOCK_SKILLS[skillId] ?? null
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { skillId } = await context.params
    const body = await req.json().catch(() => ({}))

    if (!body.agentId || typeof body.agentId !== "string") {
      return NextResponse.json(
        { ok: false, error: "agentId is required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      )
    }

    const skill = getSkill(skillId)
    if (!skill) {
      return NextResponse.json(
        { ok: false, error: "Skill not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      )
    }

    const result = await invokeSkillWithPayment(
      skill.callUrl,
      skill.ownerWallet,
      skill.priceXLM,
      { agentId: body.agentId, payload: body.payload },
    )

    // Record in ledger regardless of outcome
    const record = recordInvocation(
      body.agentId,
      skillId,
      skill.priceXLM,
      result.receipt?.txHash ?? "",
      result.ok ? "success" : result.error === "insufficient_balance" ? "insufficient_balance" : "failed",
      result.error,
    )

    if (!result.ok) {
      const statusCode = result.error === "insufficient_balance" ? 402 : 500
      return NextResponse.json(
        { ok: false, error: result.error || "Skill invocation failed", ledgerId: record.id },
        { status: statusCode, headers: { "Cache-Control": "no-store" } },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        response: result.response,
        receipt: result.receipt,
        ledgerId: record.id,
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to invoke skill" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}