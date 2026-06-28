import { NextResponse } from "next/server"

import { apiError } from "@/lib/api/error"
import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from "@/lib/notifications/notification-store"
import {
  getNotificationPreferences,
  setNotificationPreferences,
} from "@/lib/notifications/notification-preferences"

export const dynamic = "force-dynamic"

function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === "string" && NOTIFICATION_TYPES.includes(value as NotificationType)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get("agentId")?.trim()

  if (!agentId) {
    return apiError("agentId is required", "AGENT_ID_REQUIRED", 400)
  }

  return NextResponse.json({
    ok: true,
    ...getNotificationPreferences(agentId),
  })
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const agentId = typeof body.agentId === "string" ? body.agentId.trim() : ""

    if (!agentId) {
      return apiError("agentId is required", "AGENT_ID_REQUIRED", 400)
    }
    if (!Array.isArray(body.muted)) {
      return apiError("muted must be an array", "MUTED_MUST_BE_ARRAY", 400)
    }

    const invalidType = body.muted.find((type: unknown) => !isNotificationType(type))
    if (invalidType !== undefined) {
      return apiError(`muted contains invalid notification type: ${String(invalidType)}`, "INVALID_NOTIFICATION_TYPE", 400)
    }

    return NextResponse.json({
      ok: true,
      ...setNotificationPreferences(agentId, body.muted),
    })
  } catch {
    return apiError("Invalid JSON body", "INVALID_JSON_BODY", 400)
  }
}
