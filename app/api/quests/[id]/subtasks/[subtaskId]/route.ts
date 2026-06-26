import { NextResponse } from "next/server"

import { getQuestById, getSubTasks, updateSubTask } from "@/lib/gamification/quests"

type Context = {
  params: Promise<{ id: string; subtaskId: string }>
}

export async function PATCH(req: Request, context: Context) {
  const { id, subtaskId } = await context.params
  const questId = decodeURIComponent(id)
  const decodedSubTaskId = decodeURIComponent(subtaskId)
  const quest = getQuestById(questId)

  if (!quest) {
    return NextResponse.json({ ok: false, error: "Quest not found" }, { status: 404 })
  }

  const subtasks = getSubTasks(questId)
  const subtaskExists = subtasks.some((st) => st.id === decodedSubTaskId)
  if (!subtaskExists) {
    return NextResponse.json({ ok: false, error: "Subtask not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const updates: {
      status?: "pending" | "in_progress" | "done"
      assignedAgentId?: string
    } = {}

    if (body.status !== undefined) {
      if (body.status !== "pending" && body.status !== "in_progress" && body.status !== "done") {
        return NextResponse.json({ ok: false, error: "Invalid status value" }, { status: 400 })
      }
      updates.status = body.status
    }

    if (body.assignedAgentId !== undefined) {
      updates.assignedAgentId = typeof body.assignedAgentId === "string" && body.assignedAgentId.trim().length > 0
        ? body.assignedAgentId.trim()
        : undefined
    }

    const updatedSubTask = updateSubTask(questId, decodedSubTaskId, updates)
    if (!updatedSubTask) {
      return NextResponse.json({ ok: false, error: "Failed to update subtask" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, subTask: updatedSubTask })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }
}
