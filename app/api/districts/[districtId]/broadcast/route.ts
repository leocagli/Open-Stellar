import { NextResponse } from "next/server"
import { apiError } from "@/lib/api/error"
import {
  broadcastDistrictMessage,
  isAgentMessageType,
  isDistrictId,
  listDistrictMessages,
} from "@/lib/agent-runtime/messaging"

export const dynamic = "force-dynamic"

type BroadcastRouteContext = {
  params: Promise<{ districtId: string }>
}

export async function GET(_req: Request, context: BroadcastRouteContext) {
  const { districtId } = await context.params

  if (!isDistrictId(districtId)) {
    return apiError("Unknown district", "UNKNOWN_DISTRICT", 404)
  }

  return NextResponse.json({ ok: true, districtId, messages: listDistrictMessages(districtId) })
}

export async function POST(req: Request, context: BroadcastRouteContext) {
  const { districtId } = await context.params
  const body = await req.json()
  const type = body.type

  if (!isDistrictId(districtId)) {
    return apiError("Unknown district", "UNKNOWN_DISTRICT", 404)
  }

  if (!isAgentMessageType(type)) {
    return apiError("Unsupported message type", "UNSUPPORTED_MESSAGE_TYPE", 400)
  }

  try {
    const message = broadcastDistrictMessage(districtId, {
      fromAgentId: String(body.fromAgentId || ""),
      type,
      payload: body.payload ?? {},
      replyTo: body.replyTo ? String(body.replyTo) : undefined,
      expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
    })

    return NextResponse.json({ ok: true, message }, { status: 201 })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed broadcasting message", "FAILED_BROADCASTING_MESSAGE", 400)
  }
}
