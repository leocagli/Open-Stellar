import { NextResponse } from "next/server"

import { apiError } from "@/lib/api/error"
import { getQuestById } from "@/lib/gamification/quests"
import { getReputationByActorId } from "@/lib/reputation/reputation-store"

type QuestApplyContext = {
  params: Promise<{ id: string }>
}

interface QuestApplyBody {
  actorId?: unknown
}

async function readApplyBody(req: Request): Promise<QuestApplyBody> {
  try {
    const body = await req.json()
    return typeof body === "object" && body !== null ? body as QuestApplyBody : {}
  } catch {
    return {}
  }
}

export async function POST(req: Request, context: QuestApplyContext) {
  const { id } = await context.params
  const quest = getQuestById(decodeURIComponent(id))

  if (!quest) {
    return apiError("Quest not found", "QUEST_NOT_FOUND", 404)
  }

  if (quest.subTasks && quest.subTasks.length > 0 && quest.subTasks.some((st) => st.status !== "done")) {
    return apiError("Cannot complete quest with pending sub-tasks", "PENDING_SUBTASKS", 400)
  }

  const body = await readApplyBody(req)
  const actorId = typeof body.actorId === "string" && body.actorId.trim().length > 0
    ? body.actorId.trim()
    : "anonymous"
  const reputation = getReputationByActorId(actorId)

  if (quest.minReputation !== undefined && reputation.score < quest.minReputation) {
    return apiError("InsufficientReputation", "INSUFFICIENT_REPUTATION", 403)
  }

  return NextResponse.json({ ok: true, quest, actorId })
}
