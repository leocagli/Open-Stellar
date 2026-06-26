import { NextResponse } from "next/server"

import { addSubTask, getQuestById } from "@/lib/gamification/quests"

type Context = {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: Context) {
  const { id } = await context.params
  const questId = decodeURIComponent(id)
  const quest = getQuestById(questId)

  if (!quest) {
    return NextResponse.json({ ok: false, error: "Quest not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    if (!body || typeof body !== "object" || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Missing or invalid title" }, { status: 400 })
    }

    const title = body.title.trim()
    const assignedAgentId = typeof body.assignedAgentId === "string" && body.assignedAgentId.trim().length > 0
      ? body.assignedAgentId.trim()
      : undefined

    const subTask = addSubTask(questId, title, assignedAgentId)
    return NextResponse.json({ ok: true, subTask }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }
}
