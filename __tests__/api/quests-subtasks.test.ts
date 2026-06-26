import { describe, expect, it } from "vitest"

import { POST as applyQuestRoute } from "@/app/api/quests/[id]/apply/route"
import { POST as createSubTaskRoute } from "@/app/api/quests/[id]/subtasks/route"
import { PATCH as updateSubTaskRoute } from "@/app/api/quests/[id]/subtasks/[subtaskId]/route"
import { getQuestById, getSubTasks } from "@/lib/gamification/quests"

const context = (id: string) => ({ params: Promise.resolve({ id }) })
const subtaskContext = (id: string, subtaskId: string) => ({
  params: Promise.resolve({ id, subtaskId }),
})

function makeCreateRequest(body: object): Request {
  return new Request("http://localhost/api/quests/weekly-onboard-marketplace-service/subtasks", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

function makeUpdateRequest(body: object): Request {
  return new Request("http://localhost/api/quests/weekly-onboard-marketplace-service/subtasks/some-id", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

function makeApplyRequest(actorId: string): Request {
  return new Request("http://localhost/api/quests/weekly-onboard-marketplace-service/apply", {
    method: "POST",
    body: JSON.stringify({ actorId }),
    headers: { "Content-Type": "application/json" },
  })
}

describe("Quest Subtasks API", () => {
  const questId = "weekly-onboard-marketplace-service"

  it("POST /api/quests/[id]/subtasks creates a sub-task with a unique ID", async () => {
    const res = await createSubTaskRoute(
      makeCreateRequest({ title: "Setup service metadata", assignedAgentId: "agent-123" }),
      context(questId)
    )
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.ok).toBe(true)
    expect(data.subTask.id).toBeDefined()
    expect(data.subTask.title).toBe("Setup service metadata")
    expect(data.subTask.assignedAgentId).toBe("agent-123")
    expect(data.subTask.status).toBe("pending")
  })

  it("PATCH updates status and assignment; completing all sub-tasks marks parent quest complete", async () => {
    const subTasksBefore = getSubTasks(questId)
    expect(subTasksBefore.length).toBeGreaterThan(0)
    const firstSubTask = subTasksBefore[0]

    const resCreate = await createSubTaskRoute(
      makeCreateRequest({ title: "Deploy smart contract" }),
      context(questId)
    )
    const createData = await resCreate.json()
    const secondSubTask = createData.subTask

    let parentQuest = getQuestById(questId)
    expect(parentQuest).toBeDefined()
    expect(parentQuest?.progress).toBeLessThan(100)
    expect(parentQuest?.status).toBe("in_progress")
    expect(parentQuest?.completedAt).toBeUndefined()

    const resPatch1 = await updateSubTaskRoute(
      makeUpdateRequest({ status: "done" }),
      subtaskContext(questId, firstSubTask.id)
    )
    const patchData1 = await resPatch1.json()
    expect(resPatch1.status).toBe(200)
    expect(patchData1.subTask.status).toBe("done")
    expect(patchData1.subTask.completedAt).toBeDefined()

    parentQuest = getQuestById(questId)
    expect(parentQuest?.status).toBe("in_progress")
    expect(parentQuest?.progress).toBe(50)
    expect(parentQuest?.completedAt).toBeUndefined()

    const resApplyFail = await applyQuestRoute(
      makeApplyRequest("test-actor"),
      context(questId)
    )
    expect(resApplyFail.status).toBe(400)
    const applyFailData = await resApplyFail.json()
    expect(applyFailData.ok).toBe(false)
    expect(applyFailData.error).toContain("Cannot complete quest with pending sub-tasks")

    const resPatch2 = await updateSubTaskRoute(
      makeUpdateRequest({ status: "done", assignedAgentId: "agent-456" }),
      subtaskContext(questId, secondSubTask.id)
    )
    const patchData2 = await resPatch2.json()
    expect(resPatch2.status).toBe(200)
    expect(patchData2.subTask.status).toBe("done")
    expect(patchData2.subTask.assignedAgentId).toBe("agent-456")

    parentQuest = getQuestById(questId)
    expect(parentQuest?.status).toBe("completed")
    expect(parentQuest?.progress).toBe(100)
    expect(parentQuest?.completedAt).toBeDefined()
  })
})
