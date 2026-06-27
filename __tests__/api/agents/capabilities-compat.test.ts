import { beforeEach, describe, expect, it } from "vitest"
import { GET } from "@/app/api/agents/[id]/capabilities/compat/route"
import { registerAgent, resetAgentRegistryForTests } from "@/lib/agent-registry"

function context(id: string) {
  return { params: Promise.resolve({ id }) }
}

function registerVersionedAgent(): void {
  registerAgent({
    agentId: "bot-versioned",
    model: "test-model",
    district: "research",
    capabilities: ["translate", "summarize", "classify"],
    skillVersions: [
      { id: "translate", version: "2.1.0", minCallerVersion: "1.0.0" },
      { id: "summarize", version: "3.0.0", minCallerVersion: "2.0.0" },
    ],
    status: "active",
    endpoint: "http://test",
    x402: { accepts: true },
  })
}

beforeEach(() => {
  resetAgentRegistryForTests()
})

describe("GET /api/agents/:id/capabilities/compat", () => {
  it("returns compatible when the caller satisfies every skill requirement", async () => {
    registerVersionedAgent()

    const res = await GET(
      new Request("http://localhost/api/agents/bot-versioned/capabilities/compat?callerVersion=2.0.0"),
      context("bot-versioned"),
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      compatible: true,
      skills: [
        { id: "translate", version: "2.1.0", compatible: true },
        { id: "summarize", version: "3.0.0", compatible: true },
        { id: "classify", version: "1.0.0", compatible: true },
      ],
    })
  })

  it("returns incompatible skills with their required caller range", async () => {
    registerVersionedAgent()

    const res = await GET(
      new Request("http://localhost/api/agents/bot-versioned/capabilities/compat?callerVersion=1.5.0"),
      context("bot-versioned"),
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      compatible: false,
      skills: [
        { id: "translate", version: "2.1.0", compatible: true },
        {
          id: "summarize",
          version: "3.0.0",
          compatible: false,
          requires: ">=2.0.0",
        },
        { id: "classify", version: "1.0.0", compatible: true },
      ],
    })
  })

  it.each([
    ["missing", ""],
    ["invalid", "?callerVersion=latest"],
  ])("rejects %s callerVersion", async (_name, query) => {
    registerVersionedAgent()

    const res = await GET(
      new Request(`http://localhost/api/agents/bot-versioned/capabilities/compat${query}`),
      context("bot-versioned"),
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error).toContain("callerVersion")
  })

  it("returns 404 for an unknown agent", async () => {
    const res = await GET(
      new Request("http://localhost/api/agents/unknown/capabilities/compat?callerVersion=1.0.0"),
      context("unknown"),
    )

    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({ ok: false, error: "agent not found" })
  })
})
