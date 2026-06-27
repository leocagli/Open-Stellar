import { describe, it, expect, beforeEach } from "vitest"
import {
  recordInvocation,
  listInvocations,
  getInvocationById,
  getTotalSpentByAgent,
  resetInvocationLedger,
} from "@/lib/marketplace/invocation-ledger"

describe("invocation-ledger", () => {
  beforeEach(() => {
    resetInvocationLedger()
  })

  it("records a successful invocation", () => {
    const record = recordInvocation("agent-1", "skill-a", 2.5, "tx_abc123")

    expect(record.id).toMatch(/^inv_/)
    expect(record.agentId).toBe("agent-1")
    expect(record.skillId).toBe("skill-a")
    expect(record.amountXLM).toBe(2.5)
    expect(record.txHash).toBe("tx_abc123")
    expect(record.status).toBe("success")
    expect(record.invokedAt).toBeDefined()
  })

  it("records a failed invocation", () => {
    const record = recordInvocation("agent-1", "skill-a", 1.0, "", "failed", "Network error")

    expect(record.status).toBe("failed")
    expect(record.error).toBe("Network error")
  })

  it("lists invocations newest-first", () => {
    recordInvocation("agent-1", "skill-a", 1.0, "tx1")
    recordInvocation("agent-1", "skill-b", 2.0, "tx2")
    recordInvocation("agent-2", "skill-a", 3.0, "tx3")

    const all = listInvocations()
    expect(all).toHaveLength(3)
    expect(all[0].skillId).toBe("skill-b")
    expect(all[1].skillId).toBe("skill-a")

    const filtered = listInvocations({ agentId: "agent-1" })
    expect(filtered).toHaveLength(2)
  })

  it("filters by skillId and limits results", () => {
    recordInvocation("agent-1", "skill-a", 1.0, "tx1")
    recordInvocation("agent-1", "skill-a", 2.0, "tx2")
    recordInvocation("agent-1", "skill-b", 3.0, "tx3")

    const skillA = listInvocations({ skillId: "skill-a", limit: 1 })
    expect(skillA).toHaveLength(1)
    expect(skillA[0].txHash).toBe("tx2")
  })

  it("retrieves invocation by id", () => {
    const record = recordInvocation("agent-1", "skill-a", 1.0, "tx1")
    const found = getInvocationById(record.id)

    expect(found).not.toBeNull()
    expect(found?.id).toBe(record.id)
  })

  it("calculates total spent by agent", () => {
    recordInvocation("agent-1", "skill-a", 1.0, "tx1", "success")
    recordInvocation("agent-1", "skill-b", 2.5, "tx2", "success")
    recordInvocation("agent-1", "skill-c", 3.0, "tx3", "failed")
    recordInvocation("agent-2", "skill-a", 5.0, "tx4", "success")

    expect(getTotalSpentByAgent("agent-1")).toBe(3.5)
    expect(getTotalSpentByAgent("agent-2")).toBe(5.0)
  })

  it("caps ledger at 50k entries", () => {
    for (let i = 0; i < 50_001; i++) {
      recordInvocation("agent-1", "skill-a", 0.01, `tx${i}`)
    }

    const all = listInvocations()
    expect(all).toHaveLength(50_000)
    expect(all[0].txHash).toBe("tx50000")
    expect(all[all.length - 1].txHash).toBe("tx1")
  })
})