import { NextResponse } from "next/server"
import { apiError } from "@/lib/api/error"
import { getTask } from "@/lib/agent-runtime/task-queue"

type TaskRouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: TaskRouteContext) {
  const { id } = await context.params
  const task = getTask(id)
  if (!task) return apiError("Task not found", "TASK_NOT_FOUND", 404)
  return NextResponse.json({ ok: true, task })
}
