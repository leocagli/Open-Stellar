import { beforeEach, describe, expect, it } from "vitest"
import { GET as listSkillsRoute, POST as createSkillRoute } from "@/app/api/marketplace/skills/route"
import { DELETE as deactivateSkillRoute } from "@/app/api/marketplace/skills/[skillId]/route"
import { resetSkillStoreForTests } from "@/lib/marketplace/skill-store"

function makeRequest(url: string, init: RequestInit = {}) {
  return new Request(url, init)
}

async function createSkill(overrides: Record<string, unknown> = {}) {
  const req = makeRequest("http://localhost/api/marketplace/skills", {
    method: "POST",
    body: JSON.stringify({
      name: "pdf-to-text",
      description: "Extract text from PDF files",
      priceXLM: 1,
      callUrl: "https://example.com/skills/pdf-to-text",
      ...overrides,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-agent-id": "agent-1",
    },
  })

  const res = await createSkillRoute(req)
  const payload = await res.json()
  return { res, payload }
}

describe("Marketplace skill routes", () => {
  beforeEach(() => {
    resetSkillStoreForTests()
  })

  it("creates a skill and exposes it in listings", async () => {
    const { res, payload } = await createSkill()

    expect(res.status).toBe(201)
    expect(payload.ok).toBe(true)
    expect(payload.skill.active).toBe(true)

    const listRes = await listSkillsRoute(makeRequest("http://localhost/api/marketplace/skills"))
    const listPayload = await listRes.json()

    expect(listRes.status).toBe(200)
    expect(listPayload.ok).toBe(true)
    expect(listPayload.skills).toHaveLength(1)
    expect(listPayload.skills[0].id).toBe(payload.skill.id)
  })

  it("filters skills by maxPriceXLM", async () => {
    await createSkill({ name: "cheap-skill", priceXLM: 0.5 })
    await createSkill({ name: "expensive-skill", priceXLM: 2 })

    const listRes = await listSkillsRoute(makeRequest("http://localhost/api/marketplace/skills?maxPriceXLM=1"))
    const listPayload = await listRes.json()

    expect(listRes.status).toBe(200)
    expect(listPayload.skills).toHaveLength(1)
    expect(listPayload.skills[0].name).toBe("cheap-skill")
  })

  it("deactivates skills so they disappear from listings", async () => {
    const { payload } = await createSkill()

    const deleteRes = await deactivateSkillRoute(
      makeRequest("http://localhost/api/marketplace/skills/skill-1", { method: "DELETE", headers: { "x-agent-id": "agent-1" } }),
      { params: Promise.resolve({ skillId: payload.skill.id }) },
    )
    const deletePayload = await deleteRes.json()

    expect(deleteRes.status).toBe(200)
    expect(deletePayload.ok).toBe(true)
    expect(deletePayload.skill.active).toBe(false)

    const listRes = await listSkillsRoute(makeRequest("http://localhost/api/marketplace/skills"))
    const listPayload = await listRes.json()

    expect(listPayload.skills).toHaveLength(0)
  })

  it("enforces the 20-skill limit per agent", async () => {
    for (let index = 0; index < 20; index += 1) {
      const { res } = await createSkill({ name: `skill-${index}`, priceXLM: 1 })
      expect(res.status).toBe(201)
    }

    const { res, payload } = await createSkill({ name: "skill-20", priceXLM: 1 })

    expect(res.status).toBe(429)
    expect(payload.ok).toBe(false)
    expect(payload.error).toMatch(/20 active skills/i)
  })
})
