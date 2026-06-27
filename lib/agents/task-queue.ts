import type { AgentTask } from "@/lib/types"

export const TASK_TIMEOUT_MS = 5 * 60 * 1000
export const MAX_PENDING_PER_AGENT = 100

export type TaskStatus = AgentTask["status"]

export interface CreateTaskInput {
  type: string
  payload: unknown
}

export interface UpdateTaskInput {
  status: "completed" | "failed"
  result?: unknown
}

interface TaskQueueDb {
  tasks: Map<string, AgentTask>
  agentQueues: Map<string, string[]> // agentId -> ordered taskIds
}

const globalQueue = globalThis as typeof globalThis & {
  __openStellarTaskQueueDb__?: TaskQueueDb
}

function getDb(): TaskQueueDb {
  if (!globalQueue.__openStellarTaskQueueDb__) {
    globalQueue.__openStellarTaskQueueDb__ = {
      tasks: new Map(),
      agentQueues: new Map(),
    }
  }
  return globalQueue.__openStellarTaskQueueDb__
}

function normalizeAgentId(agentId: string): string {
  const trimmed = agentId.trim()
  if (!trimmed) throw new Error("agentId must not be empty")
  return trimmed.slice(0, 200)
}

function normalizeType(type: unknown): string {
  const t = String(type).trim()
  if (!t) throw new Error("task type must not be empty")
  return t.slice(0, 100)
}

function getPendingCount(agentId: string): number {
  const db = getDb()
  const queue = db.agentQueues.get(agentId) ?? []
  let count = 0
  for (const taskId of queue) {
    const task = db.tasks.get(taskId)
    if (task && task.status === "pending") count++
  }
  return count
}

function cleanupTimeouts(): void {
  const db = getDb()
  const now = Date.now()
  for (const task of db.tasks.values()) {
    if (task.status === "running" && task.startedAt) {
      if (now - task.startedAt >= TASK_TIMEOUT_MS) {
        task.status = "pending"
        task.startedAt = undefined
      }
    }
  }
}

export function createTask(agentId: string, input: CreateTaskInput): { task: AgentTask; overflow: boolean } {
  const cleanId = normalizeAgentId(agentId)
  const type = normalizeType(input.type)

  cleanupTimeouts()

  const pendingCount = getPendingCount(cleanId)
  if (pendingCount >= MAX_PENDING_PER_AGENT) {
    return { task: null as unknown as AgentTask, overflow: true }
  }

  const task: AgentTask = {
    id: crypto.randomUUID(),
    agentId: cleanId,
    type,
    payload: input.payload,
    status: "pending",
    createdAt: Date.now(),
  }

  const db = getDb()
  db.tasks.set(task.id, task)

  const queue = db.agentQueues.get(cleanId) ?? []
  queue.push(task.id)
  db.agentQueues.set(cleanId, queue)

  return { task, overflow: false }
}

export function dequeueNextTask(agentId: string): AgentTask | null {
  const cleanId = normalizeAgentId(agentId)
  cleanupTimeouts()

  const db = getDb()
  const queue = db.agentQueues.get(cleanId) ?? []

  for (const taskId of queue) {
    const task = db.tasks.get(taskId)
    if (!task) continue

    if (task.status === "pending") {
      task.status = "running"
      task.startedAt = Date.now()
      return task
    }
  }

  return null
}

export function updateTask(
  agentId: string,
  taskId: string,
  input: UpdateTaskInput,
): AgentTask | null {
  const cleanId = normalizeAgentId(agentId)
  const db = getDb()
  const task = db.tasks.get(taskId)

  if (!task || task.agentId !== cleanId) return null
  if (task.status !== "running") return null

  const newStatus = input.status
  if (newStatus !== "completed" && newStatus !== "failed") {
    throw new Error("status must be 'completed' or 'failed'")
  }

  task.status = newStatus
  task.completedAt = Date.now()

  return task
}

export function getTask(agentId: string, taskId: string): AgentTask | null {
  const cleanId = normalizeAgentId(agentId)
  const db = getDb()
  const task = db.tasks.get(taskId)
  if (!task || task.agentId !== cleanId) return null
  return task
}

export function listAgentTasks(agentId: string): AgentTask[] {
  const cleanId = normalizeAgentId(agentId)
  const db = getDb()
  const queue = db.agentQueues.get(cleanId) ?? []
  const tasks: AgentTask[] = []
  for (const taskId of queue) {
    const task = db.tasks.get(taskId)
    if (task) tasks.push(task)
  }
  return tasks
}

export function resetTaskQueue(): void {
  const db = getDb()
  db.tasks.clear()
  db.agentQueues.clear()
}

export function getQueueStats(): {
  totalTasks: number
  totalAgents: number
  pendingTasks: number
  runningTasks: number
  completedTasks: number
  failedTasks: number
} {
  const db = getDb()
  cleanupTimeouts()

  let pending = 0
  let running = 0
  let completed = 0
  let failed = 0

  for (const task of db.tasks.values()) {
    if (task.status === "pending") pending++
    else if (task.status === "running") running++
    else if (task.status === "completed") completed++
    else if (task.status === "failed") failed++
  }

  return {
    totalTasks: db.tasks.size,
    totalAgents: db.agentQueues.size,
    pendingTasks: pending,
    runningTasks: running,
    completedTasks: completed,
    failedTasks: failed,
  }
}