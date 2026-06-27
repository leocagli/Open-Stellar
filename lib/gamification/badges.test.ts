import { beforeEach, describe, expect, it } from "vitest"
import { checkBadges, getAgentBadges, processBadgeEvent, resetBadgesForTests } from "@/lib/gamification/badges"
import { subscribeToSystemEvents, type PublishedSystemEvent } from "@/lib/events/system-events"

beforeEach(() => {
  resetBadgesForTests()
})

describe("badge unlocks", () => {
  it("unlocks task milestone and speed badges once", async () => {
    const first = await checkBadges("bot-1", {
      type: "task.completed",
      agentId: "bot-1",
      taskId: "task-1",
      result: { summary: "done", durationMs: 1500 },
      occurredAt: "2026-01-01T00:00:00.000Z",
    })

    expect(first.map((badge) => badge.id)).toEqual(["first-blood", "speed-demon"])

    const second = await checkBadges("bot-1", {
      type: "task.completed",
      agentId: "bot-1",
      taskId: "task-2",
      result: { summary: "done", durationMs: 1500 },
      occurredAt: "2026-01-01T00:01:00.000Z",
    })

    expect(second).toEqual([])
    expect(getAgentBadges("bot-1").map((badge) => badge.id)).toEqual(["first-blood", "speed-demon"])
  })

  it("unlocks higher task count milestones", async () => {
    for (let i = 0; i < 100; i += 1) {
      await checkBadges("bot-2", {
        type: "task.completed",
        agentId: "bot-2",
        taskId: `task-${i}`,
        result: { summary: "done", durationMs: 2500 },
      })
    }

    expect(getAgentBadges("bot-2").map((badge) => badge.id)).toContain("century")
  })

  it("publishes badge.unlocked events from processed system events", async () => {
    const events: PublishedSystemEvent[] = []
    const unsubscribe = subscribeToSystemEvents((event) => events.push(event))

    await processBadgeEvent({
      id: "payment.received:test",
      type: "payment.received",
      agentId: "bot-3",
      occurredAt: "2026-01-01T00:00:00.000Z",
      receipt: { chain: "stellar", txHash: "abc", amountUnits: "1" },
    } as PublishedSystemEvent)

    unsubscribe()
    expect(events.some((event) => event.type === "badge.unlocked" && event.agentId === "bot-3")).toBe(true)
  })

  it("unlocks multi-tasker after five simultaneous task starts", async () => {
    for (let i = 0; i < 5; i += 1) {
      await checkBadges("bot-4", {
        type: "task.started",
        agentId: "bot-4",
        task: { id: `task-${i}`, title: `Task ${i}` },
      })
    }

    expect(getAgentBadges("bot-4").map((badge) => badge.id)).toContain("multi-tasker")
  })
})
