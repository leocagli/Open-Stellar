import { NextResponse } from "next/server"
import { apiError } from "@/lib/api/error"
import {
  agentMessageStreamHeaders,
  createAgentMessageStream,
  isAgentMessageType,
  listAgentMessages,
  sendAgentMessage,
} from "@/lib/agent-runtime/messaging"

export const dynamic = "force-dynamic"

type MessageRouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: MessageRouteContext) {
  const { id } = await context.params
  const url = new URL(req.url)

  if (url.searchParams.get("stream") === "1") {
    return new Response(createAgentMessageStream(id), {
      status: 200,
      headers: agentMessageStreamHeaders(),
    })
  }

  return NextResponse.json({ ok: true, messages: listAgentMessages(id) })
}

export async function POST(req: Request, context: MessageRouteContext) {
  const { id } = await context.params
  const body = await req.json()
  const type = body.type

  if (!isAgentMessageType(type)) {
    return apiError("Unsupported message type", "UNSUPPORTED_MESSAGE_TYPE", 400)
  }

  try {
    const message = sendAgentMessage({
      fromAgentId: String(body.fromAgentId || ""),
      toAgentId: id,
      type,
      payload: body.payload ?? {},
      replyTo: body.replyTo ? String(body.replyTo) : undefined,
      expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
    })

    return NextResponse.json({ ok: true, message }, { status: 201 })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed sending message", "FAILED_SENDING_MESSAGE", 400)
  }
}
